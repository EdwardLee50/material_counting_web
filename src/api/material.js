import request from "@/utils/request";

export function getAllMaterials(params) {
    return request({
        url: '/material/all',
        method: 'get',
        params
    })
}