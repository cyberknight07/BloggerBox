import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import * as postsApi from '../api/posts'
import * as tagsApi from '../api/tags'
import { useAuth } from '../context/AuthContext'
import PostCard from '../components/PostCard'
import TagBadge from '../components/TagBadge'
import Spinner from '../components/Spinner'

export default function Home() {
  const { user } = useAuth()
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['posts', page],
    queryFn: () => postsApi.listPosts({ page, limit: 10 }),
  })

  const { data: tagsData } = useQuery({
    queryKey: ['tags'],
    queryFn: tagsApi.listTags,
    staleTime: 5 * 60 * 1000,
  })

  const posts = data?.posts ?? []
  const pagination = data?.pagination
  const tags = tagsData?.tags ?? []

  return (
    <>
      {!user && (
        <div className="home-hero">
          <div className="home-hero-inner">
            <h1>
              Human stories<br />
              &amp; <em>ideas</em>
            </h1>
            <p>A place to read, write, and deepen your understanding of the world.</p>
            <div className="hero-cta">
              <Link to="/register" className="btn btn-green">
                Start reading
              </Link>
              <Link to="/register" className="btn btn-outline">
                Start writing
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="page-with-sidebar">
        <div>
          {isLoading ? (
            <Spinner />
          ) : posts.length === 0 ? (
            <div className="empty-state">
              <h3>No stories yet</h3>
              <p>Be the first to share something amazing.</p>
              {user && (
                <Link to="/write" className="btn btn-green" style={{ marginTop: 16 }}>
                  Write a story
                </Link>
              )}
            </div>
          ) : (
            <>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}

              {pagination && pagination.totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="btn btn-outline btn-sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </button>
                  <span className="pagination-info">
                    {page} / {pagination.totalPages}
                  </span>
                  <button
                    className="btn btn-outline btn-sm"
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <aside className="sidebar">
          {tags.length > 0 && (
            <div className="sidebar-section">
              <div className="sidebar-title">Recommended topics</div>
              <div className="sidebar-tags">
                {tags.slice(0, 15).map((tag) => (
                  <TagBadge key={tag.slug} tag={tag} />
                ))}
              </div>
            </div>
          )}

          {!user && (
            <div className="sidebar-section">
              <div className="sidebar-title">Join BlogHub</div>
              <p style={{ fontSize: 14, color: 'var(--secondary)', marginBottom: 12, lineHeight: 1.5 }}>
                Share your voice with the world. Write stories that matter.
              </p>
              <Link
                to="/register"
                className="btn btn-green btn-sm"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Create a free account
              </Link>
            </div>
          )}

          {user && (
            <div className="sidebar-section">
              <div className="sidebar-title">Write a story</div>
              <p style={{ fontSize: 14, color: 'var(--secondary)', marginBottom: 12, lineHeight: 1.5 }}>
                Share your ideas, knowledge, or experience with the world.
              </p>
              <Link
                to="/write"
                className="btn btn-green btn-sm"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Start writing
              </Link>
            </div>
          )}
        </aside>
      </div>
    </>
  )
}
