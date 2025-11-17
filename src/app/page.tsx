import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-7xl mx-auto px-4 py-16 w-full">
        <div className="flex justify-end mb-4">
          <Link
            href="/admin"
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-lg font-semibold
                       transition-colors duration-200 flex items-center gap-2"
          >
            <span>⚙️</span>
            Campaign Manager
          </Link>
        </div>
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-purple-primary to-purple-dark bg-clip-text text-transparent">
            DM Campaign Manager
          </h1>
          <p className="text-xl text-gray-400">
            Select a campaign below to begin your adventure
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Court of Thorns and Mire Campaign Card */}
          <Link href="/campaigns/court-of-thorns-mire">
            <div className="group relative overflow-hidden rounded-xl border-2 border-purple-500/20
                          hover:border-purple-500 transition-all duration-300
                          hover:shadow-xl hover:shadow-purple-500/50 cursor-pointer">
              <div className="relative h-64 bg-gradient-to-br from-purple-900/40 to-pink-900/40">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <h3 className="absolute bottom-4 left-4 text-2xl font-bold text-white">
                  The Court of Thorns and Mire
                </h3>
              </div>

              <div className="p-6 bg-gray-900/50">
                <p className="text-purple-400 font-semibold mb-2">A Romantasy One-Shot Adventure</p>
                <p className="text-sm text-gray-300 mb-4">
                  Hunt for survival when a winged creature steals a baron&apos;s daughter.
                  Venture into Fae-claimed Wastelands with Seraphine, a disgraced Royal Ranger.
                </p>

                <div className="flex gap-2 text-xs flex-wrap">
                  <span className="px-2 py-1 bg-purple-500/20 rounded">Level 4</span>
                  <span className="px-2 py-1 bg-purple-500/20 rounded">Romantasy</span>
                  <span className="px-2 py-1 bg-purple-500/20 rounded">4-6 hours</span>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="border-t border-gray-800 pt-16 mt-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Interactive Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-lg bg-gray-900/50 border border-purple-500/20">
              <div className="text-4xl mb-3">🎲</div>
              <h3 className="font-bold mb-2">Auto-Detecting Dice Roller</h3>
              <p className="text-sm text-gray-400">
                Click any dice notation (1d20, 2d6+3, etc.) to roll instantly
              </p>
            </div>
            <div className="p-6 rounded-lg bg-gray-900/50 border border-purple-500/20">
              <div className="text-4xl mb-3">🖼️</div>
              <h3 className="font-bold mb-2">Image Lightbox</h3>
              <p className="text-sm text-gray-400">
                Click any image to view in full-screen
              </p>
            </div>
            <div className="p-6 rounded-lg bg-gray-900/50 border border-purple-500/20">
              <div className="text-4xl mb-3">💾</div>
              <h3 className="font-bold mb-2">State Persistence</h3>
              <p className="text-sm text-gray-400">
                Dice history, preferences, and progress saved locally
              </p>
            </div>
            <div className="p-6 rounded-lg bg-gray-900/50 border border-purple-500/20">
              <div className="text-4xl mb-3">📱</div>
              <h3 className="font-bold mb-2">Mobile Responsive</h3>
              <p className="text-sm text-gray-400">
                Run sessions from tablets or phones
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          <p>Built with Next.js, React, and TypeScript</p>
        </div>
      </footer>
    </div>
  )
}
