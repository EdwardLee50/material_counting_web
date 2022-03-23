<template>
  <div class="app-container">
    <el-card header="频次统计" style="font-weight: bold;" class="box-card">
      <div ref="myEchart" style="height: 350px;" />
    </el-card>
  </div>
</template>

<script>
import { getTest } from '@/api/test'

export default {
  data() {
    return {
      dates: [],
      counts: []
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.renderGraph()
    })
  },
  methods: {
    renderGraph() {
      getTest()
        .then((res) => {
          const data = res.data
          const dates = data.map((item) => item.month + '月' + item.day + '日')
          const counts = data.map((item) => item.count)
          const graph = this.$echarts.init(this.$refs['myEchart'])
          const option1 = {
            xAxis: {
              type: 'category',
              data: dates
            },
            yAxis: {
              type: 'value'
            },
            series: [
              {
                data: counts,
                type: 'line',
                emphasis: {
                  label: {
                    show: true
                  }
                }
              }
            ]
          }
          graph.setOption(option1)
        })
        .catch((error) => {
          console.log(error)
        })
    }
  }
}
</script>

<style>

</style>
