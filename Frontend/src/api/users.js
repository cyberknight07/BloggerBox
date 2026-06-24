import client from './client'

export const getProfile = async (username) => {
  const res = await client.get(`/users/${username}`)
  return res.data.data
}

export const getUserPosts = async (username, params = {}) => {
  const res = await client.get(`/users/${username}/posts`, { params })
  return res.data.data
}

export const updateProfile = async (data) => {
  const res = await client.put('/users/me', data)
  return res.data.data
}
