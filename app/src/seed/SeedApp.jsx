import { useEffect, useRef, useState } from 'react'
import catalog from '../generated/seed-catalog.json'
import ArtifactRenderer from '../core/ArtifactRenderer.jsx'
import { SeedProvider, SeedLink, useSeed } from './context.jsx'
import { questions, questionById } from './questions.js'
import './seed.css'

const seeds = catalog.seeds
const layers = catalog.layers
const layerIcons = { 1: 'weather', 2: 'paths', 4: 'mountain', 5: 'flask' }
const layerColors = { 1: 'green', 2: 'yellow', 4: 'blue', 5: 'orange' }
const seedUrl = (seed) => `/seed/play/${encodeURIComponent(seed.slug)}`
const sortedEvents = (events) => [...events].sort((a, b) => Date.parse(b.at) - Date.parse(a.at))

function Icon({ name = 'sprout', className = '', ...props }) {
  const paths = {
    sprout: (
      <>
        <path d="M12 22V12M12 16C3 16 3 8 3 8s9-1 9 8ZM12 12C12 4 21 3 21 3s1 9-9 9Z" />
      </>
    ),
    weather: (
      <>
        <path d="M7 13a5 5 0 0 1 9-3 4 4 0 1 1 1 8H7a3 3 0 0 1 0-6" />
        <path d="M6 3v2M1 8h2M3 3l2 2M9 21v1M14 21v1" />
      </>
    ),
    paths: (
      <>
        <path d="M12 22V10M12 15l-7-6M12 11l7-6M3 5v5h5M16 3h5v5" />
      </>
    ),
    mountain: (
      <>
        <path d="m2 21 8-17 5 11 3-6 5 12ZM7 10l3 2 3-2M5 21l4-4 3 1 3-3" />
      </>
    ),
    flask: (
      <>
        <path d="M8 3h8M10 3v7L4 20q0 2 3 2h10q3 0 3-2l-6-10V3M7 15h10M10 18h.01M14 19h.01" />
      </>
    ),
    eye: (
      <>
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    compass: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="m16 8-3 6-5 2 3-6Z" />
      </>
    ),
    steps: (
      <>
        <path d="M2 21h6v-6h6V9h6V3M3 8l4-4M3 4h4v4" />
      </>
    ),
    spark: (
      <>
        <path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5ZM20 2v4M18 4h4" />
      </>
    ),
    tree: (
      <>
        <path d="M12 22v-9M8 17l4-4 4 3" />
        <path d="M5 17a5 5 0 0 1-1-9 5 5 0 0 1 8-5 5 5 0 0 1 8 5 5 5 0 0 1-1 9" />
      </>
    ),
    arrow: (
      <>
        <path d="M4 12h16m-6-6 6 6-6 6" />
      </>
    ),
    back: (
      <>
        <path d="M20 12H4m6-6-6 6 6 6" />
      </>
    ),
    leaf: (
      <>
        <path d="M4 21 17 8M5 17C-1 5 12 2 22 2c0 12-5 22-17 15Z" />
      </>
    ),
    footprints: (
      <>
        <ellipse cx="7" cy="8" rx="3" ry="5" transform="rotate(-20 7 8)" />
        <ellipse cx="17" cy="15" rx="3" ry="5" transform="rotate(20 17 15)" />
        <path d="m6 16 2 1M16 23l2-1" />
      </>
    ),
    book: (
      <>
        <path d="M12 21V5M2 3c4-1 7 0 10 2 3-2 6-3 10-2v16c-4-1-7 0-10 2-3-2-6-3-10-2Z" />
      </>
    ),
    heart: (
      <>
        <path d="M12 21 3 12C-3 4 7-2 12 5c5-7 15-1 9 7Z" />
      </>
    ),
  }
  return (
    <svg
      className={`seed-icon ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name] || paths.sprout}
    </svg>
  )
}

function GardenLandscape() {
  return (
    <svg
      className="seed-landscape"
      viewBox="0 0 1120 470"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id="seed-map-grass" width="50" height="38" patternUnits="userSpaceOnUse">
          <path
            d="m8 28-2-5m2 5 3-6M39 9l-2-4m2 4 2-3"
            fill="none"
            stroke="#6f8c5c"
            strokeWidth="1.4"
            opacity=".25"
          />
        </pattern>
      </defs>
      <rect width="1120" height="470" fill="#f2f4e8" />
      <circle cx="870" cy="65" r="29" fill="#efd582" />
      <g fill="#fffdf4">
        <path d="M78 58c-17-23-43-12-43 3-27-4-31 23-4 24h88c25-2 22-25 2-27-7-18-31-18-43 0Z" />
        <path d="M679 39c-11-13-28-7-27 5-21-2-20 17-3 17h62c18-1 16-18 2-19-7-12-23-14-34-3Z" />
      </g>
      <path d="M0 190Q132 69 282 149T531 128T773 132T1120 120V470H0Z" fill="#d8e5ce" />
      <path d="m518 139 66-91 59 100 58-81 67 118Z" fill="#c4d8d5" />
      <path d="m562 78 22-30 24 40-26-8-8 10Zm116 22 23-33 26 44-22-9-7 8Z" fill="#fffaf0" />
      <path d="M0 261Q194 155 392 227T727 214T1120 215V470H0Z" fill="#b7d2a5" />
      <path d="M0 359Q182 267 388 328T770 321T1120 309V470H0Z" fill="#d0dfa7" />
      <path
        d="M948 180C700 244 1011 310 751 362S643 459 743 489"
        stroke="#e9f0dd"
        strokeWidth="48"
        fill="none"
      />
      <path
        d="M948 180C700 244 1011 310 751 362S643 459 743 489"
        stroke="#a4cecf"
        strokeWidth="34"
        fill="none"
      />
      <path
        d="M151 330C301 376 259 260 411 293S576 155 648 197 719 315 934 278"
        stroke="#f9efd4"
        strokeWidth="18"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M151 330C301 376 259 260 411 293S576 155 648 197 719 315 934 278"
        stroke="#bcac7e"
        strokeWidth="1.6"
        strokeDasharray="3 8"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M0 410q170-38 321-13t326 48l-1 25H0Z" fill="#a8c795" />
      <path d="M0 470V220h1120v250Z" fill="url(#seed-map-grass)" />
      <g stroke="#657c4f" strokeWidth="3" fill="#7fa16b">
        <path d="M79 213v61M56 229l24-62 25 62ZM995 174v71M969 204l27-74 29 74Z" />
        <path d="M1037 343v62M1013 362l24-66 26 66Z" fill="#91ae70" />
        <path d="M345 161v48M323 182l22-57 23 57Z" fill="#9bb77c" />
      </g>
      <g stroke="#8c9d74" strokeWidth="2" fill="#c0d49c">
        <circle cx="36" cy="371" r="27" />
        <path d="M36 371v55m0-32-11-9M470 395v35" />
        <circle cx="470" cy="381" r="22" />
        <path d="M473 397l9-9" />
      </g>
      <g transform="translate(164 225)">
        <ellipse cx="12" cy="46" rx="59" ry="16" fill="#8db8ab" stroke="#d5e5c7" strokeWidth="8" />
        <path d="m-21 42 15 2m15 8 18-1" stroke="#daebde" strokeWidth="2" />
        <g stroke="#718154" strokeWidth="2">
          <path d="M-31 16v27m25-44v37m30-15v22" />
        </g>
        <g fill="#f4c182">
          <circle cx="-31" cy="13" r="9" />
          <circle cx="-6" cy="-3" r="11" />
        </g>
        <circle cx="24" cy="19" r="8" fill="#f3e5b1" />
      </g>
      <g transform="translate(394 198)" stroke="#897958" strokeWidth="2.5" strokeLinejoin="round">
        <path d="M0 10v70" />
        <path d="M-32 13h57l12 10-12 10h-57Z" fill="#f4daa0" />
        <path d="M31 42h-54l-12 10 12 10h54Z" fill="#eee7ba" />
        <path d="m13 21 7 2-7 3m-26 24-7 2 7 3" fill="none" />
      </g>
      <g transform="translate(597 177)">
        <path d="m-18 13 31-20 28 28-27 24Z" fill="#f8f0cf" stroke="#9a9977" strokeWidth="2" />
        <path
          d="m13-7-1 29 2 23m-26-29 13 8m3-15 13 10m-23 8 13 8m7-1 14-6"
          stroke="#aab89a"
          strokeWidth="2"
        />
      </g>
      <g transform="translate(942 219)" stroke="#897b65" strokeWidth="2.2" strokeLinejoin="round">
        <path d="M-30 51V5h58v46" fill="#f4e6c5" />
        <path d="m-39 7 38-35L38 7Z" fill="#d9976c" />
        <path d="M-17 22h13v29h-13ZM8 20h13v13H8Z" fill="#c3d9d2" />
        <path d="M-38 51h75" />
        <path d="M9-29v-16h8v23" fill="#eac5a0" />
      </g>
      <g fill="#eebc6c" stroke="#b98e52" strokeWidth="1">
        <circle cx="306" cy="400" r="5" />
        <circle cx="288" cy="416" r="4" />
        <circle cx="902" cy="381" r="5" />
        <circle cx="923" cy="390" r="4" />
      </g>
      <g fill="none" stroke="#9ba38a" strokeWidth="1.5">
        <path d="M742 79q5-7 10 0 5-7 10 0M760 91q4-6 8 0 4-6 8 0" />
      </g>
      <g transform="translate(1019 61)" stroke="#91a384" fill="none">
        <circle r="19" strokeDasharray="2 4" />
        <path d="m0-15 5 15-5 15-5-15Z" fill="#b0bf9a" />
        <path d="M-11 0h22" />
      </g>
    </svg>
  )
}

function GardenMap() {
  return (
    <div className="seed-map-wrap">
      <GardenLandscape />
      <span className="seed-map-note">一张可以随心走走的地图</span>
      <nav className="seed-map" aria-label="花园地图">
        {layers.map((layer) => (
          <SeedLink
            key={layer.id}
            to={`/seed/layer/${layer.id}`}
            className={`seed-map-place seed-map-place-${layer.id}`}
          >
            <span className={`seed-map-icon seed-color-${layerColors[layer.id]}`}>
              <Icon name={layerIcons[layer.id]} />
            </span>
            <span>
              <strong>{layer.name}</strong>
              <small>{layer.goal}</small>
            </span>
            <Icon name="arrow" />
          </SeedLink>
        ))}
      </nav>
      <span className="seed-map-caption">
        <Icon name="sprout" /> 4 个小天地，想从哪里开始都可以
      </span>
    </div>
  )
}

function SeedCard({ seed, featured = false }) {
  return (
    <SeedLink className={`seed-card ${featured ? 'seed-card-featured' : ''}`} to={seedUrl(seed)}>
      <div className={`seed-card-cover seed-color-${layerColors[seed.layer]}`}>
        {seed.cover ? (
          <img
            src={typeof seed.cover === 'string' ? seed.cover : seed.cover.src}
            alt=""
            loading="lazy"
          />
        ) : (
          <Icon name={layerIcons[seed.layer]} />
        )}
        <span className="seed-duration">约 {seed.duration} 分钟</span>
      </div>
      <div className="seed-card-body">
        <span className="seed-eyebrow">{seed.goal}</span>
        <h3>{seed.title}</h3>
        <p>{seed.subtitle}</p>
        <span className="seed-card-start">
          进去试一试 <Icon name="arrow" />
        </span>
      </div>
    </SeedLink>
  )
}

function EventList({ events, limit, empty = '这里还没有记录' }) {
  const visible = sortedEvents(events).slice(0, limit)
  if (!visible.length)
    return (
      <div className="seed-empty">
        <Icon name="sprout" />
        <h3>{empty}</h3>
        <p>发现了什么，或者在生活中试过什么，愿意时再记下来。</p>
      </div>
    )
  return (
    <ol className="seed-event-list">
      {visible.map((event) => {
        const seed = seeds.find((item) => item.id === event.seedId)
        const question = questionById[event.questionId]
        return (
          <li key={event.id}>
            <span
              className={`seed-event-leaf ${event.kind === 'real-life' ? 'seed-event-life' : ''}`}
            >
              <Icon name={event.kind === 'real-life' ? 'footprints' : 'leaf'} />
            </span>
            <div>
              <div className="seed-event-meta">
                <span>{event.kind === 'real-life' ? '生活中用过' : '一次发现'}</span>
                <time dateTime={event.at}>
                  {new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric' }).format(
                    new Date(event.at),
                  )}
                </time>
                {event.source === 'parent' && <span>家长记录</span>}
              </div>
              <p>{event.note}</p>
              <SeedLink
                className="seed-event-source"
                to={seed ? seedUrl(seed) : `/seed/think/${question?.id || ''}`}
              >
                {seed?.title || question?.title || '思考小工具'} <Icon name="arrow" />
              </SeedLink>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

function Home() {
  const { garden } = useSeed()
  const featured = seeds.find((seed) => seed.id === 'mistakes-are-clues') || seeds[0]
  return (
    <>
      <section className="seed-home-intro">
        <div>
          <p className="seed-eyebrow">HELLO, LITTLE GARDENER</p>
          <h1>
            小小思考家，
            <br className="seed-mobile-break" />
            今天想去哪儿？<span className="seed-title-spark">✳</span>
          </h1>
          <p>先试一试，想继续时再想一步。</p>
        </div>
        <span className="seed-hand-note">
          慢慢来，
          <br />
          每一种发现都算数。
          <svg viewBox="0 0 100 40" aria-hidden="true">
            <path d="M88 4Q46 40 7 16m0 0 6 17m-6-17 18 1" />
          </svg>
        </span>
      </section>
      <GardenMap />
      <div className="seed-home-below">
        <section className="seed-todays">
          <div className="seed-section-title">
            <h2>
              <Icon name="sprout" /> 今天的小种子
            </h2>
            <span>从一个小小的“咦？”开始</span>
          </div>
          <SeedCard seed={featured} featured />
        </section>
        <section className="seed-think-invitation">
          <span className="seed-eyebrow">THINK 8 · 随手拿来用</span>
          <div className="seed-invitation-icons">
            <Icon name="weather" />
            <Icon name="eye" />
            <Icon name="compass" />
            <span>···</span>
          </div>
          <h2>有件事，想不明白？</h2>
          <p>
            不用急着找答案。
            <br />
            选一个问题，陪自己想一想。
          </p>
          <SeedLink className="seed-button seed-button-light" to="/seed/think">
            帮我想一想 <Icon name="arrow" />
          </SeedLink>
        </section>
      </div>
      <section className="seed-home-growth">
        <div className="seed-section-title">
          <h2>
            <Icon name="footprints" /> 最近的小脚印
          </h2>
          <SeedLink to="/seed/growth">
            翻开我的记录 <Icon name="arrow" />
          </SeedLink>
        </div>
        <EventList events={garden.events} limit={3} />
      </section>
      <p className="seed-garden-wish">
        在这里，慢慢学着看见自己、理解世界、做出选择、学会学习、与人合作，也和未来做朋友。
      </p>
    </>
  )
}

function PageIntro({ eyebrow, title, children, icon = 'sprout', color = 'green' }) {
  return (
    <div className="seed-page-intro">
      <span className={`seed-page-symbol seed-color-${color}`}>
        <Icon name={icon} />
      </span>
      <div>
        <p className="seed-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{children}</p>
      </div>
    </div>
  )
}

function LayerPage({ id }) {
  const layer = layers.find((item) => String(item.id) === id)
  if (!layer) return <NotFound />
  const available = seeds.filter((seed) => String(seed.layer) === id)
  return (
    <>
      <SeedLink className="seed-back" to="/seed">
        <Icon name="back" /> 回到花园地图
      </SeedLink>
      <PageIntro
        eyebrow={layer.goal}
        title={layer.name}
        icon={layerIcons[id]}
        color={layerColors[id]}
      >
        {layer.description}
      </PageIntro>
      <div className="seed-seed-grid">
        {available.map((seed) => (
          <SeedCard key={seed.id} seed={seed} />
        ))}
      </div>
      <div className="seed-gentle-note">
        <Icon name="leaf" />
        <p>想玩哪一颗就从哪一颗开始，也可以随时停下来。</p>
      </div>
    </>
  )
}

function RecordForm({
  seedId = '',
  questionId = '',
  source = 'child',
  defaultKind = 'discovery',
  title = '给发现留一片叶子',
  prompt,
  onSaved,
}) {
  const { recordEvent, setDirty } = useSeed()
  const [note, setNote] = useState('')
  const [kind, setKind] = useState(defaultKind)
  const [saved, setSaved] = useState(false)
  const noteId = `seed-note-${source}-${seedId || questionId}`
  useEffect(() => {
    setDirty(Boolean(note.trim()))
  }, [note, setDirty])
  useEffect(() => () => setDirty(false), [setDirty])
  const save = (event) => {
    event.preventDefault()
    if (!note.trim()) return
    if (recordEvent({ seedId, questionId, kind, note: note.trim(), source })) {
      setNote('')
      setDirty(false)
      setSaved(true)
      onSaved?.()
    }
  }
  return (
    <form className="seed-record-form" onSubmit={save}>
      <div className="seed-section-title">
        <h2>
          <Icon name="leaf" />
          {title}
        </h2>
        <span>想记再记</span>
      </div>
      {prompt && <p>{prompt}</p>}
      <fieldset className="seed-record-kinds">
        <legend>这次记录的是</legend>
        <label>
          <input
            type="radio"
            name={`kind-${noteId}`}
            checked={kind === 'discovery'}
            onChange={() => setKind('discovery')}
          />{' '}
          一个新发现
        </label>
        <label>
          <input
            type="radio"
            name={`kind-${noteId}`}
            checked={kind === 'real-life'}
            onChange={() => setKind('real-life')}
          />{' '}
          在生活中用过
        </label>
      </fieldset>
      <label className="seed-field-label" htmlFor={noteId}>
        我想记下
      </label>
      <textarea
        id={noteId}
        value={note}
        onChange={(event) => {
          setNote(event.target.value)
          setSaved(false)
        }}
        maxLength={600}
        rows={3}
        placeholder={
          kind === 'real-life' ? '发生了什么？你试了什么？后来呢？' : '我发现…… / 下次我想试试……'
        }
      />
      <div className="seed-form-actions">
        <span>只留在这台设备 · {note.length}/600</span>
        <button className="seed-button" type="submit" disabled={!note.trim()}>
          保存这片小叶子 <Icon name="leaf" />
        </button>
      </div>
      {saved && (
        <p className="seed-form-success" role="status">
          小叶子已保存，可以在“我的小脚印”里找到它。
        </p>
      )}
    </form>
  )
}

function SeedDetail({ slug }) {
  const frameRef = useRef(null)
  const seed = seeds.find((item) => item.slug === slug)
  if (!seed) return <NotFound />
  const layer = layers.find((item) => Number(item.id) === seed.layer)
  return (
    <>
      <SeedLink className="seed-back" to={`/seed/layer/${seed.layer}`}>
        <Icon name="back" /> 回到{layer?.name || '小天地'}
      </SeedLink>
      <div className="seed-detail-title">
        <div>
          <p className="seed-eyebrow">
            {seed.goal} · 约 {seed.duration} 分钟
          </p>
          <h1>{seed.title}</h1>
          <p>{seed.subtitle}</p>
        </div>
        <span className={`seed-page-symbol seed-color-${layerColors[seed.layer]}`}>
          <Icon name={layerIcons[seed.layer]} />
        </span>
      </div>
      <div className="seed-reading-hint">
        <Icon name="book" />
        <p>先试一试，想继续时再想一步。可以请大人陪着读，也可以随时停下来。</p>
      </div>
      <section className="seed-reader" aria-label={`${seed.title}互动作品`}>
        <ArtifactRenderer
          key={seed.id}
          artifact={seed}
          frameRef={frameRef}
          frameTitle={`${seed.title} · 思考小种子`}
        />
      </section>
      <div className="seed-detail-bottom">
        <RecordForm seedId={seed.id} prompt={seed.realLifePrompt} />
        <details className="seed-parent-prompt">
          <summary>
            <Icon name="heart" /> 给陪伴的大人 <span>展开看看</span>
          </summary>
          <p>{seed.parentPrompt}</p>
          <p className="seed-muted">先听孩子的发现。可以一起试，不需要马上总结出一个道理。</p>
          <SeedLink to="/seed/parent">
            打开家长小角落 <Icon name="arrow" />
          </SeedLink>
        </details>
      </div>
      {seed.related?.length > 0 && (
        <section className="seed-related">
          <div className="seed-section-title">
            <h2>还想走走吗？</h2>
          </div>
          <div className="seed-related-links">
            {seed.related
              .map((related) =>
                seeds.find(
                  (item) =>
                    item.id ===
                    (typeof related === 'string' ? related : related.id || related.target),
                ),
              )
              .filter(Boolean)
              .map((item) => (
                <SeedLink key={item.id} to={seedUrl(item)}>
                  <Icon name={layerIcons[item.layer]} />
                  <span>{item.title}</span>
                  <Icon name="arrow" />
                </SeedLink>
              ))}
          </div>
        </section>
      )}
    </>
  )
}

function ThinkHub() {
  return (
    <>
      <PageIntro
        eyebrow="THINK 8 · 口袋里的思考工具"
        title="一起想一想"
        icon="spark"
        color="yellow"
      >
        有时候，一个小问题会打开一扇窗。选现在用得上的那一个。
      </PageIntro>
      <div className="seed-think-grid">
        {questions.map((question, index) => (
          <SeedLink
            key={question.id}
            className={`seed-think-card seed-color-${question.color}`}
            to={`/seed/think/${question.id}`}
          >
            <div>
              <Icon name={question.icon} />
              <span>0{index + 1}</span>
            </div>
            <h2>{question.question}</h2>
            <p>{question.example}</p>
            <span className="seed-card-start">
              花一点时间试试 <Icon name="arrow" />
            </span>
          </SeedLink>
        ))}
      </div>
      <p className="seed-gentle-text">这些是固定的小情境。你的生活，可能还有这里没写到的答案。</p>
    </>
  )
}

function ThinkDetail({ id }) {
  const [selected, setSelected] = useState(null)
  const [phase, setPhase] = useState('play')
  const [deeper, setDeeper] = useState(false)
  const question = questionById[id]
  if (!question) return <NotFound />
  return (
    <div className="seed-thinking-page">
      <SeedLink className="seed-back" to="/seed/think">
        <Icon name="back" /> 回到 Think 8
      </SeedLink>
      <PageIntro
        eyebrow={`THINK 8 · ${id.toUpperCase()}`}
        title={question.question}
        icon={question.icon}
        color={question.color}
      >
        {question.example}
      </PageIntro>
      {phase === 'play' ? (
        <section className={`seed-playground seed-color-${question.color}`}>
          <span className="seed-eyebrow">一个小情境 · 先试一试</span>
          <p className="seed-scene">{question.scene}</p>
          <div className="seed-game-question">
            <Icon name={question.icon} />
            <h2>{question.prompt}</h2>
          </div>
          <div className="seed-choice-group" role="group" aria-label="试一试">
            {question.choices.map(([label], index) => (
              <button
                type="button"
                key={label}
                className={`seed-choice ${selected === index ? 'seed-choice-selected' : ''}`}
                aria-pressed={selected === index}
                onClick={() => setSelected(index)}
              >
                <span>{String.fromCharCode(65 + index)}</span>
                {label}
                <Icon name="arrow" />
              </button>
            ))}
          </div>
          {selected !== null && (
            <div className="seed-game-feedback" role="status">
              <Icon name="leaf" />
              <p>{question.choices[selected][1]}</p>
            </div>
          )}
          {selected !== null && (
            <>
              <div className="seed-depth-invitation">
                <span>想停在这里也可以</span>
                <button
                  className="seed-button seed-button-light"
                  aria-expanded={deeper}
                  aria-controls={`seed-deeper-${id}`}
                  onClick={() => setDeeper((value) => !value)}
                >
                  <Icon name="spark" /> {deeper ? '收起这一步' : '再想一步'}
                </button>
              </div>
              {deeper && (
                <section
                  id={`seed-deeper-${id}`}
                  className="seed-deeper-question"
                  aria-label="再想一步"
                >
                  <span className="seed-eyebrow">沿着刚才的发现</span>
                  <h3>{question.deeper.prompt}</h3>
                  <p>{question.deeper.invitation}</p>
                </section>
              )}
              <div className="seed-play-actions">
                <button
                  className="seed-text-button"
                  onClick={() => {
                    setSelected(null)
                    setDeeper(false)
                  }}
                >
                  换一个想法试试
                </button>
                <button className="seed-button" onClick={() => setPhase('life')}>
                  带回生活里 <Icon name="arrow" />
                </button>
              </div>
            </>
          )}
        </section>
      ) : (
        <section className="seed-life-reflection">
          <span className={`seed-life-icon seed-color-${question.color}`}>
            <Icon name="footprints" />
          </span>
          <h2>把这个问题，带回你的一天</h2>
          <p className="seed-real-life-prompt">{question.realLife}</p>
          <RecordForm questionId={id} title="我的小发现" />
          <SeedLink className="seed-back" to="/seed/think">
            <Icon name="back" /> 收好问题，继续走走
          </SeedLink>
        </section>
      )}
      <p className="seed-gentle-text">
        先试一试，想继续时再想一步。只有你愿意记下的发现，才会成为一片小叶子。
      </p>
    </div>
  )
}

function GrowthPage() {
  const { garden } = useSeed()
  const [filter, setFilter] = useState('all')
  const events = garden.events.filter((event) => filter === 'all' || event.kind === filter)
  return (
    <>
      <PageIntro eyebrow="MY LITTLE FOOTPRINTS" title="我的小脚印" icon="footprints">
        一片叶子，是你亲手留下的一次发现。没有必须走完的路。
      </PageIntro>
      <div className="seed-growth-intro">
        <Icon name="tree" />
        <p>
          这里收着你主动保存的话。
          <br />
          读过、点过、试过，不会自动变成一条记录。
        </p>
      </div>
      <div className="seed-filter" role="group" aria-label="查看哪种记录">
        {[
          ['all', '全部小脚印'],
          ['discovery', '我的发现'],
          ['real-life', '生活里的尝试'],
        ].map(([value, label]) => (
          <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>
            {label}
          </button>
        ))}
      </div>
      <EventList events={events} />
      <div className="seed-growth-bottom">
        <SeedLink className="seed-button seed-button-light" to="/seed">
          回花园走走 <Icon name="arrow" />
        </SeedLink>
        <SeedLink to="/seed/parent">和大人一起整理记录</SeedLink>
      </div>
    </>
  )
}

function downloadJson(value, name) {
  const url = URL.createObjectURL(new Blob([value], { type: 'application/json' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = name
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function ConfirmDialog({
  title,
  children,
  confirm,
  cancel,
  confirmLabel,
  cancelLabel = '先不替换',
}) {
  const dialogRef = useRef(null)
  const { warning } = useSeed()
  useEffect(() => {
    const dialog = dialogRef.current
    dialog.showModal()
    return () => {
      if (dialog.open) dialog.close()
    }
  }, [])
  return (
    <dialog
      ref={dialogRef}
      className="seed-dialog"
      onCancel={(event) => {
        event.preventDefault()
        cancel()
      }}
      aria-labelledby="seed-confirm-title"
    >
      <h2 id="seed-confirm-title">{title}</h2>
      {children}
      {warning && (
        <p className="seed-warning" role="alert">
          {warning}
        </p>
      )}
      <div className="seed-dialog-actions">
        <button className="seed-button seed-button-light" autoFocus onClick={cancel}>
          {cancelLabel}
        </button>
        <button className="seed-button" onClick={confirm}>
          {confirmLabel}
        </button>
      </div>
    </dialog>
  )
}

function ParentPage() {
  const { garden, exportData, restore, clear, getRecovery, validateImport } = useSeed()
  const [seedId, setSeedId] = useState(seeds[0].id)
  const [pendingImport, setPendingImport] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [fileError, setFileError] = useState('')
  const [formEpoch, setFormEpoch] = useState(0)
  const fileRef = useRef(null)
  const selectedSeed = seeds.find((seed) => seed.id === seedId)
  const now = Date.now()
  const recent = sortedEvents(garden.events).filter(
    (event) => Date.parse(event.at) >= now - 7 * 24 * 60 * 60 * 1000 && Date.parse(event.at) <= now,
  )
  const subjects = [...new Set(recent.map((event) => event.seedId || event.questionId))]
    .map((id) => seeds.find((seed) => seed.id === id)?.title || questionById[id]?.title)
    .filter(Boolean)
  const recovery = getRecovery()
  const previousRecovery = getRecovery({ previous: true })
  async function prepareImport(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setFileError('')
    try {
      if (file.size > 1024 * 1024) throw new Error('文件超过 1 MB，请选择导出的 Seed Grove 备份。')
      const value = validateImport(JSON.parse(await file.text()))
      setPendingImport({ value, name: file.name })
    } catch (error) {
      setFileError(
        error instanceof SyntaxError
          ? '这个文件无法读成备份。请重新选择 Seed Grove 导出的 JSON 文件。'
          : error.message,
      )
    }
  }
  return (
    <>
      <PageIntro
        eyebrow="A LITTLE CORNER FOR GROWN-UPS"
        title="家长小角落"
        icon="heart"
        color="orange"
      >
        陪孩子多问一句，给自己的答案多留一点时间。
      </PageIntro>
      <div className="seed-parent-overview">
        <section>
          <span className="seed-eyebrow">最近 7 天 · 真实留下的记录</span>
          <h2>这一周，一起看见了什么？</h2>
          {recent.length ? (
            <>
              <p>
                留下了 {recent.length} 条记录，其中{' '}
                {recent.filter((event) => event.kind === 'real-life').length} 条提到了生活中的尝试。
              </p>
              <div className="seed-subject-tags">
                {subjects.map((subject) => (
                  <span key={subject}>{subject}</span>
                ))}
              </div>
            </>
          ) : (
            <p>最近 7 天还没有记录。可以先一起玩一颗种子，听听孩子说了什么。</p>
          )}
          <p className="seed-muted">
            这些是孩子或家长主动记下的片段，只描述发生过的事，不代表能力高低或掌握程度。
          </p>
        </section>
        <aside>
          <Icon name="leaf" />
          <span className="seed-eyebrow">本周可以一起问</span>
          <p>
            “最近有没有一件事，
            <br />
            你换了一个办法再试？”
          </p>
          <span>听一个具体故事，不急着评价。</span>
        </aside>
      </div>
      <section className="seed-parent-record">
        <h2>记录一次生活中的尝试</h2>
        <p>只记下看见、听见的事。这里不需要孩子的姓名或个人资料。</p>
        <label className="seed-field-label" htmlFor="seed-parent-subject">
          记录与哪颗种子有关
        </label>
        <select
          id="seed-parent-subject"
          value={seedId}
          onChange={(event) => setSeedId(event.target.value)}
        >
          {seeds.map((seed) => (
            <option key={seed.id} value={seed.id}>
              {seed.title}
            </option>
          ))}
        </select>
        <p className="seed-parent-question">可以这样问：{selectedSeed.parentPrompt}</p>
        <RecordForm
          key={formEpoch}
          seedId={seedId}
          source="parent"
          defaultKind="real-life"
          title="留下一段真实的小事"
        />
      </section>
      <section className="seed-parent-recent">
        <div className="seed-section-title">
          <h2>本周留下的叶子</h2>
          <SeedLink to="/seed/growth">
            查看所有记录 <Icon name="arrow" />
          </SeedLink>
        </div>
        <EventList events={recent} empty="最近 7 天还没有记录" />
      </section>
      <section className="seed-data-corner">
        <div>
          <h2>照顾这台设备里的记录</h2>
          <p>
            记录保存在当前浏览器。换设备前，可以由家长导出备份；导入会替换这台设备的 Seed Grove
            记录。Ink Grove 的花园数据独立保存。
          </p>
        </div>
        <div className="seed-data-actions">
          <button
            className="seed-button seed-button-light"
            onClick={() =>
              downloadJson(exportData(), `seed-grove-${new Date().toISOString().slice(0, 10)}.json`)
            }
          >
            导出 Seed Grove 备份
          </button>
          <button className="seed-button seed-button-light" onClick={() => fileRef.current.click()}>
            导入备份
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            aria-label="选择 Seed Grove 备份文件"
            className="seed-file-input"
            onChange={prepareImport}
          />
          {recovery && (
            <button
              className="seed-text-button"
              onClick={() => downloadJson(recovery, 'seed-grove-recovery.json')}
            >
              下载保留的恢复副本
            </button>
          )}
          {previousRecovery && previousRecovery !== recovery && (
            <button
              className="seed-text-button"
              onClick={() => downloadJson(previousRecovery, 'seed-grove-earlier-recovery.json')}
            >
              下载较早的恢复副本
            </button>
          )}
          <button className="seed-text-button seed-danger" onClick={() => setDeleting(true)}>
            删除本机 Seed Grove 记录
          </button>
        </div>
        {fileError && (
          <p className="seed-warning" role="alert">
            {fileError}
          </p>
        )}
      </section>
      {pendingImport && (
        <ConfirmDialog
          title="用这份备份替换本机记录？"
          cancel={() => setPendingImport(null)}
          confirmLabel="确认导入并替换"
          confirm={() => {
            if (restore(pendingImport.value)) {
              setPendingImport(null)
              setFormEpoch((value) => value + 1)
            }
          }}
        >
          <p>文件：{pendingImport.name}</p>
          <p>包含 {pendingImport.value.events.length} 条记录。替换成功后，将显示备份里的记录。</p>
          <p>建议先导出需要保留的本机记录。</p>
        </ConfirmDialog>
      )}
      {deleting && (
        <ConfirmDialog
          title="删除这台设备上的小脚印？"
          cancel={() => setDeleting(false)}
          cancelLabel="保留记录"
          confirmLabel="确认删除 Seed Grove 记录"
          confirm={() => {
            if (clear()) {
              setDeleting(false)
              setFormEpoch((value) => value + 1)
            }
          }}
        >
          <p>Seed Grove 的成长记录将清空。请先导出需要保留的记录。</p>
          <p>Ink Grove 数据不受影响。</p>
        </ConfirmDialog>
      )}
    </>
  )
}

function NotFound() {
  return (
    <div className="seed-not-found">
      <Icon name="compass" />
      <h1>这条小路还没有通到花园</h1>
      <p>回到地图，重新选一个想去的地方吧。</p>
      <SeedLink className="seed-button" to="/seed">
        回到花园地图 <Icon name="arrow" />
      </SeedLink>
    </div>
  )
}

function SeedShell() {
  const { location, warning, notice } = useSeed()
  const pathname = location.split('?')[0].replace(/\/$/, '') || '/seed'
  let content
  if (pathname === '/seed') content = <Home />
  else if (pathname.startsWith('/seed/layer/'))
    content = <LayerPage id={pathname.slice('/seed/layer/'.length)} />
  else if (pathname.startsWith('/seed/play/')) {
    try {
      content = <SeedDetail slug={decodeURIComponent(pathname.slice('/seed/play/'.length))} />
    } catch {
      content = <NotFound />
    }
  } else if (pathname === '/seed/think') content = <ThinkHub />
  else if (pathname.startsWith('/seed/think/'))
    content = <ThinkDetail id={pathname.slice('/seed/think/'.length)} />
  else if (pathname === '/seed/growth') content = <GrowthPage />
  else if (pathname === '/seed/parent') content = <ParentPage />
  else content = <NotFound />
  useEffect(() => {
    document.title = 'Seed Grove · 小小思考家'
  }, [])
  const links = [
    ['/seed', '花园地图', 'compass'],
    ['/seed/think', '一起想一想', 'spark'],
    ['/seed/growth', '我的小脚印', 'footprints'],
  ]
  return (
    <div className="seed-app">
      <a className="seed-skip-link" href="#seed-main">
        跳到主要内容
      </a>
      <header className="seed-header">
        <div className="seed-header-inner">
          <SeedLink className="seed-brand" to="/seed" aria-label="Seed Grove 首页">
            <span>
              <Icon name="sprout" />
            </span>
            <div>
              <strong>Seed Grove</strong>
              <small>小小思考家</small>
            </div>
          </SeedLink>
          <nav className="seed-nav" aria-label="Seed Grove 导航">
            {links.map(([to, label, icon]) => (
              <SeedLink
                key={to}
                to={to}
                aria-current={
                  pathname === to || (to !== '/seed' && pathname.startsWith(`${to}/`))
                    ? 'page'
                    : undefined
                }
              >
                <Icon name={icon} />
                <span>{label}</span>
              </SeedLink>
            ))}
          </nav>
          <div className="seed-header-tools">
            <SeedLink
              className="seed-parent-link"
              to="/seed/parent"
              aria-current={pathname === '/seed/parent' ? 'page' : undefined}
            >
              <Icon name="heart" />
              <span>家长小角落</span>
            </SeedLink>
          </div>
        </div>
      </header>
      <main id="seed-main" className="seed-main" tabIndex={-1}>
        {warning && (
          <p className="seed-warning" role="alert">
            {warning}
          </p>
        )}
        {notice && (
          <p className="seed-notice" role="status">
            {notice}
          </p>
        )}
        <div key={pathname}>{content}</div>
      </main>
      <footer className="seed-footer">
        <div>
          <Icon name="sprout" />
          <span>种下思考的种子，慢慢长成自己的模样。</span>
        </div>
        <a href="/">
          Ink Grove · 大人的花园 <Icon name="arrow" />
        </a>
      </footer>
    </div>
  )
}

export default function SeedApp() {
  return (
    <SeedProvider>
      <SeedShell />
    </SeedProvider>
  )
}
