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
        <el-divider/>
        <div>
            <el-button @click="">筛选</el-button>
            <el-button @click="">取消选择</el-button>
            <el-button @click="clearSelection">取消选择</el-button>
        </div>
<!--        表格-->
        <el-table
                ref="multipleTable"
                v-loading="listLoading"
                :data="list"
                element-loading-text="Loading"
                border
                fit
                @select="handleSelectRow"
                @select-all="handleSelectAll"
                @sort-change="sortChange"
        >
            <el-table-column
                    type="selection"
                    prop="selection"
                    label="全选"
                    fixed
                    sortable
                    :selectable="handleDisable"
            />
            <el-table-column class-name="status-col" prop="status" label="当前状态" align="center" sortable fixed>
                <template slot-scope="scope">
                    <el-tag :type="scope.row.status | statusFilter">{{ scope.row.status | switchStatus }}</el-tag>
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
            <el-table-column align="center" prop="gmt_create" min-width="100" label="创建时间" sortable>
                <template slot-scope="scope">
                    <i class="el-icon-time"/>
                    <span>{{ scope.row.gmtCreate | formatDate }}</span>
                </template>
            </el-table-column>
            <el-table-column align="center" prop="gmt_modify" min-width="100" label="最后修改时间" sortable>
                <template slot-scope="scope">
                    <i class="el-icon-time"/>
                    <span>{{ scope.row.gmtModify |formatDate }}</span>
                </template>
            </el-table-column>
        </el-table>
<!--        分页-->
        <div class="block">
            <el-pagination
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="currentPage"
                    :page-sizes="[20, 50, 100, 150,200]"
                    :page-size="pageSize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total">
            </el-pagination>
        </div>
    </div>
</template>

<script>
    import store from '@/store'
    import {orderCodeStatusMap, orderStatusColorMap} from '@/utils/orderStatusMap'
    import {formatDate} from '@/utils'
    import {getOrders, batchUpdateStatus} from '@/api/order'
    import {getAllMaterials} from '@/api/material'

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
            // 日期格式化 str -> yyyy-MM-dd hh:mm
            formatDate(time) {
                return formatDate(new Date(time), 'yyyy-MM-dd hh:mm')
            }
        },
        data() {
            return {
                list: null, // 初始化时 fetchData 赋值
                listLoading: true,
                materialNameList: null,
                unitList: null,
                statusMap: {
                    1: '失效',
                    2: '存疑',
                    3: '配送中',
                    4: '已送达',
                    5: '已确认'
                },
                // 用来记录选中的行号
                selectedItems: null,
                // todo 条件查询
                // todo 分页
                currentPage:1,
                pageSize:20,
                total:null, // 初始化时 fetchData 赋值
                orderBy:"id",
                order:"ascending",
            }
        },
        created() {
            this.fetchData()
        },
        methods: {
            fetchData() {
                this.listLoading = true
                getOrders({
                    userId: store.getters.userId
                }).then(response => {
                    this.list = response.data.items
                    // this.total = response.data.total
                    this.total = 400
                    this.listLoading = false
                })
            },
            // 设置可选项，仅当状态为 3配送中 或 2存疑 时可选
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
                this.selectedItems = null
                this.$refs.multipleTable.clearSelection()
                this.$message({
                    type: 'success',
                    center: true,
                    message: '已清空所有选中记录'
                })
            },
            // 绑定 全选checkbox 选定方法
            handleSelectAll(selection) {
                this.selectedItems = selection
                const length = this.selectedItems == null ? 0 : this.selectedItems.length
                this.$message({
                    type: 'success',
                    center: true,
                    message: length + '\t条记录被选中'
                })
            },
            // 绑定 checkbox 选定方法
            handleSelectRow(selection, row) {
                this.selectedItems = selection
                const length = this.selectedItems == null ? 0 : this.selectedItems.length
                this.$message({
                    type: 'success',
                    center: true,
                    message: length + '\t条记录被选中'
                })
            },
            // 批量确认
            confirmOrders() {
                const length = this.selectedItems == null ? 0 : this.selectedItems.length
                if (length <= 0) {
                    this.$message({
                        type: 'error',
                        center: true,
                        message: '当前无选中记录'
                    })
                } else {
                    // 选择项大于 0 的请求进行确认
                    this.$confirm('确认更新\t' + length + '\t条记录吗')
                        .then(async () => {
                            // 获取 orderId 和
                            const list = []
                            for (let i = 0; i < this.selectedItems.length; i++) {
                                if(this.selectedItems[i].status !== 3){
                                        throw new Error("非法状态更新，请检查所选项状态。")
                                }
                                const id = this.selectedItems[i].id
                                list.push({id: id, status: 4})
                            }
                            await batchUpdateStatus(list)
                            // // 清空选择项和表格选中状态
                            this.selectedItems = null
                            this.$refs.multipleTable.clearSelection()
                            // 重新获取数据
                            this.fetchData()
                            this.$message({
                                type: 'success',
                                center: true,
                                message: length + '\t条记录执行成功'
                            })
                        })
                        .catch((error) => {
                            this.$message({
                                type: 'error',
                                center: true,
                                message: error.message+ '\t' + length + '\t条记录执行失败'
                            })
                        })
                }
            },
            // 批量失效
            batchFailure() {
                const length = this.selectedItems == null ? 0 : this.selectedItems.length
                if (length <= 0) {
                    this.$message({
                        type: 'error',
                        center: true,
                        message: '当前无选中记录'
                    })
                } else {
                    // 选择项大于 0 的请求进行确认
                    this.$confirm('确认失效\t' + length + '\t条记录吗')
                        .then(async () => {
                            // 获取 orderId 和
                            const list = []
                            for (let i = 0; i < this.selectedItems.length; i++) {
                                if(this.selectedItems[i].status !== 3 && this.selectedItems[i].status !== 2){
                                    throw new Error("非法状态更新，请检查所选项状态。")
                                }
                                const id = this.selectedItems[i].id
                                list.push({id: id, status: 1})
                            }
                            await batchUpdateStatus(list)
                            // // 清空选择项和表格选中状态
                            this.selectedItems = null
                            this.$refs.multipleTable.clearSelection()
                            // 重新获取数据
                            this.fetchData()
                            this.$message({
                                type: 'success',
                                center: true,
                                message: length + '\t条记录执行成功'
                            })
                        })
                        .catch((error) => {
                            this.$message({
                                type: 'error',
                                center: true,
                                message: error.message+ '\t' + length + '\t条记录执行失败'
                            })
                        })
                }
            },
            // 分页相关方法
            handleSizeChange(pageSize){
                console.log(this.pageSize)
                this.pageSize = pageSize
                console.log(this.pageSize)
            },
            // 分页相关方法
            handleCurrentChange(currentPage){
                this.currentPage = currentPage
            },
            // 分页相关方法，将分页情况与data绑定
            sortChange({ column, prop, order }){
                console.log(order)
                this.orderBy = prop
                this.order = order
            }
        }
    }
</script>
