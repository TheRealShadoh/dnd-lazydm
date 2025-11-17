import Link from 'next/link'

const scenes = [
  { title: 'Campaign Home', href: '/campaigns/court-of-thorns-mire' },
  { title: 'Scene 1: One Bed Trope', href: '/campaigns/court-of-thorns-mire/scenes/one-bed-trope' },
  { title: 'Scene 2: Warded Ruins', href: '/campaigns/court-of-thorns-mire/scenes/warded-ruins' },
  { title: 'Scene 3: Mire Ambush', href: '/campaigns/court-of-thorns-mire/scenes/mire-ambush' },
  { title: 'Scene 3.5: Sphinx Riddle', href: '/campaigns/court-of-thorns-mire/scenes/sphinx-riddle' },
  { title: 'Scene 4: Boss Fight', href: '/campaigns/court-of-thorns-mire/scenes/boss-fight' },
  { title: 'Scene 5: Aftermath', href: '/campaigns/court-of-thorns-mire/scenes/aftermath' },
]

const reference = [
  { title: 'Monster Stats', href: '/campaigns/court-of-thorns-mire/reference/monsters' },
  { title: 'Romantasy Mechanics', href: '/campaigns/court-of-thorns-mire/reference/mechanics' },
]

export default function CampaignLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-gray-800 bg-gray-950 sticky top-0 h-screen overflow-y-auto hidden lg:block">
        <div className="p-6">
          <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors mb-2 block">
            ← Back to Home
          </Link>
          <Link href="/admin/campaigns/court-of-thorns-mire" className="text-sm text-purple-400 hover:text-purple-300 transition-colors mb-4 block">
            ⚙️ Manage Campaign
          </Link>

          <h2 className="text-lg font-bold bg-gradient-to-r from-purple-primary to-purple-dark bg-clip-text text-transparent mb-6">
            Court of Thorns and Mire
          </h2>

          <nav className="space-y-6">
            <div>
              <Link
                href="/campaigns/court-of-thorns-mire/characters"
                className="block px-3 py-2 rounded text-sm font-semibold text-purple-400 hover:bg-purple-500/10 transition-colors"
              >
                👥 Party Characters
              </Link>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Scenes
              </h3>
              <ul className="space-y-1">
                {scenes.map((scene) => (
                  <li key={scene.href}>
                    <Link
                      href={scene.href}
                      className="block px-3 py-2 rounded text-sm text-gray-300 hover:bg-purple-500/10 hover:text-purple-400 transition-colors"
                    >
                      {scene.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Reference
              </h3>
              <ul className="space-y-1">
                {reference.map((ref) => (
                  <li key={ref.href}>
                    <Link
                      href={ref.href}
                      className="block px-3 py-2 rounded text-sm text-gray-300 hover:bg-purple-500/10 hover:text-purple-400 transition-colors"
                    >
                      {ref.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="border-b border-gray-800 bg-gray-950 lg:hidden">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-2">
              <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm">
                ← Back to Home
              </Link>
              <Link href="/admin/campaigns/court-of-thorns-mire" className="text-purple-400 hover:text-purple-300 transition-colors text-sm">
                ⚙️ Manage
              </Link>
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-purple-primary to-purple-dark bg-clip-text text-transparent">
              Court of Thorns and Mire
            </h1>
          </div>
        </header>

        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
          <article className="prose prose-lg prose-invert prose-purple max-w-none">
            {children}
          </article>
        </main>

        <footer className="border-t border-gray-800 mt-16 py-8">
          <div className="max-w-4xl mx-auto px-4 text-center text-gray-400 text-sm">
            <p>The Court of Thorns and Mire - A Romantasy D&D Adventure</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
