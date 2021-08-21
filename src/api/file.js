import request from '@/utils/request'

export function upload(data) {
    return request({
        url: '/file/upload',
        method: 'post',
        data
    })
}

export function download(params) {
    return request({
        url: '/file/download',
        method: 'get',
        params: { params }
    })
}