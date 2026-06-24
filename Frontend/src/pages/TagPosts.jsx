import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import * as postsApi from '../api/posts'
import * as tagsApi from '../api/tags'
import PostCard from '../components/PostCard'
import Spinner from '../components/Spinner'

export default function TagPosts() {
  const { slug } = useParams()

  const { data: tagData } = useQuery({
    queryKey: ['tag', slug],
    queryFn: () => tagsApi.getTag(slug),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['posts', 'tag', slug],
    queryFn: () => postsApi.listPosts({ tag: slug, limit: 20 }),
  })

  const posts = data?.posts ?? []
  const tag = tagData?.tag
  const total = data?.pagination?.total ?? posts.length

  return (
    <div className="page-centered">
      <div className="tag-page-header">
        <p className="tag-page-label">Topic</p>
        <h1 className="tag-page-title">{tag?.name ?? slug}</h1>
        {total > 0 && (
          <p className="tag-page-count">{total} {total === 1 ? 'story' : 'stories'}</p>
        )}
      </div>

      {isLoading ? (
        <Spinner />
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <h3>No stories yet</h3>
          <p>Nothing has been published in this topic yet.</p>
        </div>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      )}
    </div>
  )
}
