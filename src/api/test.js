import request from '@/utils/request'

export function getTest() {
  return request({
    url: '/test',
    method: 'get'
  })
}
