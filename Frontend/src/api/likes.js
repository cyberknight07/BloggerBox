import client from './client'

export const getLikeStatus = async (postSlug) => {
  const res = await client.get(`/posts/${postSlug}/likes`)
  return res.data.data
}

export const toggleLike = async (postSlug) => {
  const res = await client.post(`/posts/${postSlug}/likes`)
  return res.data.data
}
