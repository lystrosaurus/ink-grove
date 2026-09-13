import { ArrowUpRight } from 'lucide-react'
import { Link, useGrove } from '../context.jsx'
import { ArtifactCard, SectionHead } from './Shared.jsx'
import '../edition.css'

const essays = ['methods-with-boundaries', 'a-life-that-fits', 'shared-ground']
const paths = [
  ['01', '学过了，怎样用出来？', '主动阅读 → 提取练习 → 真实反馈', 'learning-laboratory'],
  ['02', '一句主张，凭什么相信？', '论证 → 概率 → 模型的边界', 'clearer-judgment'],
  ['03', '很忙的项目，该往哪走？', '诊断 → 取舍 → 讲清理由', 'acting-in-complexity'],
  ['04', '页面好看，也容易使用吗？', '操作线索 → 视觉层级 → 选择环境', 'designed-understanding'],
  ['05', '共同使用，怎样一起照料？', '资源 → 规则 → 合作与修正', 'shared-resources'],
  ['06', '怎样给生活留出位置？', '需要 → 取舍 → 意义与在场', 'intentional-living'],
]

export default function ReadingEdition() {
  const { artifacts } = useGrove()
  const items = essays.map((id) => artifacts.find((item) => item.id === id)).filter(Boolean)
  return (
    <section className="reading-edition" aria-labelledby="reading-edition-title">
      <div className="reading-edition-intro">
        <span className="eyebrow">VOL. 002 · READ, QUESTION, RECONSIDER</span>
        <h2 id="reading-edition-title">让书彼此对话，也让方法接受追问。</h2>
        <p>从一个真问题出发。比较观点、保留分歧，再把一个可以承担的尝试带回生活。</p>
      </div>
      <div className="reading-edition-essays">
        {items.map((artifact) => (
          <ArtifactCard key={artifact.id} artifact={artifact} />
        ))}
      </div>
      <SectionHead
        eyebrow="START WITH A QUESTION"
        title="带着眼前的问题，选一条小径"
        description="每条路线都有不同入口；不必从第一本读起，也不必读完全部。"
        to="/collections"
        action="查看全部集合"
      />
      <div className="reading-edition-paths">
        {paths.map(([number, question, description, id]) => (
          <Link key={id} className="reading-edition-path" to={`/collections/${id}`}>
            <span className="reading-edition-number">{number}</span>
            <div>
              <h3>{question}</h3>
              <p>{description}</p>
            </div>
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  )
}
