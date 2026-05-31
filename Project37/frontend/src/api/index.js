import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}

export function getCurrentUser() {
  return request({
    url: '/auth/me',
    method: 'get'
  })
}

export function getDocuments(params) {
  return request({
    url: '/documents',
    method: 'get',
    params
  })
}

export function getDocument(id) {
  return request({
    url: '/documents/' + id,
    method: 'get'
  })
}

export function uploadDocument(formData) {
  return request({
    url: '/documents/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function updateDocument(id, data) {
  return request({
    url: '/documents/' + id,
    method: 'put',
    data
  })
}

export function deleteDocument(id) {
  return request({
    url: '/documents/' + id,
    method: 'delete'
  })
}

export function getLatestDocuments() {
  return request({
    url: '/documents/latest',
    method: 'get'
  })
}

export function getPopularDocuments() {
  return request({
    url: '/documents/popular',
    method: 'get'
  })
}

export function getCategories() {
  return request({
    url: '/categories',
    method: 'get'
  })
}

export function getCategoriesByParent(parentId) {
  return request({
    url: '/categories/parent/' + parentId,
    method: 'get'
  })
}

export function createCategory(data) {
  return request({
    url: '/categories',
    method: 'post',
    data
  })
}

export function updateCategory(id, data) {
  return request({
    url: '/categories/' + id,
    method: 'put',
    data
  })
}

export function deleteCategory(id) {
  return request({
    url: '/categories/' + id,
    method: 'delete'
  })
}
