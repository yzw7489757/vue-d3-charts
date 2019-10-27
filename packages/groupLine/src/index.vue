<template>
  <div ref="pileUpChart" class="pileUpChart">
     <ul class="groupLine">
      <li v-for="(item,index) in copyData"
        :key="item.color"
        :class="{'groupLine_item':true,'hideNav':!item.show}"
        @click="triggerToTogglePath(item,index)">
        <i :style="{'background-color':item.color}" class="colorBlock"/>
        <p class="groupLine_text">{{item.name}}</p>
      </li>
    </ul>
  </div>
</template>

<script>
import { colorList } from '@/utils/index'

export default {
  name: 'groupLine',
  data() {
    return {
      color: colorList(),
      svg: null,
      chart: null,
      xScale: null,
      yScale: null,
      xAxis: null,
      yAxisR: null,
      yAxisL: null,
      gridAxis: null,
      margin: {
        left: 40,
        right: 20,
        top: 20,
        bottom: 20
      },
      copyData: [],
      opt: {
        curve: 1,
        percentage: false, // 百分比模式
        lineshadow: false,
        axisY: 'left',
        ticks: 6,
        showNav: true,
        tickPadding: 4,
        yAxisLongLine: true,
        yAxisLine: true,
        xAxisLine: true,
        areaShadowList: [
          { color: '', opacity: 0.7, offset: 0 },
          { color: '', opacity: 0.4, offset: 0.7 },
          { color: '', opacity: 0.1, offset: 1 }
        ],
        shadowColor: 'red',
        color: 'red'
      }
    }
  },
  watch: {
    data: {
      handler(n, o) {
        this.copyData = [...n].map((d, i) => ({
          ...d, show: true, color: this.color[i]
        }))
        this.update()
      }
    }
  },
  props: {
    data: {
      type: Array,
      default() {
        return []
      }
    },
    options: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  computed: {
    xStart() {
      return this.margin.left
    },
    xEnd() {
      return this.width - this.margin.right
    },
    yStart() {
      return this.margin.top
    },
    yEnd() {
      return this.height - this.margin.bottom
    },
    chartHeight() {
      return this.height - this.margin.top - this.margin.bottom
    },
    chartWidth() {
      return this.width - this.margin.left - this.margin.right
    },
    xLineList() {
      const { data } = this
      return (data[0] && data[0].dataList.map(item => item.date)) || []
    },
    height() {
      return (this.$refs.pileUpChart && this.$refs.pileUpChart.clientHeight) || 400
    },
    width() {
      return (this.$refs.pileUpChart && this.$refs.pileUpChart.clientWidth) || 0
    },
    max() {
      return this.copyData.length ? Math.max(...this.copyData.map(item => Math.max(...item.dataList.map(ite => ite.value)))) : 100
    }
  },
  methods: {
    packInit() {
      if (typeof window.requestIdleCallback !== 'undefined') {
        window.requestIdleCallback(() => {
          this.init()
        })
      } else {
        this.init()
      }
    },
    update() {
      const { max, xLineList, svg } = this
      const { percentage } = this.options
      const _this = this
      this.$nextTick(() => {
        this.yAxisL.scale().domain([0, max])
        this.yAxisR.scale().domain([0, max])
        this.xAxis.scale().domain(xLineList)
        const unit = axis => axis.tickFormat(percentage ? d3.format('.0%') : d3.formatPrefix('.0', max > 10000 ? 1e3 : 1))
        svg.select('.yAxis_left').transition().duration(500).call(unit(_this.yAxisL))
        svg.select('.yAxis_right').transition().duration(500).call(unit(_this.yAxisR))
        svg.select('.xAxis').transition().duration(500).call(_this.xAxis)
        svg.select('.grid').transition().duration(500).call(_this.gridAxis)
        this.renderBody()
      })
    },
    init() {
      this.opt = Object.assign(this.opt, this.options)
      const { width, height, color } = this
      this.copyData = this.copyData.map((d, idx) => ({ ...d, show: true, color: color[idx] }))
      // 极限边界
      this.margin.left = Math.max(this.max.toString().length * 5, 40)
      this.margin.right = Math.max(this.max.toString().length * 5, this.margin.right)
      this.svg && this.svg.remove()
      this.svg = d3.select(this.$refs.pileUpChart).append('svg').attr('width', width).attr('height', height)
      this.svg.append('g').attr('class', 'path')
      this.draw()
    },
    draw() {
      const {
        chartHeight, chartWidth, xStart, yStart
      } = this
      const chart = this.chart = this.svg.append('g').classed('chart', true)
        .attr('transform', `translate(${(xStart)},${yStart})`)
        .attr('width', chartWidth)
        .attr('height', chartHeight)
      this.renderAxis()
    },
    renderAxis() {
      const {
        chartWidth, chartHeight, chart, copyData, max, xLineList
      } = this
      const {
        axisY, yAxisLine, xAxisLine, ticks, tickPadding, yAxisLongLine
      } = this.opt
      const _this = this
      const yScale = this.yScale = d3.scaleLinear().range([chartHeight, 0]).domain([0, max])
      const generateYAxis = scale => scale.scale(yScale).tickSize(tickPadding).ticks(ticks).tickFormat(d3.formatPrefix('.0', max > 10000 ? 1e3 : 1))
      const yAxisL = this.yAxisL = generateYAxis(d3.axisLeft())
      const yAxisR = this.yAxisR = generateYAxis(d3.axisRight())

      const xScale = this.xScale = d3.scaleBand().range([0, this.chartWidth]).domain(xLineList).padding(-1)
      const xAxis = this.xAxis = d3.axisBottom().scale(xScale).tickSize(2).tickPadding(5)
      chart.append('g').attr('class', 'xAxis').attr('transform', `translate(${0},${chartHeight})`).call(xAxis)

      if (['left', 'all'].includes(axisY)) { chart.append('g').attr('class', 'yAxis yAxis_left').attr('transform', `translate(${0},${0})`).call(yAxisL) }
      if (['right', 'all'].includes(axisY)) { chart.append('g').attr('class', 'yAxis yAxis_right').attr('transform', `translate(${chartWidth},${0})`).call(yAxisR) }
      this.chart.selectAll('g.yAxis path').attr('stroke', 'rgba(0,0,0,.4)').attr('stroke-width', Number(yAxisLine))
      this.chart.selectAll('g.xAxis path').attr('stroke', 'rgba(0,0,0,.4)').attr('stroke-width', Number(yAxisLine))
      this.chart.selectAll('g.yAxis g.tick text').attr('class', 'yAxis_text').attr('color', 'rgba(0,0,0,.6)')
      this.gridAxis = d3.axisLeft().scale(yScale).tickSize(yAxisLine ? -chartWidth : 0, 0, 0).tickFormat('')
        .tickPadding(0)
        .ticks(ticks)
      _this.chart.append('g').attr('class', 'grid').call(_this.gridAxis)

      this.lineShadow()
      // this.gaussianBlur()
      this.responseAxis()
      copyData.length ? this.renderBody() : this.noData()
    },
    lineShadow() {
      const { color, shadowColor, areaShadowList } = this.opt
      const {
        copyData,
        svg,
        xScale,
        xStart,
        yStart,
        yScale,
        chartHeight
      } = this
      const defsShadow = svg.append('defs').attr('id', 'line_shadow')
      const areaPath = d3
        .area()
        .x((d, i) => xScale(d.date))
        .y0(chartHeight)
        .y1((d, i) => yScale(d.value))
      defsShadow.selectAll('linearGradient')
        .data(copyData)
        .append('linearGradient')
        .attr('id', (d, i) => `Gradient_shadow_${d.color}`)
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', 0)
        .attr('y2', 1) // 渐变方向，y2代表上 y1下 x1左 x2右
        .each(function (d, i) {
          areaShadowList.forEach((item) => {
            d3.select(this)
              .append('stop')
              .attr('stop-color', d.color)
              .attr('stop-opacity', 0)
              .attr('offset', item.offset)
              .transition()
              .duration(1000)
              .attr('stop-opacity', item.opacity)
          })
          svg
            .append('path')
            .attr(
              'transform',
              `translate(${xStart + xScale.bandwidth() / 2},${yStart})`
            )
            .attr('d', areaPath(d.dataList))
            .attr('fill', `url(#Gradient_shadow_${d.color})`)
        })
    },
    responseAxis() {
      // 响应式横向X轴
      const {
        chartWidth, xLineList, svg
      } = this
      const xAllText = svg.select('.xAxis').selectAll('text')
      xAllText.attr('color', 'rgba(0,0,0,.6)')
      const allTextWidth = []
      if (xAllText.size() > 0) {
        xAllText.each(function (d, i) {
          allTextWidth.push(this.getBoundingClientRect().width)
          if (i === xLineList.length - 1) {
            d3.select(this).attr('transform', `translate(${-this.getBoundingClientRect().width / 4},0)`)
          }
        })
      }
      // 拿到最大占比宽度
      const maxWidth = d3.max(allTextWidth)
      // 得到最多能放多少个
      const maxLength = chartWidth / (maxWidth + 10)
      // 图表能放多少个最大的 / copyData.length  =  除以当前
      const next = Math.floor(maxLength / xLineList.length)
      xAllText.style('display', (d, i) => {
        if (i !== 0 && i % Math.ceil(xLineList.length / maxLength) !== 0) {
          return 'none'
        }
      })
    },
    noData() {
      const {
        copyData, chartHeight, chartWidth, xStart
      } = this
      this.svg.append('text').text('暂无数据').attr('transform', `translate(${(chartWidth + xStart) / 2},${chartHeight / 2})`).classed('noData', true)
    },
    triggerToTogglePath(item, index) {
      const { copyData } = this
      const { lineshadow } = this.opt
      const idx = copyData.indexOf(item)
      const target = this.svg.select(`.path_line_${index}`)
      const totalLength = target.node().getTotalLength()

      const toggle = target.attr('class').indexOf('hide') === -1
      target
        .interrupt()
        .each((d) => {
          const it = copyData[idx]
          it.show = d.show = !toggle
          copyData.splice(idx, 1, it)
        })
        .attr('filter', 'url(#drop-shadow)')
        .classed('hide', toggle)
        .transition()
        .duration(1000)
        .attr('stroke-dashoffset', toggle ? totalLength : 0)
        .on('end', function () {
          setTimeout(() => d3.select(this).attr('filter', ''), 300)
        })
    },
    async renderBody() {
      const {
        copyData, xScale, yScale, xStart, yStart, gaussianBlur, addHoverEvent
      } = this
      const { curve, lineshadow } = this.opt
      // 创建折线
      const linePath = d3
        .line() // 折线
        .curve(d3.curveCardinal.tension(curve))
        .x(d => xScale(d.date))
        .y(d => yScale(d.value))
      const shaodowPath = this.svg.select('.path')
      const paths = shaodowPath.selectAll('path').data(copyData)
      paths.enter().append('path')
      paths.exit().remove()

      await shaodowPath.selectAll('path')
        .attr('class', (d, i) => `path_line path_line_${i}`)
        .attr('transform', `translate(${xStart + xScale.bandwidth() / 2}, ${yStart})`)
        .attr('d', (d, i) => {
          if (i === 0)console.log(linePath(d.dataList))
          return linePath(d.dataList)
        })
        .attr('stroke-width', 2)
        .attr('fill', 'none')
        .attr('stroke', (d, i) => d.color)
        .attr('stroke-dasharray', function (d, i) {
          return `${d3.select(this).node().getTotalLength()} ${d3.select(this).node().getTotalLength()}`
        })
        .attr('stroke-dashoffset', function (d, i) {
          return d3.select(this).node().getTotalLength()
        })
        .interrupt()
        .transition()
        .duration(1000)
        .ease(d3.easeLinear)
        .attr('fill', 'none')
        .attr('filter', () => (lineshadow ? 'url(#drop-shadow)' : ''))
        .attr('stroke-dashoffset', 0)
      await addHoverEvent()
    },
    gaussianBlur() {
      // 高斯滤镜
      const defsFliter = this.svg.append('defs').attr('id', 'gaussian_blur')
      const filter = defsFliter
        .append('filter')
        .attr('id', 'drop-shadow')
        .attr('height', '130%')
      filter
        .append('feGaussianBlur')
        .attr('in', 'SourceGraphic')
        .attr('stdDeviation', '3')
        .attr('filterUnits', 'userSpaceOnUse')
        .attr('result', 'blur')
      filter
        .append('feOffset')
        .attr('in', 'blur')
        .attr('dx', 0)
        .attr('dy', 0)
        .attr('result', 'offsetBlur')
      const feMerge = filter.append('feMerge')
      feMerge.append('feMergeNode').attr('in', 'offsetBlur')
      feMerge.append('feMergeNode').attr('in', 'SourceGraphic')
    },
    addHoverEvent() {
      const {
        copyData, svg, xLineList, yScale, xStart, yStart, chartWidth, xScale, chartHeight
      } = this
      const tip = this.svg.append('g').attr('class', 'tip').attr('fill', 'rgba(0,0,0,.7)')
      tip
        .append('rect')
        .attr('class', 'tip-border')
        .attr('width', 120)
        .attr('height', 50)
        .attr('rx', 8)
        .attr('ry', 8)
        .attr('opacity', 0)
      // 鼠标移入指示线
      const tipLine = this.svg.append('line').attr('class', 'tip-line')
      // 仿echarts圆点
      const circles = this.chart.append('g').classed('circleOfPath', true)
      const allCircle = circles.selectAll('circle').data(copyData).enter().append('circle')

      tip.append('text')
        .attr('class', 'tip-title')
        .attr('x', 10)
        .attr('y', 15)

      const mapx = xLineList.map((d, i) => ({
        x: xScale(d) + xStart + xScale.bandwidth() / 2,
        y: (yStart + chartHeight) / 2,
        index: i,
        d
      }))

      let nowIndex
      this.svg.on('mousemove', () => {
        const x = d3.event.offsetX
        const y = d3.event.offsetY
        const bw = xScale.step() / 2
        const target = mapx.find(item => Math.abs(x - item.x) < bw)
        if ((!target && !nowIndex) || (!target || (nowIndex === target.index))) return
        nowIndex = target.index
        target.y = y
        tipLine
          .attr('y1', chartHeight)
          .attr('y2', 5)
          .attr('x1', 0)
          .attr('x2', 0)
          .interrupt()
          .transition()
          .duration(100)
          .ease(d3.easeBackOut)
          .attr(
            'transform',
            `translate(${target.x},${yStart})`
          )
          .attr('stroke', 'rgba(0,0,0,0.65)')
        // 设置文字
        tip.select('.tip-title').text(target.d)
        tip.selectAll('.tip-content').text((d, i) => `${d.name}:${d.dataList[target.index].value}`)
        let lastCy = 0
        tip.selectAll('.tip-circle-item').each(function (d, i) {
          if (i === copyData.filter(item => item.show).length - 1) {
            lastCy = parseInt(d3.select(this).attr('cy')) + 20
          }
        })

        allCircle.attr('cx', (d, i) => target.x - xStart).attr('cy', (d, i) => yScale(d.dataList[target.index].value)).attr('r', 1)
          .attr('fill', (d, i) => d.color)
          .interrupt()
          .transition()
          .duration(300)
          .attr('r', 0)
          .transition()
          .duration(500)
          .ease(d3.easeBackOut)
          .attr('r', 6)

        const allTextWidth = []
        svg.selectAll('.tip-content').each(function (d, i) {
          return allTextWidth.push(this.getBoundingClientRect().width)
        })

        const tipWidth = d3.max(allTextWidth) + 30
        tip.select('.tip-border').attr('width', tipWidth)

        // 获取提示框应该出现的位置
        const mouseX = target.x
        const mouseY = y
        // 如果剩下的位置不够显示提示框就换个方向
        const tipX = mouseX + (((mouseX + tipWidth) > chartWidth) ? -tipWidth - 10 : 10)
        const tipY = mouseY + (((mouseY + lastCy / 2) > chartHeight) ? -lastCy : 0)
        // 鼠标移动的时候才逐渐放大提示框
        tip
          .select('.tip-border')
          .attr('height', lastCy)
          .attr('opacity', 0.6)

        // 提示框移动缓冲
        tip
          .interrupt()
          .transition()
          .duration(700)
          .ease(d3.easeBackOut)
          .attr('transform', `translate(${tipX},${tipY})`)

        // 提示框红点标记
        tip.selectAll('.tip-circle-item')
          .interrupt()
          .transition()
          .duration(300)
          .attr('opacity', 0.9)
      })
        .on('mouseenter', () => {
          // tipLine = svg.selectAll('.tip-line').size() ? svg.select('.tip-line') : svg.append('line').attr('class', 'tip-line')
          tipLine.attr('opacity', 1)
          tip.selectAll('.tip-text').remove()
          tip.selectAll('.tip-content').data(copyData.filter(item => item.show)).enter()
            .append('text')
            .attr('class', 'tip-content')
            .attr('x', 15)
            .attr('y', (d, i) => 35 + i * 20)
          tip.selectAll('.tip-circle-item').data(copyData.filter(item => item.show)).enter()
            .append('circle')
            .attr('class', 'tip-circle-item')
            .attr('cx', 8)
            .attr('cy', (d, i) => 30 + i * 20)
            .attr('r', 3)
            .attr('opacity', 0)
            .attr('fill', (d, i) => d.color)
        })
        .on('mouseleave', () => {
          nowIndex = null

          tip.select('.tip-border').attr('opacity', 0)
          tipLine.attr('opacity', 0)
          allCircle.interrupt().attr('r', 0)

          tip.selectAll('.tip-content').remove()
          tip.selectAll('.tip-circle-item').remove()
        })
    }
  },
  mounted() {
    this.copyData = [...this.data]
    this.packInit()
  }
}
</script>

<style lang="scss">
.pileUpChart {
  height: calc(100%);
  svg {
    cursor: pointer;
  }
  .axis .grid-line {
    stroke: black;
    shape-rendering: crispEdges;
    stroke-opacity: 0.2;
  }
  .line {
    fill: none;
    stroke-width: 1;
  }
  .area {
    stroke: none;
    fill-opacity: 0.2;
  }
  .tip-line {
    stroke-dasharray: 2px 4px;
  }
  .noData {
    font-size: 16px;
    fill: black;
    fill-opacity: 0.3;
  }
  .groupLine {
    position: absolute;
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    top: 1vh;
    right: 0;
    justify-content: flex-end;
  }

  .groupLine_item {
    margin-right: 1vw;
    cursor: pointer;
    font: normal 400 12px/14px black, HelveticaNeue;
    color: rgba(0, 0, 0, 0.45);
    display: flex;
    justify-content: space-around;
    align-content: center;
    align-items: center;
  }
  .hideNav {
    opacity: 0.3;
  }
  .colorBlock {
    display: inline-block;
    width: 0.6vw;
    min-width: 10px;
    min-height: 10px;
    height: 0.6vw;
    margin-right: 0.4em;
    border-radius: 50%;
    vertical-align: middle;
  }

  .grid {
    .domain{
      display: none;
    }
    .tick line{
      stroke: #e8e8e8;
    }
  }
  .tip-title,.tip-text,.tip-content{
    fill: #fff;
  }
}

</style>
