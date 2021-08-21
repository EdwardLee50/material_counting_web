<template>
    <div class="app-container">
        <div>
            1、批量确认流程：
            <el-button @click="confirmOrders">批量确认</el-button>
        </div>
        <div>
            功能按键：
            <el-button @click="confirmOrders">批量确认</el-button>
            <el-button @click="batchFailure">批量失效</el-button>
        </div>
        <el-divider></el-divider>
        <div>
            <el-button @click="">筛选</el-button>
            <el-button @click="">取消选择</el-button>
            <el-button @click="clearSelection">取消选择</el-button>
        </div>
        <el-table ref="multipleTable" v-loading="listLoading" :data="list"
                  element-loading-text="Loading" border fit
                  @select="handleSelectRow"
                  @select-all="handleSelectAll"
        >
            <el-table-column type="selection" prop="selection" label="全选" fixed sortable
                             :selectable="handleDisable">
            </el-table-column>
            <el-table-column class-name="status-col" prop="status" label="当前状态" align="center" sortable fixed>
                <template slot-scope="scope">
                    <el-tag :type="scope.row.status | statusFilter">{{ scope.row.status | switchStatus}}</el-tag>
                </template>
            </el-table-column>
            <el-table-column align="center" prop="id" min-width="120" label="记录ID" sortable>
                <template slot-scope="scope">
                    {{ scope.row.id }}
                </template>
            </el-table-column>
            <el-table-column label="商家名" prop="sellerName" align="center" sortable>
                <template slot-scope="scope">
                    <span>{{ scope.row.shopSeller.name }}</span>
                </template>
            </el-table-column>
            <el-table-column label="职员名" prop="empName" align="center" sortable>
                <template slot-scope="scope">
                    <span>{{ scope.row.employee.name }}</span>
                </template>
            </el-table-column>
            <el-table-column label="物料名称" prop="material" align="center" sortable>
                <template slot-scope="scope">
                    {{ scope.row.material }}
                </template>
            </el-table-column>
            <el-table-column label="计量单位" prop="unit" width="60" align="center" sortable>
                <template slot-scope="scope">
                    {{ scope.row.unit }}
                </template>
            </el-table-column>
            <el-table-column label="数量" prop="number" width="60" align="center" sortable>
                <template slot-scope="scope">
                    {{ scope.row.number }}
                </template>
            </el-table-column>
            <el-table-column label="描述" prop="description" align="center" sortable>
                <template slot-scope="scope">
                    {{ scope.row.description }}
                </template>
            </el-table-column>
            <el-table-column align="center" prop="created_at" min-width="100" label="创建时间" sortable>
                <template slot-scope="scope">
                    <i class="el-icon-time"/>
                    <span>{{ scope.row.gmtCreate | formatDate }}</span>
                </template>
            </el-table-column>
            <el-table-column align="center" prop="modify_at" min-width="100" label="最后修改时间" sortable>
                <template slot-scope="scope">
                    <i class="el-icon-time"/>
                    <span>{{ scope.row.gmtModify |formatDate }}</span>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
    import store from "@/store";
    import {orderCodeStatusMap, orderStatusColorMap} from "@/utils/orderStatusMap";
    import {formatDate} from "@/utils"
    import {getOrders, batchUpdateStatus} from '@/api/order'
    import {getAllMaterials} from "@/api/material"


    export default {
        filters: {
            // 转换“状态”列单元格样式
            statusFilter(status) {
                return orderStatusColorMap[orderCodeStatusMap[status]]
            },
            // 转换“状态填充的内容”
            switchStatus(statusCode) {
                return orderCodeStatusMap[statusCode]
            },
            // 日期格式化
            formatDate(time) {
                return formatDate(new Date(time), "yyyy-MM-dd hh:mm");
            }
        },
        data() {
            return {
                list: null,
                listLoading: true,
                materialNameList: null,
                unitList: null,
                statusMap: {
                    1: "失效",
                    2: "存疑",
                    3: "配送中",
                    4: "已送达",
                    5: "已确认"
                },
                // 用来记录选中的行号
                selectedItems: null,
                // todo 条件查询
                // todo 分页
            }
        },
        created() {
            this.fetchData()
        },
        methods: {
            fetchData() {
                this.listLoading = true
                getOrders({
                    userId: store.getters.userId,
                }).then(response => {
                    this.list = response.data
                    this.listLoading = false
                })
            },
            //设置可选项
            handleDisable(row, index) {
                // 函数需要一个返回值,true为可选,false为不可选择
                if (row.status !== 3 && row.status !== 2) {
                    return false
                } else {
                    return true
                }
            },
            // 绑定“取消选择”的方法
            clearSelection() {
                this.selectedItems = null;
                this.$refs.multipleTable.clearSelection();
                this.$message({
                    type: "success",
                    center: true,
                    message: "已清空所有选中记录"
                })
            },
            // 绑定 全选checkbox 选定方法
            handleSelectAll(selection) {
                this.selectedItems = selection
                let length = this.selectedItems == null ? 0 : this.selectedItems.length
                this.$message({
                    type: "success",
                    center: true,
                    message: length + "\t条记录被选中"
                })
            },
            // 绑定 checkbox 选定方法
            handleSelectRow(selection, row) {
                this.selectedItems = selection;
                let length = this.selectedItems == null ? 0 : this.selectedItems.length
                this.$message({
                    type: "success",
                    center: true,
                    message: length + "\t条记录被选中"
                })
            },
            // 批量确认
            confirmOrders() {
                let length = this.selectedItems == null ? 0 : this.selectedItems.length
                if (length <= 0) {
                    this.$message({
                        type: "error",
                        center: true,
                        message: "当前无选中记录"
                    })
                } else {
                    // 选择项大于 0 的请求进行确认
                    if (confirm("确认失效 " + length + " 条记录吗")) {
                        // 获取 orderId 和
                        let list = [];
                        for (let i = 0; i < this.selectedItems.length; i++) {
                            let id = this.selectedItems[i].id;
                            list.push({id: id, status: 4});
                        }
                        batchUpdateStatus(list)
                        // 清空选择项和表格选中状态
                        this.selectedItems = null;
                        this.$refs.multipleTable.clearSelection();
                        // 重新获取数据
                        this.$message({
                            type: "success",
                            center: true,
                            message: length + "\t条记录执行成功"
                        })
                    }
                }
            },
            // 批量失效
            batchFailure() {
                let length = this.selectedItems == null ? 0 : this.selectedItems.length
                this.$confirm("确认失效" + length + "\t条记录吗")
                    .then(() => {
                        this.$message({
                            type: "success",
                            center: true,
                            message: length + "\t条记录执行成功"
                        })
                    })
                    .catch(() => {
                        this.$message({
                            type: "error",
                            center: true,
                            message: length + "\t条记录执行失败"
                        })
                    })
            }
        },
        activated() {
            this.fetchData()
            console.log("ac")
        }
    }
</script>
