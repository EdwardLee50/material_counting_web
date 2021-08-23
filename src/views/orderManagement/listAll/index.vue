<template>
    <div class="app-container">
        <el-card class="box-card" v-loading.fullscreen.lock="fullscreenLoading">
            {{queryObject}}
            <div>
                1、批量确认流程：
                <el-button @click="confirmOrders">批量确认</el-button>
            </div>
            <div>
                功能按键：
                <el-button @click="confirmOrders">批量送达</el-button>
                <el-button @click="batchFailure">批量失效</el-button>
                <el-button @click="batchSignIn">批量签收</el-button>
                <el-button @click="batchInDoubt">批量存疑</el-button>
            </div>
            <el-divider/>

            <!--            条件查询-->
            <div>
                <!--                日期筛选-->
                <el-card>
                    <el-dropdown @command="handleStatusFilterClick">
                        <el-button split-button>
                            当前状态<i class="el-icon-arrow-down el-icon--right"></i>
                        </el-button>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item command="1">失效</el-dropdown-item>
                            <el-dropdown-item command="2">存疑</el-dropdown-item>
                            <el-dropdown-item command="3">配送中</el-dropdown-item>
                            <el-dropdown-item command="4">已送达</el-dropdown-item>
                            <el-dropdown-item command="5">已确认</el-dropdown-item>
                            <el-dropdown-item command="-1" divided>显示所有</el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                    <el-divider direction="vertical"></el-divider>
                    创建时间
                    <el-date-picker v-model="queryObject.dataDate"
                                    size="medium"
                                    type="daterange"
                                    format="yyyy 年 MM 月 dd 日"
                                    value-format="yyyy-MM-dd"
                                    start-placeholder="开始时间"
                                    end-placeholder="结束时间"
                                    @change="handleDateChange"
                    />
                </el-card>
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
                <el-table-column class-name="status-col" prop="status" label="当前状态" align="center" fixed>
                    <template slot-scope="scope">
                        <el-tag :type="scope.row.status | statusFilter">{{ scope.row.status | switchStatus }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column align="center" prop="id" min-width="120" label="记录ID">
                    <template slot-scope="scope">
                        {{ scope.row.id }}
                    </template>
                </el-table-column>
                <el-table-column label="商家名" prop="sellerName" align="center">
                    <template slot-scope="scope">
                        <span>{{ scope.row.shopSeller.name }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="职员名" prop="empName" align="center">
                    <template slot-scope="scope">
                        <span>{{ scope.row.employee.name }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="物料名称" prop="material" align="center">
                    <template slot-scope="scope">
                        {{ scope.row.material }}
                    </template>
                </el-table-column>
                <el-table-column label="计量单位" prop="unit" width="60" align="center">
                    <template slot-scope="scope">
                        {{ scope.row.unit }}
                    </template>
                </el-table-column>
                <el-table-column label="数量" prop="number" width="60" align="center">
                    <template slot-scope="scope">
                        {{ scope.row.number }}
                    </template>
                </el-table-column>
                <el-table-column label="描述" prop="description" align="center">
                    <template slot-scope="scope">
                        {{ scope.row.description }}
                    </template>
                </el-table-column>
                <el-table-column align="center" prop="gmt_create" min-width="100" label="创建时间">
                    <template slot-scope="scope">
                        <i class="el-icon-time"/>
                        <span>{{ scope.row.gmtCreate | formatDate }}</span>
                    </template>
                </el-table-column>
                <el-table-column align="center" prop="gmt_modify" min-width="100" label="最后修改时间">
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
                        :page-sizes="[10, 20, 50, 100,150]"
                        :page-size="pageSize"
                        layout="total, sizes, prev, pager, next, jumper"
                        :total="total">
                </el-pagination>
            </div>
        </el-card>
    </div>
</template>

<script>
    import store from '@/store'
    import {orderCodeStatusMap, orderStatusColorMap} from '@/utils/orderStatusMap'
    import {formatDate} from '@/utils'
    import {batchUpdateStatus, getOrderPages} from '@/api/order'

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
                // 全局遮罩
                fullscreenLoading: false,
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
                queryObject: {
                    dataDate: [],
                    orderInfo: {
                        orderId: null,
                        material: null,
                        unit: null,
                        number: null,
                        status: null,
                        sellerId: null,
                        employeeId: null,
                    }
                },
                // todo 分页
                currentPage: 1, // 初始化为第一页
                pageSize: 10, // 初始化每页 10 项
                total: null, // 初始化时 fetchData 赋值
                orderBy: "id",
                order: "ascending",
            }
        },
        created() {
            this.fetchData()
        },
        methods: {
            fetchData() {
                this.listLoading = true
                getOrderPages({
                    userId: store.getters.userId,
                    currentPage: this.currentPage,
                    pageSize: this.pageSize,
                    start: this.queryObject.dataDate[0],
                    end: this.queryObject.dataDate[1],
                    status: this.queryObject.orderInfo.status
                }).then(response => {
                    this.list = response.data.items
                    this.total = response.data.totalCount
                    this.listLoading = false
                })
            },
            // 设置可选项， emp 仅当状态为 3配送中 或 2存疑 时可选， seller 仅当状态为 4已送达 时可选
            handleDisable(row, index) {
                // 函数需要一个返回值,true为可选,false为不可选择
                if (store.getters.role === 1) {
                    return !(row.status === 3 && row.status === 2)
                } else if (store.getters.role === 2) {
                    return row.status === 4
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
                if (this.selectedItems !== null) {
                    this.selectedItems = null
                    this.$refs.multipleTable.clearSelection()
                } else {
                    this.selectedItems = selection
                    const length = this.selectedItems == null ? 0 : this.selectedItems.length
                    this.$message({
                        type: 'success',
                        center: true,
                        message: length + '\t条记录被选中'
                    })
                }
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
            // 批量修改状态
            batchChangeStatus(statusCode) {
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
                            // 获取 orderId 和状态
                            const list = []
                            for (let i = 0; i < this.selectedItems.length; i++) {
                                // from to 状态检验，不通过抛异常
                                this.validateFromToStatus(this.selectedItems[i].status, statusCode)
                                list.push({id: this.selectedItems[i].id, status: statusCode})
                            }
                            // 获取全局遮罩禁止用户操作
                            this.fullscreenLoading = true
                            await batchUpdateStatus(list)
                            this.fullscreenLoading = false
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
                            console.log(error.message)
                            let message = "";
                            if (error.message !== null && error.message !== undefined) {
                                message = error.message
                            }
                            this.$message({
                                type: 'error',
                                center: true,
                                message: message + length + '\t条记录执行失败'
                            })
                        })
                }
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
                            // 获取 orderId 和状态
                            const list = []
                            for (let i = 0; i < this.selectedItems.length; i++) {
                                if (this.selectedItems[i].status !== 3) {
                                    throw new Error("非法状态更新，请检查所选项状态。")
                                }
                                const id = this.selectedItems[i].id
                                list.push({id: id, status: 4})
                            }
                            // 获取全局遮罩禁止用户操作
                            let loadingInstance = this.$loading({
                                fullscreen: true,
                            })
                            console.log(loadingInstance)
                            this.$nextTick(() => { // 以服务的方式调用的 Loading 需要异步关闭
                                loadingInstance.close();
                            });
                            this.fullscreenLoading = true
                            await batchUpdateStatus(list)
                            this.fullscreenLoading = false
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
                            console.log(error.message)
                            let message = "";
                            if (error.message !== null && error.message !== undefined) {
                                message = error.message
                            }
                            this.$message({
                                type: 'error',
                                center: true,
                                message: message + length + '\t条记录执行失败'
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
                    this.$confirm('确认签收\t' + length + '\t条记录吗')
                        .then(async () => {
                            // 获取 orderId 和
                            const list = []
                            for (let i = 0; i < this.selectedItems.length; i++) {
                                if (this.selectedItems[i].status !== 3 && this.selectedItems[i].status !== 2) {
                                    throw new Error("非法状态更新，请检查所选项状态。")
                                }
                                const id = this.selectedItems[i].id
                                list.push({id: id, status: 5})
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
                                message: error.message + '\t' + length + '\t条记录执行失败'
                            })
                        })
                }
            },
            // 批量签收
            batchSignIn() {
                const length = this.selectedItems == null ? 0 : this.selectedItems.length
                if (length <= 0) {
                    this.$message({
                        type: 'error',
                        center: true,
                        message: '当前无选中记录'
                    })
                } else {
                    // 选择项大于 0 的请求进行确认
                    this.$confirm('确认签收\t' + length + '\t条记录吗')
                        .then(async () => {
                            // 获取 orderId 和
                            const list = []
                            for (let i = 0; i < this.selectedItems.length; i++) {
                                if (this.selectedItems[i].status !== 4) {
                                    throw new Error("非法状态更新，请检查所选项状态。")
                                }
                                const id = this.selectedItems[i].id
                                list.push({id: id, status: 5})
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
                                message: error.message + '\t' + length + '\t条记录执行失败'
                            })
                        })
                }
            },
            // 批量存疑
            batchInDoubt() {
                const length = this.selectedItems == null ? 0 : this.selectedItems.length
                if (length <= 0) {
                    this.$message({
                        type: 'error',
                        center: true,
                        message: '当前无选中记录'
                    })
                } else {
                    // 选择项大于 0 的请求进行确认
                    this.$confirm('确认存疑\t' + length + '\t条记录吗')
                        .then(async () => {
                            // 获取 orderId 和
                            const list = []
                            for (let i = 0; i < this.selectedItems.length; i++) {
                                if (this.selectedItems[i].status !== 4) {
                                    throw new Error("非法状态更新，请检查所选项状态。")
                                }
                                const id = this.selectedItems[i].id
                                list.push({id: id, status: 2})
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
                                message: error.message + '\t' + length + '\t条记录执行失败'
                            })
                        })
                }
            },
            // from to 状态检验
            validateFromToStatus(from, to) {
                switch (to) {
                    case 4:
                        if (from !== 3) {
                            throw new Error("非法状态更新，请检查所选项状态。")
                        }
                        break;
                    case 5:
                        if (from !== 4) {
                            throw new Error("非法状态更新，请检查所选项状态。")
                        }
                        break;
                    case 2:
                        if (from !== 4) {
                            throw new Error("非法状态更新，请检查所选项状态。")
                        }
                        break;
                    case 1:
                        if (from !== 2 && from !== 3) {
                            throw new Error("非法状态更新，请检查所选项状态。")
                        }
                        break;
                }
            },
            // 分页相关方法
            handleSizeChange(pageSize) {
                this.pageSize = pageSize
                this.fetchData()
            },
            // 分页相关方法
            handleCurrentChange(currentPage) {
                this.currentPage = currentPage
                this.fetchData()
            },
            // 分页相关方法，将分页情况与data绑定
            sortChange({column, prop, order}) {
                console.log(order)
                this.orderBy = prop
                this.order = order
                this.fetchData()
            },
            // 绑定状态筛选按钮事件
            handleStatusFilterClick(statusCode) {
                this.queryObject.orderInfo.status = statusCode;
                this.fetchData()
            },
            // 绑定日期选择事件
            handleDateChange(args) {
                if (args !== null) {
                    this.fetchData()
                } else {
                    this.queryObject.dataDate = []
                    this.fetchData()
                }
            }
        },
    }
</script>
