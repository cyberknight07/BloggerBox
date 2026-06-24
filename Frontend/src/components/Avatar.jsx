export default function Avatar({ user, size = 'md' }) {
  const initial = user?.username?.[0]?.toUpperCase() ?? '?'

  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.username}
        className={`avatar avatar-${size}`}
      />
    )
  }

  return <span className={`avatar avatar-${size}`}>{initial}</span>
}
