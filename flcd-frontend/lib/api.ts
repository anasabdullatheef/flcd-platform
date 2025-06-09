interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: any
  requireAuth?: boolean
}

class ApiClient {
  private baseURL: string
  private isRefreshing = false
  private refreshPromise: Promise<boolean> | null = null

  constructor(baseURL: string = 'http://localhost:3000/api') {
    this.baseURL = baseURL
  }

  private async refreshTokens(): Promise<boolean> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise
    }

    this.isRefreshing = true
    this.refreshPromise = this.performRefresh()
    
    const result = await this.refreshPromise
    this.isRefreshing = false
    this.refreshPromise = null
    
    return result
  }

  private async performRefresh(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        return false
      }

      const response = await fetch(`${this.baseURL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
        return true
      } else {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        return false
      }
    } catch (error) {
      console.error('Token refresh error:', error)
      return false
    }
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('accessToken')
    return token ? { 'Authorization': `Bearer ${token}` } : {}
  }

  private async makeRequest<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      requireAuth = true
    } = config

    const url = `${this.baseURL}${endpoint}`
    
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers
    }

    if (requireAuth) {
      Object.assign(requestHeaders, this.getAuthHeaders())
    }

    const requestConfig: RequestInit = {
      method,
      headers: requestHeaders
    }

    if (body && method !== 'GET') {
      requestConfig.body = JSON.stringify(body)
    }

    try {
      let response = await fetch(url, requestConfig)

      // If unauthorized and we have auth enabled, try to refresh token
      if (response.status === 401 && requireAuth) {
        const refreshSuccess = await this.refreshTokens()
        
        if (refreshSuccess) {
          // Retry the request with new token
          Object.assign(requestHeaders, this.getAuthHeaders())
          requestConfig.headers = requestHeaders
          response = await fetch(url, requestConfig)
        } else {
          // Refresh failed, redirect to login
          window.location.href = '/'
          return { error: 'Authentication failed' }
        }
      }

      const data = await response.json()

      if (response.ok) {
        return { data }
      } else {
        return { error: data.error || 'Request failed' }
      }
    } catch (error) {
      console.error('API request error:', error)
      return { 
        error: error instanceof Error ? error.message : 'Network error' 
      }
    }
  }

  // Public methods
  async get<T>(endpoint: string, requireAuth = true): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'GET', requireAuth })
  }

  async post<T>(endpoint: string, body?: any, requireAuth = true): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'POST', body, requireAuth })
  }

  async put<T>(endpoint: string, body?: any, requireAuth = true): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'PUT', body, requireAuth })
  }

  async delete<T>(endpoint: string, requireAuth = true): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE', requireAuth })
  }

  // Auth specific methods
  async login(email: string, password: string): Promise<ApiResponse> {
    return this.post('/auth/login', { email, password }, false)
  }

  async logout(): Promise<void> {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    window.location.href = '/'
  }

  async getProfile(): Promise<ApiResponse> {
    return this.get('/users/profile')
  }
}

export const apiClient = new ApiClient()
export default apiClient