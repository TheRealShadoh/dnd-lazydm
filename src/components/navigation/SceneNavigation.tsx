import Link from 'next/link'

interface SceneNavigationProps {
  previousHref?: string
  previousTitle?: string
  nextHref?: string
  nextTitle?: string
}

export function SceneNavigation({
  previousHref,
  previousTitle,
  nextHref,
  nextTitle,
}: SceneNavigationProps) {
  return (
    <div className="not-prose border-t border-gray-800 pt-8 mt-16">
      <div className="flex justify-between items-center gap-4">
        <div className="flex-1">
          {previousHref && previousTitle && (
            <Link
              href={previousHref}
              className="group block p-4 rounded-lg border border-gray-800 hover:border-purple-500 transition-colors"
            >
              <div className="text-sm text-gray-500 mb-1">← Previous</div>
              <div className="font-semibold text-gray-300 group-hover:text-purple-400 transition-colors">
                {previousTitle}
              </div>
            </Link>
          )}
        </div>

        <div className="flex-1 text-right">
          {nextHref && nextTitle && (
            <Link
              href={nextHref}
              className="group block p-4 rounded-lg border border-gray-800 hover:border-purple-500 transition-colors"
            >
              <div className="text-sm text-gray-500 mb-1">Next →</div>
              <div className="font-semibold text-gray-300 group-hover:text-purple-400 transition-colors">
                {nextTitle}
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
