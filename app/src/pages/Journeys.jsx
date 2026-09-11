import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, Leaf } from 'lucide-react'
import { Link, artifactUrl, useGrove } from '../context.jsx'
import { EmptyState } from '../components/Shared.jsx'
import '../journeys.css'

const growthPath = [
  {
    id: 'cognitive-awakening',
    phase: '觉察',
    english: 'AWARENESS',
    question: '改变自己，从看见自己开始。',
    narrative:
      '留意注意力去了哪里，情绪怎样影响判断，以及哪些选择早已变成惯性。当你看见这些悄然发生的过程，就能在反应之前，给自己留出一点选择的空间。',
    next: '看见惯性之后，还需要一个稳定的方向。下一步，用原则回答「我真正想成为怎样的人」。',
  },
  {
    id: 'seven-habits',
    phase: '原则',
    english: 'PRINCIPLES',
    question: '知道什么重要，才知道如何选择。',
    narrative:
      '从积极主动、以终为始，到要事第一，试着把注意力交还给真正重要的事。再从独立走向互赖，让个人选择与长期合作，成为同一套生活原则。',
    next: '原则指向你想抵达的地方。接下来，把这个方向拆成一个可以训练、可以反馈的具体能力。',
  },
  {
    id: 'deliberate-practice',
    phase: '能力',
    english: 'PRACTICE',
    question: '把想要的改变，变成能够练习的动作。',
    narrative:
      '找到当前的能力边界，拆出一个具体的薄弱环节。在学习区尝试，通过反馈看见误差，再带着修正进入下一轮。让每一次努力，都留下可观察的变化。',
    next: '能力逐渐形成之后，新的问题出现了：怎样让它持续创造价值，同时为生活留下更多自由？',
  },
  {
    id: 'naval-almanack',
    phase: '自由',
    english: 'FREEDOM',
    question: '让长期积累，换来更多时间与选择。',
    narrative:
      '从独特专长出发，思考判断力、责任与杠杆如何相互配合。把能力沉淀成可以复用的作品与系统，让长期积累逐渐改变你与时间的关系。',
    next: '回望来时的路，觉察、原则、能力与自由已经彼此呼应。最后，把它们连接成你自己的成长系统。',
  },
  {
    id: 'personal-growth-os',
    phase: '贯通',
    english: 'SYNTHESIS',
    question: '让四种理解，在同一个生活里相遇。',
    narrative:
      '把前四件作品放回真实生活：用觉察发现问题，用原则选择方向，用训练形成能力，再让长期积累产生复利。一个可以持续反馈与更新的个人系统，由此开始生长。',
    next: '这条路径在这里合拢，也从这里重新出发。带着一个真实问题回到第一步，看看你的理解发生了什么变化。',
  },
]

function readingProgress(garden, id) {
  const progress = garden.visits?.[id]?.progress
  return Number.isFinite(progress) ? Math.max(0, Math.min(1, progress)) : 0
}

export default function Journeys({ id }) {
  const { artifacts, garden } = useGrove()
  if (id && id !== 'personal-growth')
    return (
      <div className="journey-page">
        <EmptyState
          title="这条小径还没有被开辟"
          description="从已有的知识路径出发，看看思想如何一步步连接。"
          action="浏览知识路径"
          to="/journeys"
        />
      </div>
    )

  const chapters = growthPath
    .map((step) => ({ ...step, artifact: artifacts.find((artifact) => artifact.id === step.id) }))
    .filter((step) => step.artifact)
  if (!chapters.length)
    return (
      <div className="journey-page">
        <EmptyState
          title="这条路径正在等待第一件作品"
          description="先走进花园，从一个感兴趣的想法开始。"
          action="探索作品"
          to="/explore"
        />
      </div>
    )

  const completed = chapters.filter((step) => readingProgress(garden, step.id) >= 0.9).length
  const nextChapter = chapters.find((step) => readingProgress(garden, step.id) < 0.9) || chapters[0]
  const hasStarted = chapters.some((step) => garden.visits?.[step.id])

  return (
    <div className="journey-page">
      <div className="journey-topline">
        <Link to="/explore" className="journey-back">
          <ArrowLeft size={14} />
          回到知识花园
        </Link>
        <span>KNOWLEDGE JOURNEY · 01</span>
      </div>

      <header className="journey-introduction">
        <div className="journey-intro-copy">
          <span className="journey-eyebrow">
            <Leaf size={14} strokeWidth={1.3} /> 一条关于个人成长的知识路径
          </span>
          <h1>从觉醒到自由</h1>
          <p className="journey-english">A path to a more intentional life.</p>
          <p className="journey-description">
            先看见自己，再选择方向。
            <br />
            沿着五件彼此呼应的作品，让理解一步步走进生活。
          </p>
          <Link to={artifactUrl(nextChapter.artifact)} className="journey-begin">
            {completed === chapters.length
              ? '再走一次这条小径'
              : hasStarted
                ? '继续这段探索'
                : '从第一步开始'}
            <ArrowRight size={16} />
          </Link>
        </div>
        <aside className="journey-intro-note" aria-label="路径的阅读方式">
          <span className="journey-note-mark" aria-hidden="true">
            “
          </span>
          <p>
            一本书打开一个视角，
            <br />
            一条路径，让视角彼此相连。
          </p>
          <span className="journey-note-rule" />
          <small>
            按顺序走，也可以在让你好奇的地方停下。
            <br />
            这段探索，没有需要赶上的进度。
          </small>
        </aside>
      </header>

      <div className="journey-route-overview">
        <div className="journey-route-words" aria-label="路径顺序">
          {chapters.map((step, index) => (
            <span key={step.id}>
              {index > 0 && <ArrowRight size={12} aria-hidden="true" />}
              <a href={`#journey-${step.id}`}>{step.phase}</a>
            </span>
          ))}
        </div>
        <span className="journey-overall-progress">
          已探索 {completed} / {chapters.length} 个阶段
        </span>
      </div>

      <ol className="journey-chapters" aria-label="成长路径的五个阶段">
        {chapters.map((step, index) => {
          const progress = readingProgress(garden, step.id)
          const explored = progress >= 0.9
          return (
            <li
              className={`journey-chapter${explored ? ' is-explored' : ''}`}
              key={step.id}
              id={`journey-${step.id}`}
            >
              <div className="journey-chapter-marker">
                <span>{String(index + 1).padStart(2, '0')}</span>
                <span className="journey-marker-line" aria-hidden="true" />
              </div>
              <article
                className="journey-chapter-content"
                aria-labelledby={`journey-heading-${step.id}`}
              >
                <div className="journey-chapter-heading">
                  <span className="journey-eyebrow">{step.english}</span>
                  <span className={`journey-reading-status${explored ? ' complete' : ''}`}>
                    {explored ? (
                      <>
                        <Check size={12} />
                        已探索
                      </>
                    ) : (
                      `已读 ${Math.round(progress * 100)}%`
                    )}
                  </span>
                </div>
                <h2 id={`journey-heading-${step.id}`}>{step.phase}</h2>
                <h3>{step.question}</h3>
                <p className="journey-narrative">{step.narrative}</p>
                <div className="journey-concept-tags" aria-label="这一阶段的概念">
                  {step.artifact.concepts.slice(0, 3).map((concept) => (
                    <span key={concept}>{concept}</span>
                  ))}
                </div>
                <p className="journey-next-thought">
                  <ArrowDown size={15} strokeWidth={1.4} aria-hidden="true" />
                  <span>{step.next}</span>
                </p>
              </article>
              <div className="journey-reading">
                <Link
                  to={artifactUrl(step.artifact)}
                  className="journey-reading-link"
                  aria-label={`阅读《${step.artifact.title}》`}
                >
                  <div className="journey-cover">
                    <img
                      src={step.artifact.cover}
                      alt=""
                      loading={index === 0 ? 'eager' : 'lazy'}
                    />
                  </div>
                  <div className="journey-book-caption">
                    <span>
                      <strong>{step.artifact.title}</strong>
                      <small>
                        {step.artifact.artifactType === 'synthesis'
                          ? '思想贯通 · 个人成长系统'
                          : step.artifact.author}
                      </small>
                    </span>
                    <ArrowUpRight size={20} strokeWidth={1.3} />
                  </div>
                </Link>
              </div>
            </li>
          )
        })}
      </ol>

      <footer className="journey-closing">
        <Leaf size={22} strokeWidth={1} aria-hidden="true" />
        <p>路径终有尽头，理解继续生长。</p>
        <span>带走一个新问题，让下一次探索从这里开始。</span>
        <Link to="/connections">
          去看看思想之间的连接
          <ArrowUpRight size={15} />
        </Link>
      </footer>
    </div>
  )
}
