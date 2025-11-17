'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { title: 'Campaign Home', href: '/campaigns/sample-campaign' },
  { title: 'Scenes', href: '/campaigns/sample-campaign/scenes' },
  { title: 'Monsters', href: '/campaigns/sample-campaign/reference/monsters' },
  { title: 'Reference', href: '/campaigns/sample-campaign/reference' },
]

export default function CampaignLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-800 sticky top-0 h-screen overflow-y-auto bg-gray-900/50">
        <div className="p-6" style={{ borderLeftColor: '#47bd90' }}>
          <h2 className="text-xl font-bold mb-4" style={{ color: '#47bd90' }}>
            sample campaign
          </h2>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-2 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                  style={isActive ? { color: '#47bd90' } : {}}
                >
                  {item.title}
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-4xl mx-auto p-8 prose prose-invert prose-purple max-w-none">
          {children}
        </div>
      </main>
    </div>
  )
}
