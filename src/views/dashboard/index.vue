<template>
    <el-card class="app-container">
        <el-collapse v-model="activeName" accordion>
            <div v-for="(item,index) in items" :key="item.name">
                <el-collapse-item :name="item.name" style="margin-left: 10px">
                    <template slot="title">
                        <i class="header-icon el-icon-s-home"></i>{{item.title}}
                    </template>
                    <template v-for="(section,index) in item.content">
                        <div>{{section}}</div>
                    </template>
                </el-collapse-item>
                <div class="demo-image">
                    <div class="demonstration">状态转换流程简述</div>
                    <el-image :src="src" style="width: 50%"></el-image>
                </div>
            </div>
        </el-collapse>
    </el-card>

</template>

<script>

    export default {
        name: 'Dashboard',
        data() {
            return {
                // 图片位置
                src: require('@/assets/状态转换图.png'),
                // 对应items中的每一个name,设置默认展开
                activeName: 1,
                items: [
                    {
                        title: "欢迎使用",
                        content: [
                            '1.系统简介',
                            '1.1 本系统对于 " 职员 " 提供物料添加、分发登记和Excel批量导入功能;',
                            '1.2 对于 " 店家 " 提供物料确认功能',
                            '2. 具体功能详见用户登录后右侧呈现的垂直导航条部分,在其收缩状态下,可通过点击主操作界面左上角的图标呼出',
                            '3. 若存在使用问题,请点击右侧导航条最底部的"反馈",填写相应表单进行反馈'
                        ],
                        name: 1
                    }
                ]
            }
        }
    }
</script>
