import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import Avatar from './Avatar'
import TagBadge from './TagBadge'

export default function PostCard({ post }) {
  const tags = post.tags?.map((pt) => pt.tag) ?? []
  const date = post.publishedAt ? format(new Date(post.publishedAt), 'MMM d') : null
  const readTime = Math.max(1, Math.ceil((post.content?.length ?? 0) / 1000))

  return (
    <article className="post-card">
      <div className="post-card-author">
        <Link to={`/@${post.author.username}`}>
          <Avatar user={post.author} size="sm" />
        </Link>
        <Link to={`/@${post.author.username}`} className="post-card-author-name">
          {post.author.username}
        </Link>
      </div>

      <Link to={`/${post.slug}`} className="post-card-title">
        {post.title}
      </Link>

      {post.excerpt && (
        <p className="post-card-excerpt">{post.excerpt}</p>
      )}

      <div className="post-card-footer">
        {date && <span>{date}</span>}
        <span>{readTime} min read</span>
        {tags.slice(0, 2).map((tag) => (
          <TagBadge key={tag.slug} tag={tag} />
        ))}
        <span>♡ {post._count?.likes ?? 0}</span>
        <span>💬 {post._count?.comments ?? 0}</span>
      </div>
    </article>
  )
}
