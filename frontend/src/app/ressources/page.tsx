export default function ResourcesPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[80vh] px-6">
      <div className="max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-6">Ressourcen & Unterstützung</h1>
        <p className="mb-8 text-gray-700">
          Auf dieser Seite findest du hilfreiche Informationen und externe Angebote 
          rund um mentale Gesundheit und Unterstützung. 
          Bei akuter Belastung wende dich bitte sofort an eine professionelle Stelle.
        </p>

        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Akute Hilfe</h2>
            <p>
              In Deutschland erreichst du den Notruf unter <strong>112</strong>. <br/>
              Telefonseelsorge: <strong>0800 111 0 111</strong> oder <strong>0800 111 0 222</strong> (kostenlos, rund um die Uhr).
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Beratungsstellen</h2>
            <p>
              - <a href="https://www.telefonseelsorge.de" className="text-blue-600 underline">Telefonseelsorge</a><br/>
              - <a href="https://www.nummergegenkummer.de" className="text-blue-600 underline">Nummer gegen Kummer</a><br/>
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Wissen & Prävention</h2>
            <p>
              - <a href="https://www.psychenet.de" className="text-blue-600 underline">Psychenet</a><br/>
              - <a href="https://www.deutsche-depressionshilfe.de" className="text-blue-600 underline">Deutsche Depressionshilfe</a><br/>
              - <a href="https://www.mentalhealth.org.uk" className="text-blue-600 underline">Mental Health Foundation</a>
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
