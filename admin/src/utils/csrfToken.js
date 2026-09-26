const csrfStorageKey = 'docnestCsrfToken'

export const getCsrfToken = () => {
    const name = 'csrfToken'
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop().split(';').shift()
    return window.localStorage.getItem(csrfStorageKey)
}

/**
 * Setup axios instance with automatic CSRF token injection
 */
export const setupCsrfInterceptor = (axiosInstance) => {
    axiosInstance.interceptors.response.use(
        response => {
            const token = response.headers?.['x-csrf-token']
            if (token) window.localStorage.setItem(csrfStorageKey, token)
            return response
        },
        error => Promise.reject(error)
    )

    axiosInstance.interceptors.request.use(
        (config) => {
            // Only add CSRF token for state-changing requests
            if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(config.method.toUpperCase())) {
                const csrfToken = getCsrfToken()
                if (csrfToken) {
                    config.headers['X-CSRF-Token'] = csrfToken
                }
            }
            return config
        },
        (error) => Promise.reject(error)
    )
    
    return axiosInstance
}

/**
 * Check if CSRF token is available in cookies
 */
export const hasCsrfToken = () => {
    return getCsrfToken() !== null
}

export default {
    getCsrfToken,
    setupCsrfInterceptor,
    hasCsrfToken
}
