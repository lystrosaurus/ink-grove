import { createContext, useContext } from 'react'

export const GroveContext = createContext(null)
export const useGrove = () => useContext(GroveContext)

export const TYPES = {
  all: '全部作品',
  book: '书籍',
  idea: '思想',
  person: '人物',
  history: '历史',
  system: '系统',
  synthesis: '贯通',
}
export const TYPE_EN = {
  book: 'BOOK',
  idea: 'IDEA',
  person: 'PERSON',
  history: 'HISTORY',
  system: 'SYSTEM',
  synthesis: 'SYNTHESIS',
}
export const RELATIONS = {
  related: '彼此关联',
  extends: '延伸',
  contrasts: '对照',
  supports: '支持',
  applies: '应用',
  'derived-from': '源自',
  synthesizes: '贯通',
  'inspired-by': '启发',
}

export function Link({ to, children, onClick, ...props }) {
  const { go } = useGrove()
  return (
    <a
      href={to}
      {...props}
      onClick={(event) => {
        onClick?.(event)
        if (
          !event.defaultPrevented &&
          !event.metaKey &&
          !event.ctrlKey &&
          !event.shiftKey &&
          event.button === 0
        ) {
          event.preventDefault()
          go(to)
        }
      }}
    >
      {children}
    </a>
  )
}

export function artifactUrl(artifact) {
  return `/artifact/${encodeURIComponent(artifact.slug || artifact.id)}`
}
