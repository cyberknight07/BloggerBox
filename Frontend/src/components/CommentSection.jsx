import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import * as commentsApi from '../api/comments'
import { useAuth } from '../context/AuthContext'
import Avatar from './Avatar'
import Spinner from './Spinner'

function Reply({ reply }) {
  return (
    <div className="comment-item" style={{ marginBottom: 16 }}>
      <Link to={`/@${reply.author.username}`}>
        <Avatar user={reply.author} size="sm" />
      </Link>
      <div className="comment-body">
        <div className="comment-header">
          <Link to={`/@${reply.author.username}`} className="comment-author">
            {reply.author.username}
          </Link>
          <span className="comment-date">
            {format(new Date(reply.createdAt), 'MMM d, yyyy')}
          </span>
        </div>
        <p className="comment-text">{reply.content}</p>
      </div>
    </div>
  )
}

function CommentItem({ comment, postSlug }) {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [replying, setReplying] = useState(false)
  const [replyText, setReplyText] = useState('')

  const deleteMutation = useMutation({
    mutationFn: () => commentsApi.deleteComment(comment.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments', postSlug] }),
  })

  const replyMutation = useMutation({
    mutationFn: (content) =>
      commentsApi.createComment(postSlug, { content, parentId: comment.id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', postSlug] })
      setReplyText('')
      setReplying(false)
    },
  })

  const isOwner = user?.id === comment.author.id

  return (
    <div className="comment-item">
      <Link to={`/@${comment.author.username}`}>
        <Avatar user={comment.author} size="sm" />
      </Link>
      <div className="comment-body">
        <div className="comment-header">
          <Link to={`/@${comment.author.username}`} className="comment-author">
            {comment.author.username}
          </Link>
          <span className="comment-date">
            {format(new Date(comment.createdAt), 'MMM d, yyyy')}
          </span>
        </div>

        <p className="comment-text">{comment.content}</p>

        <div className="comment-btns">
          {user && (
            <button className="comment-btn" onClick={() => setReplying((v) => !v)}>
              {replying ? 'Cancel' : 'Reply'}
            </button>
          )}
          {isOwner && (
            <button
              className="comment-btn comment-btn-danger"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              Delete
            </button>
          )}
        </div>

        {replying && (
          <div style={{ marginTop: 12 }}>
            <textarea
              className="comment-textarea"
              style={{ minHeight: 72, fontSize: 14 }}
              placeholder="Write a reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <div className="comment-actions-row">
              <button
                className="btn btn-primary btn-sm"
                disabled={!replyText.trim() || replyMutation.isPending}
                onClick={() => replyMutation.mutate(replyText)}
              >
                {replyMutation.isPending ? 'Posting...' : 'Reply'}
              </button>
            </div>
          </div>
        )}

        {comment.replies?.length > 0 && (
          <div className="replies-section">
            {comment.replies.map((r) => (
              <Reply key={r.id} reply={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function CommentSection({ postSlug }) {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [text, setText] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['comments', postSlug],
    queryFn: () => commentsApi.listComments(postSlug),
  })

  const createMutation = useMutation({
    mutationFn: (content) => commentsApi.createComment(postSlug, { content }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', postSlug] })
      setText('')
    },
  })

  const comments = data?.comments ?? []
  const total = data?.pagination?.total ?? 0

  return (
    <section className="comments-section">
      <h3 className="comments-title">Responses ({total})</h3>

      {user ? (
        <div className="comment-form">
          <textarea
            className="comment-textarea"
            placeholder="What are your thoughts?"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="comment-actions-row">
            <button
              className="btn btn-primary btn-sm"
              disabled={!text.trim() || createMutation.isPending}
              onClick={() => createMutation.mutate(text)}
            >
              {createMutation.isPending ? 'Posting...' : 'Respond'}
            </button>
          </div>
        </div>
      ) : (
        <p style={{ marginBottom: 32, fontSize: 15, color: 'var(--secondary)' }}>
          <Link to="/login" style={{ color: 'var(--green)' }}>Sign in</Link> to leave a response.
        </p>
      )}

      {isLoading ? (
        <Spinner />
      ) : comments.length === 0 ? (
        <p style={{ color: 'var(--secondary)', fontSize: 15 }}>
          No responses yet. Be the first to share your thoughts!
        </p>
      ) : (
        comments.map((c) => (
          <CommentItem key={c.id} comment={c} postSlug={postSlug} />
        ))
      )}
    </section>
  )
}
