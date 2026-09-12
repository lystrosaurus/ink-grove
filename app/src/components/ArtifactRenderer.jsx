import CoreArtifactRenderer from '../core/ArtifactRenderer.jsx'
import { Link } from '../context.jsx'

export default function ArtifactRenderer(props) {
  return <CoreArtifactRenderer {...props} InternalLink={Link} />
}
