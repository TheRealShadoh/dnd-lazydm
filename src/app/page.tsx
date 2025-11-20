import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-7xl mx-auto px-4 py-16 w-full">
        <div className="flex justify-end mb-4">
          <Link
            href="/admin"
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 rounded-lg font-semibold
                       transition-colors duration-200"
          >
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
              <div className="w-12 h-12 mb-3 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="font-bold mb-2">Auto-Detecting Dice Roller</h3>
              <p className="text-sm text-gray-400">
                Click any dice notation (1d20, 2d6+3, etc.) to roll instantly
              </p>
            </div>
            <div className="p-6 rounded-lg bg-gray-900/50 border border-purple-500/20">
              <div className="w-12 h-12 mb-3 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-bold mb-2">Image Lightbox</h3>
              <p className="text-sm text-gray-400">
                Click any image to view in full-screen
              </p>
            </div>
            <div className="p-6 rounded-lg bg-gray-900/50 border border-purple-500/20">
              <div className="w-12 h-12 mb-3 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              </div>
              <h3 className="font-bold mb-2">State Persistence</h3>
              <p className="text-sm text-gray-400">
                Dice history, preferences, and progress saved locally
              </p>
            </div>
            <div className="p-6 rounded-lg bg-gray-900/50 border border-purple-500/20">
              <div className="w-12 h-12 mb-3 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
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
