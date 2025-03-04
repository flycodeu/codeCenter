---
title: 查询redis运行信息
createTime: 2025/03/04 09:28:52
permalink: /article/hcsh5z0o/
tags:
  - SpringBoot
---
>作者：程序员飞云
>
> 本站地址：[https://www.flycode.icu](https://www.flycode.icu)

## 后端代码
```java

    @Resource
    private RedisTemplate<String, String> redisTemplate;

    @GetMapping("/server")
    public Result<Map<String, Object>> info() {
        ServerUtils server = new ServerUtils();
        return Result.success(server.copyTo());
    }


    @GetMapping("/cache")
    public Result<Object> cacheInfo() {
        Properties info = (Properties) redisTemplate.execute((RedisCallback<Object>) RedisServerCommands::info);
        Properties commandStats = (Properties) redisTemplate.execute((RedisCallback<Object>) connection -> connection.info("commandstats"));
        Object dbSize = redisTemplate.execute((RedisCallback<Object>) RedisServerCommands::dbSize);

        if (commandStats == null) {
            return Result.error("获取异常");
        }

        Map<String, Object> result = new HashMap<>(3);
        result.put("info", info);
        result.put("dbSize", dbSize);

        List<Map<String, String>> pieList = new ArrayList<>();
        commandStats.stringPropertyNames().forEach(key -> {
            Map<String, String> data = new HashMap<>(2);
            String property = commandStats.getProperty(key);
            data.put("name", StringUtils.removeStart(key, "cmdstat_"));
            data.put("value", StringUtils.substringBetween(property, "calls=", ",usec"));
            pieList.add(data);
        });

        result.put("commandStats", pieList);
        return Result.success(result);
    }
```

## 前端代码
```javascript
<!-- 系统缓存 -->
  <template>
  <div class="cache">
  <el-card class="!border-none" shadow="never">
  <div>
  <div class="mb-4 lg">基本信息</div>

  <div class="el-table--enable-row-transition el-table--large el-table">
  <el-scrollbar>
  <table class="el-table__body" cellspacing="0">
  <tbody>
  <tr class="el-table__row">
  <td class="el-table__cell">
  <div class="cell">Redis版本</div>
  </td>
  <td class="el-table__cell">
  <div class="cell">{{ baseInfo.redis_version }}</div>
  </td>
  <td class="el-table__cell">
  <div class="cell">运行模式</div>
  </td>
  <td class="el-table__cell">
  <div class="cell">
  {{
  baseInfo.redis_mode == 'standalone'
    ? '单机'
    : '集群'
}}
</div>
  </td>
  <td class="el-table__cell">
  <div class="cell">端口</div>
  </td>
  <td class="el-table__cell">
  <div class="cell">{{ baseInfo.tcp_port }}</div>
  </td>
  <td class="el-table__cell">
  <div class="cell">客户端数</div>
  </td>
  <td class="el-table__cell">
  <div class="cell">{{ baseInfo.connected_clients }}</div>
  </td>
  </tr>
  <tr class="el-table__row">
  <td class="el-table__cell">
  <div class="cell">运行时间(天)</div>
  </td>
  <td class="el-table__cell">
  <div class="cell">{{ baseInfo.uptime_in_days }}</div>
  </td>
  <td class="el-table__cell">
  <div class="cell">使用内存</div>
  </td>
  <td class="el-table__cell">
  <div class="cell">
  {{ baseInfo.used_memory_human }}
</div>
  </td>
  <td class="el-table__cell">
  <div class="cell">使用CPU</div>
  </td>
  <td class="el-table__cell">
  <div class="cell">
  {{ baseInfo.used_cpu_user_children }}
</div>
  </td>
  <td class="el-table__cell">
  <div class="cell">内存配置</div>
  </td>
  <td class="el-table__cell">
  <div class="cell">{{ baseInfo.maxmemory_human }}</div>
  </td>
  </tr>
  <tr class="el-table__row">
  <td class="el-table__cell">
  <div class="cell">AOF是否开启</div>
  </td>
  <td class="el-table__cell">
  <div class="cell">
  {{ baseInfo.aof_enabled == 0 ? '开启' : '关闭' }}
                  </div>
                </td>
                <td class="el-table__cell">
                  <div class="cell">RDB是否成功</div>
                </td>
                <td class="el-table__cell">
                  <div class="cell">
                    {{ baseInfo.aof_enabled == 'ok' ? '成功' : '失败' }}
                  </div>
                </td>
                <td class="el-table__cell">
                  <div class="cell">Key数量</div>
                </td>
                <td class="el-table__cell">
                  <div class="cell">{{ baseInfo.dbSize }}</div>
                </td>
                <td class="el-table__cell">
                  <div class="cell">网络入口/出口</div>
                </td>
                <td class="el-table__cell">
                  <div class="cell">
                    {{ baseInfo.instantaneous_input_kbps }}
                    /
                    {{ baseInfo.instantaneous_output_kbps }}
                  </div>
                </td>
              </tr>
              </tbody>
            </table>
          </el-scrollbar>
        </div>
      </div>
    </el-card>

    <div class="cards-container">
      <!-- 命令统计 -->
      <el-card class="card-item !border-none mt-4" shadow="never">
        <div>
          <div class="mb-10">命令统计</div>
          <div id="commandList" style="width: 100%; height: 400px;" class="chart-container"></div>
        </div>
      </el-card>

      <!-- 内存信息 -->
      <el-card class="card-item !border-none mt-4" shadow="never">
        <div>
          <div class="mb-10">内存信息</div>
          <div id="chartList" style="width: 100%; height: 400px;" class="chart-container"></div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts" name="cache">
import { systemCache } from '@/api/environment.ts'
import vCharts from 'vue-echarts'
import * as echarts from 'echarts'
import { reactive, ref } from 'vue'

const baseInfo = ref<any>({})

const chartOptions = reactive({
  commandChartOption: {
    tooltip: {
      trigger: 'item'
      // formatter: '{b} : {d}%'
    },

    series: [
      {
        label: {
          show: true
        },
        labelLine: {
          show: true
        },
        type: 'pie',
        radius: '85%',
        color: [
          '#0D47A1',
          '#1565C0',
          '#1976D2',
          '#1E88E5',
          '#2196F3',
          '#42A5F5',
          '#64B5F6',
          '#90CAF9',
          '#BBDEFB',
          '#E3F2FD',
          '#CAF0F8',
          '#ADE8F4',
          '#90E0EF',
          '#48CAE4',
          '#00B4D8',
          '#0096C7',
          '#0077B6',
          '#023E8A',
          '#03045E',
          '#8ecae6',
          '#98c1d9',
          '#D9ED92',
          '#B5E48C',
          '#99D98C',
          '#76C893',
          '#52B69A',
          '#34A0A4',
          '#168AAD',
          '#1A759F',
          '#1E6091',
          '#184E77',
          '#457b9d'
        ],
        data: [
          {
            value: '',
            name: ''
          }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  },

  memoryChartOption: {
    tooltip: {
      formatter: '{a} <br/>{b} : {c}%'
    },
    series: [
      {
        name: 'Pressure',
        type: 'gauge',
        radius: '100%',
        detail: {
          formatter: '{value}'
        },
        data: [
          {
            value: '',
            name: '内存消耗'
          }
        ]
      }
    ]
  }
})

const getSystemCache = async () => {
  const data = await systemCache()
  console.log(data.data.data)
  baseInfo.value = data.data.data.info
  baseInfo.value.dbSize = data.data.data.dbSize

  chartOptions.commandChartOption.series[0].data = data.data.data.commandStats

  chartOptions.memoryChartOption.series[0].data[0].value = (
    data.data.data.info.used_memory /
    1024 /
    1024
  ).toFixed(2)
  chartOptions.memoryChartOption.series[0].detail.formatter = '{value}' + 'M'

  var chartDom = document.getElementById('commandList') as any
  var myChart = echarts.init(chartDom)
  myChart.setOption(chartOptions.commandChartOption as any)

  var chartDom2 = document.getElementById('chartList') as any
  var myChart2 = echarts.init(chartDom2)
  myChart2.setOption(chartOptions.memoryChartOption as any)
}

getSystemCache()
</script>

<style scoped>
.el-table .el-table__cell {
  min-width: 120px;
}
.cache {
  padding: 20px;
}

.cards-container {
  display: flex;
  justify-content: space-between;
  gap: 20px; /* 可以根据需要调整间距 */
}

.card-item {
  flex: 1; /* 使卡片平分容器宽度 */
  max-width: 48%; /* 可以根据需要调整最大宽度 */
}

.chart-container {
  width: 100%;
  height: 400px;
}

.el-table .el-table__cell {
  min-width: 120px;
}
</style>
```



## 效果展示
![](https://cdn.nlark.com/yuque/0/2024/png/34915237/1731044517980-0c6ca267-3ad4-45ea-a9ac-672fd7369999.png)

