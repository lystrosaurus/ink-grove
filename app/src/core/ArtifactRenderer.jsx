import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import bridge from '../generated/bridge.js'
import './image-reader.css'

function ImageReader({ artifact, imageUrl, scrollRef, onReady, onScroll, onError, preview }) {
  const [scale, setScale] = useState(1)
  const viewport = useRef(null)
  const hintId = useId()
  const attachViewport = useCallback(
    (node) => {
      viewport.current = node
      if (typeof scrollRef === 'function') scrollRef(node)
      else if (scrollRef) scrollRef.current = node
    },
    [scrollRef],
  )
  function reset() {
    setScale(1)
    viewport.current?.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }
  return (
    <div className={`image-reader ${preview ? 'preview-image' : ''}`}>
      <div className="image-controls" role="group" aria-label="图片缩放">
        <button
          type="button"
          aria-label="缩小图片"
          disabled={scale === 1}
          onClick={() => setScale((value) => Math.max(1, value - 1))}
        >
          − 缩小
        </button>
        <output aria-live="polite" aria-label="图片缩放比例">
          {scale * 100}%
        </output>
        <button
          type="button"
          aria-label="放大图片"
          disabled={scale === 4}
          onClick={() => setScale((value) => Math.min(4, value + 1))}
        >
          ＋ 放大
        </button>
        <button type="button" aria-label="还原图片大小" onClick={reset}>
          还原
        </button>
      </div>
      <p className="image-scroll-hint" id={hintId}>
        放大后可在图片内滚动查看，也可聚焦图片后用方向键移动。
      </p>
      <div
        ref={attachViewport}
        className={`image-artifact renderer-scroll ${artifact.artifact.renderer}`}
        role="region"
        aria-label="图片阅读区域"
        aria-describedby={hintId}
        tabIndex={0}
        onScroll={onScroll}
      >
        <div className="image-canvas" style={{ width: `${scale * 100}%` }}>
          <img
            src={imageUrl}
            alt={artifact.subtitle || artifact.title}
            onLoad={onReady}
            onError={onError}
          />
        </div>
      </div>
    </div>
  )
}

function MarkdownLink({ node, href, children, InternalLink, ...props }) {
  if (!href) return <span {...props}>{children}</span>
  try {
    const target = new URL(href, window.location.href)
    if (!['http:', 'https:', 'mailto:'].includes(target.protocol))
      return <span {...props}>{children}</span>
    if (
      InternalLink &&
      target.origin === window.location.origin &&
      (target.pathname === '/' ||
        /^\/(?:artifact|concept|collections|connections|explore|create|journeys)(?:\/|$)/.test(
          target.pathname,
        ))
    ) {
      return (
        <InternalLink {...props} to={`${target.pathname}${target.search}${target.hash}`}>
          {children}
        </InternalLink>
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
  frameTitle,
  InternalLink,
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
        title={frameTitle || `${artifact.title} · 独立知识作品`}
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
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              skipHtml
              components={{ a: (props) => <MarkdownLink {...props} InternalLink={InternalLink} /> }}
            >
              {body}
            </ReactMarkdown>
          </article>
        )}
      </div>
    )
  if (renderer === 'image' || renderer === 'svg')
    return (
      <ImageReader
        key={`${artifact.id}:${imageUrl}`}
        artifact={artifact}
        imageUrl={imageUrl}
        scrollRef={scrollRef}
        onReady={onReady}
        onScroll={onScroll}
        onError={() => setError('无法读取图片内容，请检查作品文件。')}
        preview={preview}
      />
    )
  return (
    <div className="renderer-error" role="alert">
      暂不支持这种作品格式：{renderer}
    </div>
  )
}
