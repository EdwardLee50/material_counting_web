import request from '@/utils/request'

// 直接写在页面上了
// export function upload(form) {
//     return request({
//         url: '/file/upload',
//         method: 'post',
//         headers: {'Content-Type': 'multipart/form-data'},
//         data:form
//     })
// }
// export function download(file_name) {
//     return request({
//         url: '/file/download',
//         method: 'get',
//         params: {file_name: file_name},
//         responseType: 'blob'
//     })
// }