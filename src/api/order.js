import request from '@/utils/request'

export function getOrders(params) {
  return request({
    url: '/order/query',
    method: 'GET',
    params
  })
}

export function getOrderPages(params) {
    return request({
        url: '/order/query/page',
        method: 'GET',
        params
    })
}

export function batchUpdateStatus(data) {
    return request({
        url: '/order/orders',
        method: 'POST',
        data
    })
}

export function batchCreateByExcel(data) {
    return request({
        url: '/batch/add/byExcel',
        method: 'POST',
        data
    })
}
