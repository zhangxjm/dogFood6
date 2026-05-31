import request from '@/utils/request'

export function login(username, password) {
  return request({
    url: '/auth/login',
    method: 'post',
    data: { username, password }
  })
}

export function register(data) {
  return request({
    url: '/auth/register',
    method: 'post',
    data
  })
}

export function getUserInfo() {
  return request({
    url: '/user/info',
    method: 'get'
  })
}

export function updateUser(data) {
  return request({
    url: '/user/update',
    method: 'put',
    data
  })
}

export function getUserList() {
  return request({
    url: '/user/list',
    method: 'get'
  })
}

export function deleteUser(id) {
  return request({
    url: `/user/${id}`,
    method: 'delete'
  })
}
