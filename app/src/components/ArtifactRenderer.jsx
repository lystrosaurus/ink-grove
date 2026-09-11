import { useEffect, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import bridge from '../generated/bridge.js'
import { Link } from '../context.jsx'

function MarkdownLink({ node, href, children, ...props }) {
  if (!href) return <span {...props}>{children}</span>
  try {
    const target = new URL(href, window.location.href)
    if (!['http:', 'https:', 'mailto:'].includes(target.protocol))
      return <span {...props}>{children}</span>
    if (
      target.origin === window.location.origin &&
      (target.pathname === '/' ||
        /^\/(?:artifact|concept|collections|connections|explore|create|journeys)(?:\/|$)/.test(
          target.pathname,
        ))
    ) {
      return (
        <Link {...props} to={`${target.pathname}${target.search}${target.hash}`}>
          {children}
        </Link>
      )
    }
    return (
      <a {...props} href={target.href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    )
  } catch {
    return <span {...props}>{children}</span>
  }
}

export default function ArtifactRenderer({
  artifact,
  frameRef,
  scrollRef,
  onReady,
  onScroll,
  preview = false,
}) {
  const { renderer, src, content } = artifact.artifact
  const [body, setBody] = useState(content ?? '')
  const [error, setError] = useState('')
  const [loaded, setLoaded] = useState(content !== undefined)
  useEffect(() => {
    setError('')
    if (content !== undefined) {
      setBody(content)
      setLoaded(true)
      return
    }
    if (renderer !== 'markdown') {
      setLoaded(true)
      return
    }
    const controller = new AbortController()
    setLoaded(false)
    fetch(src, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('作品暂时无法加载')
        return response.text()
      })
      .then((text) => {
        setBody(text)
        setLoaded(true)
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setError(error.message)
      })
    return () => controller.abort()
  }, [renderer, src, content])
  const html = useMemo(() => {
    if (renderer !== 'html' || content === undefined) return undefined
    return /<\/body>/i.test(content)
      ? content.replace(/<\/body>/i, () => `${bridge}</body>`)
      : `${content}${bridge}`
  }, [content, renderer])
  const imageUrl = useMemo(() => {
    if (renderer === 'svg' && content !== undefined)
      return URL.createObjectURL(new Blob([content], { type: 'image/svg+xml' }))
    return content || src
  }, [renderer, content, src])
  useEffect(
    () => () => {
      if (imageUrl?.startsWith('blob:')) URL.revokeObjectURL(imageUrl)
    },
    [imageUrl],
  )
  useEffect(() => {
    if (loaded && renderer === 'markdown') onReady?.()
  }, [loaded, renderer, body])
  if (error)
    return (
      <div className="renderer-error" role="alert">
        <h2>这份作品暂时没有打开</h2>
        <p>{error}</p>
        <button className="button secondary" onClick={() => window.location.reload()}>
          重新载入
        </button>
      </div>
    )
  if (renderer === 'html')
    return (
      <iframe
        ref={frameRef}
        className="artifact-frame"
        title={`${artifact.title} · 独立知识作品`}
        sandbox="allow-scripts"
        src={content === undefined ? src : undefined}
        srcDoc={html}
        onLoad={onReady}
      />
    )
  if (renderer === 'markdown')
    return (
      <div
        ref={scrollRef}
        className={`markdown-artifact renderer-scroll ${preview ? 'preview-document' : ''}`}
        onScroll={onScroll}
      >
        {!loaded ? (
          <div className="loading-seed">正在展开这份思想…</div>
        ) : (
          <article className="markdown-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml components={{ a: MarkdownLink }}>
              {body}
            </ReactMarkdown>
          </article>
        )}
      </div>
    )
  if (renderer === 'image' || renderer === 'svg')
    return (
      <div
        ref={scrollRef}
        className={`image-artifact renderer-scroll ${renderer}`}
        onScroll={onScroll}
      >
        <img
          src={imageUrl}
          alt={artifact.subtitle || artifact.title}
          onLoad={onReady}
          onError={() => setError('无法读取图片内容，请检查作品文件。')}
        />
      </div>
    )
  return (
    <div className="renderer-error" role="alert">
      暂不支持这种作品格式：{renderer}
    </div>
  )
}
