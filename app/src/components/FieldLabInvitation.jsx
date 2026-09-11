import { ArrowUpRight } from 'lucide-react'
import { Link, artifactUrl } from '../context.jsx'
import '../field-lab.css'

export default function FieldLabInvitation({ artifact }) {
  if (!artifact) return null
  return (
    <section className="field-lab-invitation" aria-labelledby="field-lab-title">
      <div className="field-lab-copy">
        <span className="eyebrow">A SMALL EXPERIMENT · 新的贯通作品</span>
        <h2 id="field-lab-title">让下一步行动，值得被验证。</h2>
        <p>检视证据与反例，调节反馈强度与延迟。把四本书里的思想，变成一张你能带走的行动卡。</p>
        <Link className="button primary" to={artifactUrl(artifact)}>
          进入清醒行动实验室 <ArrowUpRight size={17} />
        </Link>
        <small>动手思考 · 交互实验 · 个人行动卡</small>
      </div>
      <div className="field-lab-illustration" aria-hidden="true">
        <div className="field-lab-scale">
          <span>OBSERVE</span>
          <span>TRY</span>
          <span>ADJUST</span>
        </div>
        <svg viewBox="0 0 420 150" fill="none">
          <path
            d="M15 36H405M15 76H405M15 116H405"
            stroke="currentColor"
            opacity=".13"
            strokeDasharray="3 6"
          />
          <path
            d="M15 124C55 124 55 16 90 16S130 134 166 134 201 41 238 41 281 97 315 97 365 73 405 76"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path d="M15 76H405" stroke="#c08047" strokeWidth="1.2" strokeDasharray="5 5" />
          <circle cx="405" cy="76" r="5" fill="#c08047" />
          <circle cx="15" cy="124" r="4" fill="currentColor" />
        </svg>
        <span className="field-lab-caption">不急着证明自己对，先设计一次可以修正的尝试。</span>
      </div>
    </section>
  )
}
