import client from './client'

export const listComments = async (postSlug, params = {}) => {
  const res = await client.get(`/posts/${postSlug}/comments`, { params })
  return res.data.data
}

export const createComment = async (postSlug, data) => {
  const res = await client.post(`/posts/${postSlug}/comments`, data)
  return res.data.data
}

export const updateComment = async (id, data) => {
  const res = await client.put(`/comments/${id}`, data)
  return res.data.data
}

export const deleteComment = async (id) => {
  await client.delete(`/comments/${id}`)
}
