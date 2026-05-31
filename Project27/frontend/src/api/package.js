import request from '@/utils/request'

export function getPackageList(status) {
  return request({
    url: '/package/list',
    method: 'get',
    params: { status }
  })
}

export function getPackageDetail(id) {
  return request({
    url: `/package/${id}`,
    method: 'get'
  })
}

export function savePackage(data) {
  return request({
    url: '/package/save',
    method: 'post',
    data
  })
}

export function updatePackage(data) {
  return request({
    url: '/package/update',
    method: 'put',
    data
  })
}

export function deletePackage(id) {
  return request({
    url: `/package/${id}`,
    method: 'delete'
  })
}
