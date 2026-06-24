import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { marked } from 'marked'
import * as postsApi from '../api/posts'
import * as likesApi from '../api/likes'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/Avatar'
import TagBadge from '../components/TagBadge'
import CommentSection from '../components/CommentSection'
import Spinner from '../components/Spinner'

marked.setOptions({ breaks: true })

export default function PostDetail() {
  const { slug } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: postData, isLoading, isError } = useQuery({
    queryKey: ['post', slug],
    queryFn: () => postsApi.getPost(slug),
  })

  const { data: likeData } = useQuery({
    queryKey: ['likes', slug],
    queryFn: () => likesApi.getLikeStatus(slug),
  })

  const likeMutation = useMutation({
    mutationFn: () => likesApi.toggleLike(slug),
    onSuccess: (data) => {
      qc.setQueryData(['likes', slug], data)
      qc.invalidateQueries({ queryKey: ['post', slug] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => postsApi.deletePost(slug),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts'] })
      navigate('/')
    },
  })

  if (isLoading) return <Spinner />

  if (isError || !postData?.post) {
    return (
      <div className="post-detail">
        <div className="empty-state">
          <h3>Story not found</h3>
          <p>This story may have been removed or doesn't exist.</p>
          <Link to="/" className="btn btn-outline" style={{ marginTop: 16 }}>
            Go home
          </Link>
        </div>
      </div>
    )
  }

  const { post } = postData
  const tags = post.tags?.map((pt) => pt.tag) ?? []
  const liked = likeData?.liked ?? false
  const likeCount = likeData?.likes ?? post._count?.likes ?? 0
  const isAuthor = user?.id === post.author.id
  const readTime = Math.max(1, Math.ceil((post.content?.length ?? 0) / 1000))
  const publishedDate = post.publishedAt
    ? format(new Date(post.publishedAt), 'MMMM d, yyyy')
    : null

  const contentHtml = marked.parse(post.content ?? '')

  const handleLike = () => {
    if (!user) {
      navigate('/login')
      return
    }
    likeMutation.mutate()
  }

  const handleDelete = () => {
    if (window.confirm('Delete this story permanently?')) {
      deleteMutation.mutate()
    }
  }

  return (
    <article className="post-detail">
      <Link to="/" className="back-link">← Back to stories</Link>

      {tags.length > 0 && (
        <div className="post-detail-tags">
          {tags.map((tag) => (
            <TagBadge key={tag.slug} tag={tag} />
          ))}
        </div>
      )}

      <h1 className="post-detail-title">{post.title}</h1>

      {post.excerpt && (
        <p className="post-detail-subtitle">{post.excerpt}</p>
      )}

      <div className="post-detail-author">
        <Link to={`/@${post.author.username}`}>
          <Avatar user={post.author} size="lg" />
        </Link>
        <div>
          <Link to={`/@${post.author.username}`} className="post-detail-author-name">
            {post.author.username}
          </Link>
          <div className="post-detail-author-meta">
            {publishedDate && `${publishedDate} · `}{readTime} min read
          </div>
        </div>

        {isAuthor && (
          <div className="post-author-actions">
            <Link to={`/edit/${slug}`} className="btn btn-outline btn-sm">
              Edit
            </Link>
            <button
              className="btn btn-danger btn-sm"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              Delete
            </button>
          </div>
        )}
      </div>

      <div
        className="article-content"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />

      <div className="post-actions">
        <button className={`like-btn${liked ? ' liked' : ''}`} onClick={handleLike}>
          <svg viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {likeCount}
        </button>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--secondary)', fontSize: 15 }}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {post._count?.comments ?? 0}
        </span>
      </div>

      {/* Author bio */}
      <div className="author-bio-card">
        <Link to={`/@${post.author.username}`}>
          <Avatar user={post.author} size="xl" />
        </Link>
        <div>
          <h4>
            <Link to={`/@${post.author.username}`}>{post.author.username}</Link>
          </h4>
          <p>{post.author.bio || 'No bio yet.'}</p>
          <Link
            to={`/@${post.author.username}`}
            className="btn btn-outline btn-sm"
            style={{ marginTop: 12 }}
          >
            More stories
          </Link>
        </div>
      </div>

      <CommentSection postSlug={slug} />
    </article>
  )
}
