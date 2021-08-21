<template>
    <div>
        <div align="center">
            <el-upload
                    class="upload-demo"
                    drag
                    action="http://localhost:8080/file/upload"
                    :auto-upload="false"
                    multiple>
                <i class="el-icon-upload"></i>
                <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
        </div>
        <div>
            <el-table :data="editList" border>
                <el-table-column label="tab1">
                    <template slot-scope="scope">
                        <el-input placeholder="请输入内容" v-show="scope.row.showInput" v-model="scope.row.tab1"></el-input>
                        <span v-show="!scope.row.showInput">{{scope.row.tab1}}</span>
                    </template>
                </el-table-column>
                <el-table-column label="tab2">
                    <template slot-scope="scope">
                        <el-input placeholder="请输入内容" v-show="scope.row.showInput" v-model="scope.row.tab2"></el-input>
                        <span v-show="!scope.row.showInput">{{scope.row.tab2}}</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button @click="scope.row.showInput =true">编辑</el-button>
                        <el-button @click="scope.row.showInput =false">保存</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </div>
</template>
<script>
    import {upload} from "@/api/file";

    export default {
        data() {
            return {
                editList: [
                    {tab1: '111', tab2: '2222', showInput: true},
                    {tab1: 'aaa', tab2: 'bbb', showInput: false}
                ],
            }
        },
        methods: {
            upload(file){

            }
        }
    }
</script>
