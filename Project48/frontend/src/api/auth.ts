import request from '@/utils/request'
import type { LoginRequest, LoginResponse, User, UserInfo } from '@/types'

export const authApi = {
  login(data: LoginRequest): Promise<LoginResponse> {
    return request.post<LoginResponse>('/auth/login', data)
  },

  getCurrentUser(): Promise<UserInfo> {
    return request.get<UserInfo>('/auth/me')
  },

  listUsers(): Promise<{ items: User[] }> {
    return request.get<{ items: User[] }>('/auth/users')
  }
}

export default authApi
