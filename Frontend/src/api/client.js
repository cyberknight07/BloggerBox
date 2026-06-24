import axios from 'axios'

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach access token to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('bh_access')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Queue failed requests while refreshing
let isRefreshing = false
let pendingQueue = []

const drainQueue = (err, token) => {
  pendingQueue.forEach(({ resolve, reject }) =>
    err ? reject(err) : resolve(token)
  )
  pendingQueue = []
}

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject })
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`
          return client(original)
        })
      }

      original._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('bh_refresh')
      if (!refreshToken) {
        isRefreshing = false
        return Promise.reject(error)
      }

      try {
        const { data } = await axios.post('/api/auth/refresh', { refreshToken })
        const newToken = data.data.accessToken
        localStorage.setItem('bh_access', newToken)
        drainQueue(null, newToken)
        original.headers.Authorization = `Bearer ${newToken}`
        isRefreshing = false
        return client(original)
      } catch (refreshErr) {
        drainQueue(refreshErr, null)
        isRefreshing = false
        localStorage.removeItem('bh_access')
        localStorage.removeItem('bh_refresh')
        localStorage.removeItem('bh_user')
        window.location.href = '/login'
        return Promise.reject(refreshErr)
      }
    }

    return Promise.reject(error)
  }
)

export default client
