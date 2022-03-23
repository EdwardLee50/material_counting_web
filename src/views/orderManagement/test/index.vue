<template>
  <div>
    <el-form :inline="true" :model="formInline" class="demo-form-inline">
      <el-form-item label="审批人">
        <el-input v-model="formInline.user" :placeholder="placeholder" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit">查询</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default {
  data() {
    return {
      formInline: {
        user: ''
      },
      placeholder: '张三'
    }
  },
  methods: {
    onSubmit() {
      console.log(this.formInline)
    }
  }
}
</script>
