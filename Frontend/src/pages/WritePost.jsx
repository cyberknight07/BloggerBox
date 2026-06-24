import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { marked } from 'marked'
import * as postsApi from '../api/posts'
import Spinner from '../components/Spinner'

marked.setOptions({ breaks: true })

export default function WritePost() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(slug)
  const titleRef = useRef(null)

  const [form, setForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    tags: '',
    status: 'DRAFT',
  })
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(false)
  const [saved, setSaved] = useState(false)

  const { data: editData, isLoading } = useQuery({
    queryKey: ['post', slug],
    queryFn: () => postsApi.getPost(slug),
    enabled: isEditing,
  })

  useEffect(() => {
    if (editData?.post) {
      const p = editData.post
      setForm({
        title: p.title ?? '',
        content: p.content ?? '',
        excerpt: p.excerpt ?? '',
        tags: p.tags?.map((pt) => pt.tag.name).join(', ') ?? '',
        status: p.status ?? 'DRAFT',
      })
    }
  }, [editData])

  useEffect(() => {
    if (!isEditing) titleRef.current?.focus()
  }, [isEditing])

  const saveMutation = useMutation({
    mutationFn: ({ status }) => {
      const payload = {
        title: form.title,
        content: form.content,
        excerpt: form.excerpt || undefined,
        status,
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      }
      return isEditing
        ? postsApi.updatePost(slug, payload)
        : postsApi.createPost(payload)
    },
    onSuccess: (data) => {
      const newSlug = data.post?.slug
      if (newSlug) navigate(`/${newSlug}`)
    },
    onError: (err) => {
      setError(err.response?.data?.message ?? 'Failed to save. Please try again.')
    },
  })

  const handleSave = (status) => {
    setError('')
    if (!form.title.trim()) { setError('Title is required.'); return }
    if (!form.content.trim()) { setError('Content is required.'); return }
    saveMutation.mutate({ status })
  }

  const autoResize = (e) => {
    e.target.style.height = 'auto'
    e.target.style.height = e.target.scrollHeight + 'px'
  }

  if (isEditing && isLoading) return <Spinner />

  const statusClass = form.status === 'PUBLISHED' ? 'status-published' : 'status-draft'

  return (
    <>
      <div className="write-header">
        <div className="write-header-left">
          <span className={`status-pill ${statusClass}`}>{form.status}</span>
          {error && (
            <span style={{ fontSize: 13, color: 'var(--error)' }}>{error}</span>
          )}
        </div>
        <div className="write-header-right">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setPreview((v) => !v)}
          >
            {preview ? 'Edit' : 'Preview'}
          </button>
          <button
            className="btn btn-outline btn-sm"
            disabled={saveMutation.isPending}
            onClick={() => handleSave('DRAFT')}
          >
            Save draft
          </button>
          <button
            className="btn btn-green btn-sm"
            disabled={saveMutation.isPending}
            onClick={() => handleSave('PUBLISHED')}
          >
            {saveMutation.isPending ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="write-page">
        {preview ? (
          <>
            <h1 className="post-detail-title">{form.title || 'Untitled'}</h1>
            {form.excerpt && (
              <p className="post-detail-subtitle">{form.excerpt}</p>
            )}
            <div
              className="article-content"
              dangerouslySetInnerHTML={{ __html: marked.parse(form.content) }}
            />
          </>
        ) : (
          <>
            <textarea
              ref={titleRef}
              className="write-title"
              placeholder="Title"
              value={form.title}
              rows={1}
              onChange={(e) => {
                setForm((f) => ({ ...f, title: e.target.value }))
                autoResize(e)
              }}
            />

            <input
              type="text"
              className="write-tags"
              placeholder="Tags (comma separated — e.g. Technology, Design, Science)"
              value={form.tags}
              onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
            />

            <textarea
              className="write-body"
              placeholder="Tell your story… (Markdown supported)"
              value={form.content}
              onChange={(e) => {
                setForm((f) => ({ ...f, content: e.target.value }))
                autoResize(e)
              }}
            />
          </>
        )}
      </div>
    </>
  )
}
