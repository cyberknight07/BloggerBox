import { Link } from 'react-router-dom'

export default function TagBadge({ tag }) {
  const name = typeof tag === 'string' ? tag : tag.name
  const slug = typeof tag === 'string'
    ? tag.toLowerCase().replace(/\s+/g, '-')
    : tag.slug

  return (
    <Link to={`/tag/${slug}`} className="tag-badge">
      {name}
    </Link>
  )
}
