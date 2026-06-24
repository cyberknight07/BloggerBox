import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import * as usersApi from '../api/users'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/Avatar'
import PostCard from '../components/PostCard'
import Spinner from '../components/Spinner'

export default function Profile() {
  const { username } = useParams()
  const { user: currentUser } = useAuth()

  const { data: profileData, isLoading: profileLoading, isError } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => usersApi.getProfile(username),
  })

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['userPosts', username],
    queryFn: () => usersApi.getUserPosts(username),
    enabled: !profileLoading,
  })

  if (profileLoading) return <Spinner />

  if (isError || !profileData?.user) {
    return (
      <div className="page-centered">
        <div className="empty-state">
          <h3>User not found</h3>
          <p>This account doesn't exist or has been removed.</p>
          <Link to="/" className="btn btn-outline" style={{ marginTop: 16 }}>
            Go home
          </Link>
        </div>
      </div>
    )
  }

  const profile = profileData.user
  const posts = postsData?.posts ?? []
  const isOwnProfile = currentUser?.username === username

  return (
    <>
      <div className="profile-header">
        <div className="profile-header-inner">
          <Avatar user={profile} size="2xl" />
          <div className="profile-info">
            <h1 className="profile-username">{profile.username}</h1>
            {profile.bio && <p className="profile-bio">{profile.bio}</p>}
            <div className="profile-stats">
              <div>
                <span className="profile-stat-val">{profile._count?.posts ?? 0}</span>
                <span className="profile-stat-lbl">Stories</span>
              </div>
              <div>
                <span className="profile-stat-val">{profile._count?.comments ?? 0}</span>
                <span className="profile-stat-lbl">Responses</span>
              </div>
            </div>
            <p className="profile-joined">
              Member since {format(new Date(profile.createdAt), 'MMMM yyyy')}
            </p>
            {isOwnProfile && (
              <div style={{ marginTop: 20 }}>
                <Link to="/write" className="btn btn-outline btn-sm">
                  Write a story
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="page-centered">
        <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 24 }}>
          Stories by {profile.username}
        </h2>

        {postsLoading ? (
          <Spinner />
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <p>
              {isOwnProfile
                ? "You haven't published any stories yet."
                : "No stories published yet."}
            </p>
            {isOwnProfile && (
              <Link to="/write" className="btn btn-green" style={{ marginTop: 16 }}>
                Write your first story
              </Link>
            )}
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </>
  )
}
