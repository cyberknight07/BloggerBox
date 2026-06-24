import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Avatar from './Avatar'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    setOpen(false)
    await logout()
    navigate('/')
  }

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="header-logo">
          Blog<span>Hub</span>
        </Link>

        <nav className="header-nav">
          {user ? (
            <>
              <Link to="/write" className="btn btn-ghost btn-sm">
                ✏ Write
              </Link>
              <div className="dropdown-wrap" ref={menuRef}>
                <button className="dropdown-trigger" onClick={() => setOpen((v) => !v)}>
                  <Avatar user={user} size="md" />
                </button>
                {open && (
                  <div className="dropdown-menu">
                    <Link
                      to={`/@${user.username}`}
                      className="dropdown-item"
                      onClick={() => setOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/write"
                      className="dropdown-item"
                      onClick={() => setOpen(false)}
                    >
                      New story
                    </Link>
                    <hr className="dropdown-divider" />
                    <button className="dropdown-item dropdown-item-danger" onClick={handleLogout}>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="header-link">
                Sign in
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
