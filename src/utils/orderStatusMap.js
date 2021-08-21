export const orderCodeStatusMap = {
    1: "失效",
    2: "存疑",
    3: "配送中",
    4: "已送达",
    5: "已确认"
}

export const orderStatusColorMap = {
    // :type ，用于改变tag样式   类型: string
    // 可选: success（绿色） / info（灰色） / warning（橙色） / danger（红色）
    // 默认空（蓝色）
    "失效": "info",
    "存疑": "danger",
    "配送中": "",
    "已送达": "warning",
    "已确认": "success"
}
