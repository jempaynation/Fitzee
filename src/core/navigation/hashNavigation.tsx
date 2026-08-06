import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react'
import {
  HashNavigationContext,
  type NavigateOptions,
} from './hashNavigationContext'
import { useHashNavigation } from './useHashNavigation'

function normalizePath(path: string): string {
  const withoutHash = path.replace(/^#/, '')
  if (!withoutHash || withoutHash === '/') return '/'
  return withoutHash.startsWith('/') ? withoutHash : `/${withoutHash}`
}

function readHashPath(): string {
  return normalizePath(window.location.hash)
}

export function HashNavigationProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(readHashPath)
  const [historyDepth, setHistoryDepth] = useState(0)

  useEffect(() => {
    const syncPath = () => setPath(readHashPath())
    window.addEventListener('hashchange', syncPath)
    window.addEventListener('popstate', syncPath)
    return () => {
      window.removeEventListener('hashchange', syncPath)
      window.removeEventListener('popstate', syncPath)
    }
  }, [])

  const navigate = useCallback((to: string, options: NavigateOptions = {}) => {
    const nextPath = normalizePath(to)
    const nextUrl = `${window.location.pathname}${window.location.search}#${nextPath}`

    if (options.replace) {
      window.history.replaceState(window.history.state, '', nextUrl)
    } else {
      window.history.pushState(window.history.state, '', nextUrl)
      setHistoryDepth((depth) => depth + 1)
    }
    setPath(nextPath)
  }, [])

  const goBack = useCallback(() => {
    if (historyDepth > 0) {
      setHistoryDepth((depth) => Math.max(0, depth - 1))
      window.history.back()
      return
    }
    navigate('/home', { replace: true })
  }, [historyDepth, navigate])

  const value = useMemo(
    () => ({ path, navigate, goBack }),
    [goBack, navigate, path],
  )

  return (
    <HashNavigationContext.Provider value={value}>
      {children}
    </HashNavigationContext.Provider>
  )
}

interface HashLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: string
}

export function HashLink({ to, onClick, ...props }: HashLinkProps) {
  const { navigate } = useHashNavigation()

  const followLink = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return
    }
    event.preventDefault()
    navigate(to)
  }

  return <a {...props} href={`#${normalizePath(to)}`} onClick={followLink} />
}
