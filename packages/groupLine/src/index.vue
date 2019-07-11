<template>
  <div ref="pileUpChart" class="pileUpChart">
     <ul class="groupLine" v-if="opt.showNav" >
      <li v-for="(item,index) in copyData" :key="index" :class="{'groupLine_item':true,'hideNav':!item.show}" @click="triggerToTogglePath(item,index)">
        <i :style="{'background':item.color}" class="colorBlock"></i>
        <p class="groupLine_text" :style="{'color':'rgba(0,0,0.65)'}">{{item.name}}</p>
      </li>
    </ul>
  </div>
</template>

<script>
import * as d3 from 'd3'
import { colorList } from '@/utils/index'

export default {
  name: 'groupLine',
  data() {
    return {
      width: 0,
      height: 0,
      color: colorList(),
      svg: null,
      xScale: null,
      chart: null,
      max: 0,
      margin: {
        left: 40,
        right: 20,
        top: 20,
        bottom: 20
      },
      copyData: [],
      opt: {
        curve: 1,
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
    data(n, o) {
      this.copyData = [...n]
      this.packInit()
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
    init() {
      this.opt = Object.assign(this.opt, this.options)
      this.width = this.$refs.pileUpChart.clientWidth
      this.height = this.$refs.pileUpChart.clientHeight || 400
      const { width, height, copyData } = this
      copyData.forEach((item, i) => { item.show = true; item.color = this.color[i] })
      // 计算最大值
      this.max = copyData.length ? Math.max(...copyData.map(item => Math.max(...item.dataList.map(ite => ite.value)))) : 100
      // 极限边界
      this.margin.left = Math.max(this.max.toString().length * 5, 40)
      this.margin.right = Math.max(this.max.toString().length * 5, this.margin.right)
      this.svg && this.svg.remove()
      this.svg = d3.select(this.$refs.pileUpChart).append('svg').attr('width', width).attr('height', height)
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
      const yScale = this.yScale = d3.scaleLinear().range([chartHeight, 0]).domain([0, max])
      const xScale = this.xScale = d3.scaleBand().range([0, this.chartWidth]).domain(xLineList).padding(-1)
      chart.append('g').attr('class', 'xAxis').attr('transform', `translate(${0},${chartHeight})`).call(
        d3
          .axisBottom(xScale)
          .tickSize(2)
          .tickPadding(5)
      )
      if (['right', 'all'].includes(axisY)) { chart.append('g').attr('class', 'yAxis right').attr('transform', `translate(${chartWidth},${0})`).call(d3.axisRight(yScale).tickSize(tickPadding).ticks(ticks).tickFormat(d3.formatPrefix('.0', max > 10000 ? 1e3 : 1))) }
      if (['left', 'all'].includes(axisY)) { chart.append('g').attr('class', 'yAxis left').attr('transform', `translate(${0},${0})`).call(d3.axisLeft(yScale).tickSize(tickPadding).ticks(ticks).tickFormat(d3.formatPrefix('.0', max > 10000 ? 1e3 : 1))) }
      this.svg.selectAll('g.yAxis path').attr('stroke', 'rgba(0,0,0,.4)').attr('stroke-width', yAxisLine ? 1 : 0)
      this.chart.selectAll('g.yAxis g.tick text').attr('class', 'yAxis_text').attr('color', 'rgba(0,0,0,.6)')
      this.chart.selectAll('g.xAxis path').attr('stroke', 'rgba(0,0,0,.4)').attr('stroke-width', xAxisLine ? 1 : 0)
      this.chart.selectAll('g.yAxis g.tick').each(function (d, i) {
        if (!i) return
        d3.select(this).append('line')
          .classed('grid-line gridY', true)
          .attr('x1', 0)
          .attr('y1', 0)
          .attr('stroke', '#e8e8e8')
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '4,2')
          .attr('stroke-opacity', 0.6)
          .attr('x2', chartWidth)
          .attr('y2', 0)
      })
      this.lineShadow()
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
      const defsShadow = svg.append('defs')
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
        .classed('hide', toggle)
        .attr('filter', 'url(#drop-shadow)')
        .transition()
        .duration(500)
        .ease(d3.easeLinear)
        .attr('stroke-dashoffset', toggle ? totalLength : 0)
        .on('end', () => {
          setTimeout(() => target.attr('filter', ''), 300)
        })
    },
    async renderBody() {
      const {
        copyData, xScale, yScale, xStart, yStart, addLineShadow, addHoverEvent
      } = this
      const { curve, lineshadow } = this.opt
      lineshadow && addLineShadow()
      // 创建折线
      const linePath = d3
        .line() // 折线
        .curve(d3.curveCardinal.tension(curve))
        .x(d => xScale(d.date))
        .y(d => yScale(d.value))
      const shaodowPath = this.svg.append('g').attr('class', 'path')
      await shaodowPath.selectAll('path').data(copyData).enter().append('path')
        .attr('class', (d, i) => `path_line path_line_${i}`)
        .attr('d', (d, i) => linePath(d.dataList))
        .attr('fill', 'none')
        .attr('stroke-width', 2)
        .attr('stroke', (d, i) => d.color)
        .attr('transform', `translate(${xStart + xScale.bandwidth() / 2}, ${yStart})`)
        .attr('stroke-dasharray', function (d, i) {
          return `${d3.select(this).node().getTotalLength()} ${d3.select(this).node().getTotalLength()}`
        })
        .attr('stroke-dashoffset', function (d, i) {
          return d3.select(this).node().getTotalLength()
        })
        .transition()
        .duration(1000)
        .ease(d3.easeLinear)
        .attr('fill', 'none')
        .attr('filter', () => (lineshadow ? 'url(#drop-shadow)' : ''))
        .attr('stroke-dashoffset', 0)
      await addHoverEvent()
    },
    addLineShadow() {
      // 高斯滤镜
      const defsFliter = this.svg.append('defs')
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
      let tipLine = this.svg.append('line').attr('class', 'tip-line')
      // 仿echarts圆点
      const circles = this.chart.append('g').classed('circleOfPath', true)
      const allCircle = circles.selectAll('circle').data(copyData).enter().append('circle')
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
        const design = mapx.filter(item => Math.abs(x - item.x) < bw)[0]
        if ((!design && !nowIndex) || (!design || (nowIndex === design.index))) return
        nowIndex = design.index
        design.y = y
        tipLine
          .attr('y1', chartHeight)
          .attr('y2', 5)
          .attr('x1', 0)
          .attr('x2', 0)
          .interrupt()
          .transition()
          .duration(100)
          // .ease(d3.easeBackOut)
          .attr(
            'transform',
            `translate(${design.x},${yStart})`
          )
          .attr('stroke', 'rgba(0,0,0,0.65)')
        // 设置文字
        tip.select('.tip-text.title').text(design.d)
        tip.selectAll('.tip-text.content').text((d, i) => `${d.name}:${d.dataList[design.index].value}`)
        let lastCy = 0
        tip.selectAll('.tip-circle-item').each(function (d, i) {
          if (i === copyData.filter(item => item.show).length - 1) {
            lastCy = parseInt(d3.select(this).attr('cy')) + 20
          }
        })

        allCircle.attr('cx', (d, i) => design.x - xStart).attr('cy', (d, i) => yScale(d.dataList[design.index].value)).attr('r', 1)
          .attr('fill', (d, i) => d.color)
          .interrupt()
          .transition()
          .duration(100)
          .attr('r', 0)
          .transition()
          .duration(500)
          .ease(d3.easeBackOut)
          .attr('r', 6)

        const allTextWidth = []
        svg.selectAll('.tip-text.content').each(function (d, i) {
          return allTextWidth.push(this.getBoundingClientRect().width)
        })
        const tipTextMaxWidth = d3.max(allTextWidth)

        const tipWidth = tipTextMaxWidth + 30
        tip.select('.tip-border').attr('width', tipWidth)
        // // 获取提示框应该出现的位置
        const mouseX = design.x
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
          tipLine = svg.selectAll('.tip-line').size() ? svg.select('.tip-line') : svg.append('line').attr('class', 'tip-line')
          tip.selectAll('.tip-text').remove()
          tip.select('.tip-border').remove()
          tip
            .append('rect')
            .attr('class', 'tip-border')
            .attr('width', 0)
            .attr('height', 0)
            .attr('rx', 8)
            .attr('ry', 8)
            .attr('opacity', 0)
          tip
            .append('text')
            .attr('class', 'tip-text title')
            .attr('x', 10)
            .attr('y', 15)
          tip.selectAll('.tip-text.content').data(copyData.filter(item => item.show)).enter()
            .append('text')
            .attr('class', 'tip-text content')
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
          nowIndex = undefined
          tip.selectAll('.tip-text').remove()
          tip.select('.tip-border').remove()
          tip.selectAll('.tip-circle-item').remove()
          tipLine.remove()
          allCircle.interrupt().attr('r', 0)
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

  @media (max-width: 576px) {
    .groupLine {
      position: relative;
      flex-wrap: wrap;
    }
    .groupLine_item {
      width: 25%;
      padding: 0 10px;
      white-space: nowrap;
    }
  }
  .tip-text {
    fill: #fff;
  }
}
</style>
