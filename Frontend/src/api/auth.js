import client from './client'

export const register = async (data) => {
  const res = await client.post('/auth/register', data)
  return res.data.data
}

export const login = async (data) => {
  const res = await client.post('/auth/login', data)
  return res.data.data
}

export const refresh = async (data) => {
  const res = await client.post('/auth/refresh', data)
  return res.data.data
}

export const logout = async (data) => {
  await client.post('/auth/logout', data)
}

export const me = async () => {
  const res = await client.get('/auth/me')
  return res.data.data
}
