import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '',
    timeout: 120000, // 2 min (check now can take time with LLM)
})

api.interceptors.response.use(
    (res) => res.data,
    (err) => {
        const message =
            err.response?.data?.message ||
            err.response?.data?.errors?.[0]?.message ||
            err.message ||
            'An unexpected error occurred'
        return Promise.reject(new Error(message))
    }
)

// Competitors
export const getCompetitors = (tag) =>
    api.get('/api/competitors', { params: tag ? { tag } : {} })

export const getCompetitor = (id) => api.get(`/api/competitors/${id}`)

export const createCompetitor = (data) => api.post('/api/competitors', data)

export const updateCompetitor = (id, data) =>
    api.put(`/api/competitors/${id}`, data)

export const deleteCompetitor = (id) => api.delete(`/api/competitors/${id}`)

// Check
export const checkNow = (id) => api.post(`/api/competitors/${id}/check`)

// History
export const getHistory = (id, urlType) =>
    api.get(`/api/competitors/${id}/history`, {
        params: urlType ? { urlType } : {},
    })

// Status
export const getStatus = () => api.get('/api/status')
