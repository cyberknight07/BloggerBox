import client from './client'

export const listPosts = async (params = {}) => {
  const res = await client.get('/posts', { params })
  return res.data.data
}

export const getPost = async (slug) => {
  const res = await client.get(`/posts/${slug}`)
  return res.data.data
}

export const createPost = async (data) => {
  const res = await client.post('/posts', data)
  return res.data.data
}

export const updatePost = async (slug, data) => {
  const res = await client.put(`/posts/${slug}`, data)
  return res.data.data
}

export const deletePost = async (slug) => {
  await client.delete(`/posts/${slug}`)
}
