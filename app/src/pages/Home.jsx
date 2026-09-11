import { ArrowRight, ArrowUpRight, Sprout, Network, Compass, MoveUpRight } from 'lucide-react'
import { Link, useGrove, artifactUrl } from '../context.jsx'
import { ArtifactCard, GardenIllustration, SectionHead } from '../components/Shared.jsx'

const journey = [
  ['01', '觉醒', '看见自己的内在', 'cognitive-awakening', 'AWARENESS'],
  ['02', '原则', '选择自己的方向', 'seven-habits', 'PRINCIPLES'],
  ['03', '能力', '让练习产生改变', 'deliberate-practice', 'PRACTICE'],
  ['04', '杠杆', '放大独特的价值', 'naval-almanack', 'LEVERAGE'],
  ['05', '系统', '让理解融会贯通', 'personal-growth-os', 'SYNTHESIS'],
]

export default function Home() {
  const { artifacts, garden, connections, catalog } = useGrove()
  const featured = artifacts.find((item) => item.id === 'personal-growth-os') || artifacts[0]
  const recent = Object.entries(garden.visits)
    .sort((a, b) => b[1].at.localeCompare(a[1].at))
    .map(([id]) => artifacts.find((item) => item.id === id))
    .filter(Boolean)
    .slice(0, 4)
  const selections = recent.length
    ? recent
    : ['intellectual-atlas', 'how-to-read-a-book', 'thinking-in-systems', 'great-mental-models']
        .map((id) => artifacts.find((item) => item.id === id))
        .filter(Boolean)
  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="hero-copy">
          <div className="hero-eyebrow">
            <span className="tiny-spark">✳</span>A VISUAL KNOWLEDGE GARDEN
          </div>
          <h1>
            思想在此相遇，
            <br />
            知识由此<span>成林。</span>
          </h1>
          <p className="hero-english">Explore ideas. Grow understanding.</p>
          <p className="hero-description">
            一本书，一种思想，一次意想不到的连接。
            <br />
            让知识拥有自己的形态，也让理解慢慢生长。
          </p>
          <div className="hero-actions">
            <Link className="button primary" to="/explore">
              走进知识花园
              <ArrowUpRight size={17} />
            </Link>
            <Link className="hero-secondary" to="/connections">
              <Network size={16} />
              发现思想之间的连接
              <ArrowRight size={15} />
            </Link>
          </div>
          <div className="hero-footnote">
            <span className="small-dot" />
            {artifacts.length} 件知识作品
            <span className="footnote-divider" />
            {connections.length} 条思想连接
            <span className="footnote-divider" />
            无限生长的可能
          </div>
        </div>
        <div className="hero-art">
          <GardenIllustration />
          <span className="hero-art-note">EVERY IDEA IS A SEED.</span>
        </div>
      </section>
      <section className="featured-section">
        <div className="section-mini">
          <span className="eyebrow">THE EDITOR’S PICK</span>
          <span>本期精选 · 从阅读走向贯通</span>
          <span className="edition">VOL. 001 / GROWTH</span>
        </div>
        <Link className="featured-artifact" to={artifactUrl(featured)}>
          <div className="featured-copy">
            <span className="featured-badge">
              <Network size={12} /> SYNTHESIS · 贯通作品
            </span>
            <h2>
              从认知到自由，
              <br />
              构建你的成长操作系统。
            </h2>
            <p>
              当四本书的思想相遇，一条完整的成长路径浮现。
              <br className="desktop-only" />
              觉醒、选择、原则、训练、能力、杠杆，自由。
            </p>
            <span className="featured-link">
              探索《贯通思考篇》
              <ArrowUpRight size={17} />
            </span>
            <span className="featured-source">
              4 个知识来源<span>·</span>7 个成长阶段<span>·</span>1 套个人系统
            </span>
          </div>
          <div className="featured-visual">
            <div className="system-orbit orbit-1" />
            <div className="system-orbit orbit-2" />
            <div className="system-orbit orbit-3" />
            <div className="system-center">
              <Sprout size={29} strokeWidth={1.2} />
              <span>
                PERSONAL
                <br />
                GROWTH OS
              </span>
              <small>连接，让知识进化。</small>
            </div>
            <div className="system-node node-1">
              <i className="node-dot coral" />
              <span>
                认知觉醒<small>AWARENESS</small>
              </span>
            </div>
            <div className="system-node node-2">
              <i className="node-dot gold" />
              <span>
                七个习惯<small>PRINCIPLES</small>
              </span>
            </div>
            <div className="system-node node-3">
              <i className="node-dot sage" />
              <span>
                刻意练习<small>PRACTICE</small>
              </span>
            </div>
            <div className="system-node node-4">
              <i className="node-dot blue" />
              <span>
                纳瓦尔宝典<small>FREEDOM</small>
              </span>
            </div>
            <span className="diagram-caption">01 — CONNECTING THE DOTS</span>
          </div>
        </Link>
      </section>
      <section className="home-discover">
        <SectionHead
          eyebrow={recent.length ? 'CONTINUE EXPLORING' : 'NEW BRANCHES OF UNDERSTANDING'}
          title={recent.length ? '沿着好奇心，继续探索' : '新的思想，正在这里生长'}
          description={
            recent.length
              ? '回到熟悉的思想，也许会有新的发现。'
              : '从主动阅读到系统思考，再把十一部作品连接成一张思想地图。'
          }
          to="/explore"
        />
        <div className="artifact-grid">
          {selections.map((artifact, index) => (
            <ArtifactCard key={artifact.id} artifact={artifact} index={index} />
          ))}
        </div>
        <div className="home-concepts">
          <span>EXPLORE AN IDEA</span>
          {catalog.concepts.slice(0, 8).map((concept) => (
            <Link key={concept.id} to={`/concept/${concept.id}`}>
              {concept.name}
              <ArrowUpRight size={11} />
            </Link>
          ))}
        </div>
      </section>
      <section className="journey-section">
        <SectionHead
          eyebrow="A KNOWLEDGE JOURNEY"
          title="成长是一条相互连接的小径"
          description="从认识自己，到构建系统。沿着五个思想路标，走一段属于你的旅程。"
          to="/journeys/personal-growth"
          action="踏上这段旅程"
        />
        <div className="journey-track">
          {journey.map(([n, title, description, id, en]) => {
            const item = artifacts.find((artifact) => artifact.id === id)
            return (
              <Link key={id} to={item ? artifactUrl(item) : '/explore'} className="journey-step">
                <div className="journey-marker">
                  <span>{n}</span>
                  <ArrowRight size={15} />
                </div>
                <span className="journey-en">{en}</span>
                <h3>{title}</h3>
                <p>{description}</p>
                <span className="journey-book">
                  {item?.title}
                  <ArrowUpRight size={13} />
                </span>
              </Link>
            )
          })}
        </div>
      </section>
      <section className="synthesis-callout">
        <div className="synthesis-symbol">
          <span />
          <Network size={40} strokeWidth={1} />
          <span />
        </div>
        <div>
          <span className="eyebrow">KNOWLEDGE → NEW UNDERSTANDING</span>
          <h2>最好的想法，往往生长在连接之处。</h2>
          <p>把两个作品放在一起，让一个新问题浮现。你的下一份作品，从这里开始。</p>
        </div>
        <Link className="button secondary" to="/create?mode=synthesis">
          开始一次贯通
          <ArrowUpRight size={17} />
        </Link>
      </section>
    </div>
  )
}
