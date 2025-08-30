import re
from typing import List, Optional, Dict

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from langchain_ollama import ChatOllama
from langchain_core.prompts import (
    ChatPromptTemplate,
    MessagesPlaceholder,
    PromptTemplate,
)
from langchain_core.chat_history import InMemoryChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory


llm = ChatOllama(model="llama3.1:8b", temperature=0.0, top_p=0.9)


system_text = """Du bist „MindFirst“, ein empathischer, nicht-medizinischer Begleiter.
Antworte in 60–120 Wörtern mit natürlicher Sprache und ohne Aufzählungszeichen/Ziffern.
Struktur (implizit, aber nicht nummeriert):
- Validieren (benenne Gefühl/Belastung).
- Spiegeln/Reframing (neutral, respektvoll).
- Eine offene Frage (max. eine).
- Optional ein sanfter Coping-Impuls (Atmung, Mini-Schritt, Journaling).

WICHTIG:
- Kein medizinischer Rat/Diagnosen.
- Keine Sätze wie „Ich kann dir nicht helfen“ oder „Das darf ich nicht“.
  Stattdessen: empathisch bleiben und auf Hilfsangebote verweisen, wenn nötig.
- Keine Versprechen, keine Floskeln wie „alles wird gut“.
- Klare, warme Sprache auf Deutsch.
"""

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system_text),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{input}"),
    ]
)


store: Dict[str, InMemoryChatMessageHistory] = {}


def get_history(session_id: str) -> InMemoryChatMessageHistory:
    if session_id not in store:
        store[session_id] = InMemoryChatMessageHistory()
    return store[session_id]


# Generated with AI
CRITICAL_PATTERNS: List[re.Pattern] = [
    re.compile(
        r"\b(suizid|selbstmord|mich\s*(?:umbringen|töten)|leben\s*hat\s*keinen\s*sinn)\b",
        re.I,
    ),
    re.compile(r"\b(keine\s*hoffnung|hoffnungslos|es\s*ist\s*egal)\b", re.I),
    re.compile(r"\b(ritzen|selbstverletz|klinge|schnitt[e]?|blut(en)?)\b", re.I),
    re.compile(r"\b(ich\s*will\s*nicht\s*mehr\s*leben)\b", re.I),
    re.compile(r"\b(kill myself|suicide|self[-\s]?harm|end my life)\b", re.I),
]

# Generated with AI
DEESCALATE_PATTERNS: List[re.Pattern] = [
    re.compile(
        r"\b(es\s*geht\s*wieder|mir\s*geht\s*es\s*besser|ist\s*besser\s*geworden)\b",
        re.I,
    ),
    re.compile(r"\b(keine\s*suizidgedanken|keine\s*absicht|bin\s*sicher)\b", re.I),
    re.compile(r"\b(danke,\s*geht|alles\s*gut\s*jetzt)\b", re.I),
]


def rule_hits(text: str) -> bool:
    t = text or ""
    return any(p.search(t) for p in CRITICAL_PATTERNS)


def rule_deescalates(text: str) -> bool:
    t = text or ""
    return any(p.search(t) for p in DEESCALATE_PATTERNS)


detection_prompt = PromptTemplate.from_template(
    """
Du bist ein Sicherheits-Classifier.
Prüfe NUR die JETZT erhaltene USER-NACHRICHT (nicht den bisherigen Verlauf):
"{last_user}"

Frage: Enthält diese Nachricht akute Anzeichen für
- Suizidgedanken/-absichten,
- Selbstgefährdung,
- konkrete Pläne/Hoffnungslosigkeit?

Antworte EXAKT mit JA oder NEIN.
""".strip()
)
detection_chain = detection_prompt | llm

chain = prompt | llm
chain_with_memory = RunnableWithMessageHistory(
    chain,
    get_history,
    input_messages_key="input",
    history_messages_key="history",
)

_session_escalation: Dict[str, bool] = {}


def get_escalation(session_id: str) -> bool:
    return _session_escalation.get(session_id, False)


def set_escalation(session_id: str, value: bool) -> None:
    _session_escalation[session_id] = value


def strip_think_tags(text: str) -> str:
    return re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()


app = FastAPI(title="MindFirst", version="0.3")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = "demo"


class ChatResponse(BaseModel):
    reply: str
    escalation: bool


class HistoryItem(BaseModel):
    role: str  # "user" | "assistant" | "system"
    content: str
    created_at: Optional[float] = None


class HistoryResponse(BaseModel):
    session_id: str
    messages: List[HistoryItem]


@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(payload: ChatRequest):
    session_id = payload.session_id or "demo"
    last_user = payload.message.strip()

    rule_now = rule_hits(last_user)
    deescalate_now = rule_deescalates(last_user)

    det = detection_chain.invoke({"last_user": last_user})
    det_label = (det.content or "").strip().upper()
    llm_now = det_label.startswith("JA")

    current_escalation = bool(rule_now or llm_now)

    prev = get_escalation(session_id)
    if prev and deescalate_now and not current_escalation:
        current_escalation = False

    set_escalation(session_id, current_escalation)

    reply_msg = chain_with_memory.invoke(
        {"input": last_user},
        config={"configurable": {"session_id": session_id}},
    )
    clean_reply = strip_think_tags(reply_msg.content)

    if current_escalation:
        clean_reply += (
            "\n\n**Wenn es sich akut anfühlt:** Du kannst rund um die Uhr Hilfe bekommen – "
            "z. B. TelefonSeelsorge 0800 111 0 111 / 0800 111 0 222, oder 112 im Notfall."
        )

    return ChatResponse(reply=clean_reply, escalation=current_escalation)
