<template>
  <div class="app-container">
    <!--按钮、表格-->
    <!--Excel导入-->
    <el-card>
      iconFormVisible：{{ iconFormVisible }}||
      <br>
      orderInfo：{{ orderInfo }}||
      <br>
      dialogTitle：{{ dialogTitle }}||
      <br>
      rowIndex：{{ rowIndex }}||
      <br>
      tableData：{{ tableData }}
      <el-divider content-position="left">Excel导入</el-divider>
      <el-button size="small" type="danger" @click="download('example.xlsx')">下载模板</el-button>
      <el-button size="small" type="primary" @click="openExcelImport">开启Excel批量导入</el-button>
      <!--Excel导入弹窗-->
      <el-dialog :title="upload.title" :visible.sync="upload.open" width="400px" append-to-body>
        <el-upload
          ref="upload"
          :limit="1"
          accept=".xlsx, .xls"
          :headers="upload.headers"
          :action="upload.url"
          :disabled="upload.isUploading"
          :on-success="handleSuccess"
          :on-error="handleError"
          :on-change="handleChange"
          :auto-upload="false"
          drag
        >
          <i class="el-icon-upload" />
          <div class="el-upload__text">
            将文件拖到此处，或<em>点击上传</em>
          </div>
          <div slot="tip" class="el-upload__tip">
            <el-link type="danger" @click="download('example.xlsx')">
              下载模板
            </el-link>
          </div>
          <div slot="tip" class="el-upload__tip" style="color:#ff0000">
            提示：请先下载模板！！！仅允许导入 .xls 或 xlsx 格式文件，且格式需与模板格式相同
          </div>
        </el-upload>
        <div slot="footer" class="dialog-footer">
          <el-button type="success" @click="uploadFile">确 定 上 传</el-button>
          <el-button @click="cancelUpload">取消/清空上传列表</el-button>
        </div>
      </el-dialog>
    </el-card>

    <!--手动录入-->
    <el-card>
      <el-divider content-position="left">手动录入</el-divider>
      <el-button type="primary" size="small" @click="add">新增</el-button>
      <el-button type="success" size="small" @click="handleManualCreate">提交</el-button>
      <el-table :data="tableData" stripe>
        <el-table-column label="商家电话" prop="shopSellerTel" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.shopSellerTel }}</span>
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
        <el-table-column label="操作" fixed="right" align="center">
          <template slot-scope="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope.$index, scope.row)">编辑
            </el-button>
            <el-button type="danger" size="small" @click="remove(scope.$index, scope.row)">删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--手动录入弹窗-->
      <el-dialog :title="dialogTitle" width="25%" :visible.sync="iconFormVisible">
        <el-form ref="manualDialog" :model="orderInfo">
          <el-form-item label="商家电话" required prop="orderInfo.tel">
            <el-input v-model="orderInfo.shopSellerTel" placeholder="姓名" />
          </el-form-item>
          <el-form-item label="物料名称" required prop="orderInfo.material">
            <el-input v-model="orderInfo.material" placeholder="日期" />
          </el-form-item>
          <el-form-item label="计量单位" required prop="unit">
            <el-input v-model="orderInfo.unit" placeholder="地址" />
          </el-form-item>
          <el-form-item label="数量" required prop="number">
            <el-input v-model="orderInfo.number" placeholder="年龄" />
          </el-form-item>
          <el-form-item label="描述" prop="description">
            <el-input v-model="orderInfo.description" type="textarea" placeholder="描述" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="iconFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitOrder()">确 定</el-button>
        </div>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
import { getToken } from '@/utils/auth'
import { batchCreateOrders } from '@/api/order'

export default {
  data() {
    return {
      iconFormVisible: false,
      orderInfo: {
        tel: null,
        material: null,
        unit: null,
        number: null,
        description: null
      },
      dialogTitle: '增加',
      rowIndex: null,
      tableData: [],
      // 导入参数
      upload: {
        // 是否显示弹出层
        open: false,
        // 弹出层标题
        title: '',
        // 设置上传的请求头部
        headers: { MC_TOKEN: getToken() },
        // 是否禁用上传
        isUploading: false,
        // 上传的地址
        url: process.env.VUE_APP_BASE_API + '/batch/add/upload'
      }
    }
  },
  created() {
  },
  methods: {
    // 手动创建相关
    // 表格相关
    // 增加
    add() {
      this.dialogTitle = '增加'
      this.orderInfo = {}
      this.iconFormVisible = true
    },
    // 编辑
    handleEdit(index, row) {
      this.dialogTitle = '编辑'
      this.orderInfo = row
      this.iconFormVisible = true
      this.rowIndex = index
    },
    // 弹窗确定
    submitOrder() {
      if (this.dialogTitle === '编辑') {
        // 在记录的位置删除1个，并插入1个
        this.tableData.splice(this.rowIndex, 1, this.orderInfo)
        this.iconFormVisible = false
        return
      }
      // 删除0个插入1个
      this.tableData.splice(this.tableData.length, 0, this.orderInfo)
      this.iconFormVisible = false
    },
    // 删除
    remove(index, row) {
      this.$confirm(`确定删除第${index + 1}行吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }).then(() => {
        this.tableData.splice(index, 1)
      })
    },
    // 绑定提交事件
    handleManualCreate() {
      console.log(this.tableData)
    },

    // 文件相关
    // 样例下载
    download(fileName) {
      const aTag = document.createElement('a')
      aTag.href = 'http://localhost:8080/file/download?file_name=' + fileName
      aTag.click()
    },
    // 文件上传相关
    // 文件上传成功时的钩子
    handleSuccess(res, file, fileList) {
      if (res.code === 10000) {
        this.$message({
          type: 'success',
          center: true,
          message: '文件上传成功'
        })
      } else {
        this.$message({
          type: 'error',
          center: true,
          message: '导入失败，失败原因：' + res.message
        })
      }
      // 清空已上传文件
      this.$refs.upload.clearFiles()
    },
    // 文件上传失败时的钩子
    handleError(err, file, fileList) {
      this.$message.error('文件上传失败')
      console.log(err)
    },
    handleChange(file, fileList) {
    },
    uploadFile() {
      this.$refs.upload.submit()
      this.upload.open = false
    },
    openExcelImport() {
      this.upload.open = true
    },
    cancelUpload() {
      // 清空已上传文件
      this.$refs.upload.clearFiles()
      this.$refs.upload.abort()
      this.upload.open = false
    }
  }
}
</script>
