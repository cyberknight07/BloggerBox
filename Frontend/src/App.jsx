import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import PostDetail from './pages/PostDetail'
import Profile from './pages/Profile'
import WritePost from './pages/WritePost'
import TagPosts from './pages/TagPosts'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/@:username" element={<Profile />} />
        <Route path="/tag/:slug" element={<TagPosts />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/write" element={<WritePost />} />
          <Route path="/edit/:slug" element={<WritePost />} />
        </Route>
        <Route path="/:slug" element={<PostDetail />} />
      </Route>
    </Routes>
  )
}
