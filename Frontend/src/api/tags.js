import client from './client'

export const listTags = async () => {
  const res = await client.get('/tags')
  return res.data.data
}

export const getTag = async (slug) => {
  const res = await client.get(`/tags/${slug}`)
  return res.data.data
}
