import * as d3 from 'd3'

/**
* @description 工具函数库
* @author YuanZiWen
* @since 19/05/21
*/


/**
 * 防抖，电梯等人，不定期运行，再次触发重置等待时间
 *
 * @returns null
 */
export function debounce(func, wait, immediate) {
  let timeout;
  let args;
  let context;
  let timestamp;
  let
    result

  const later = function () {
    // 据上一次触发时间间隔
    const last = +new Date() - timestamp
    // 上次被包装函数被调用时间间隔last小于设定时间间隔wait
    if (last < wait && last > 0) {
      timeout = setTimeout(later, wait - last)
    } else {
      timeout = null
      // 如果设定为immediate===true，因为开始边界已经调用过了此处无需调用
      if (!immediate) {
        result = func.apply(context, args)
        if (!timeout) context = args = null
      }
    }
  }

  return function (...args) {
    context = this
    timestamp = +new Date()
    const callNow = immediate && !timeout
    // 如果延时不存在，重新设定延时
    if (!timeout) timeout = setTimeout(later, wait)
    if (callNow) {
      result = func.apply(context, args)
      context = args = null
    }

    return result
  }
}
/**
 * 防抖，电梯不等人，定期运行一次，再次触发不重置等待时间
 *
 * @returns null
 */
export function throttle(func, wait, options) {
  let context;
  let args;
  let
    result
  let timeout = null
  // 上次执行时间点
  let previous = 0
  if (!options) options = {}
  // 延迟执行函数
  const later = function () {
    // 若设定了开始边界不执行选项，上次执行时间始终为0
    previous = options.leading === false ? 0 : +new Date()
    timeout = null
    result = func.apply(context, args)
    if (!timeout) context = args = null
  }
  return function () {
    const now = +new Date()
    // 首次执行时，如果设定了开始边界不执行选项，将上次执行时间设定为当前时间。
    if (!previous && options.leading === false) previous = now
    // 延迟执行时间间隔
    const remaining = wait - (now - previous)
    context = this
    args = arguments
    // 延迟时间间隔remaining小于等于0，表示上次执行至此所间隔时间已经超过一个时间窗口
    // remaining大于时间窗口wait，表示客户端系统时间被调整过
    if (remaining <= 0 || remaining > wait) {
      clearTimeout(timeout)
      timeout = null
      previous = now
      result = func.apply(context, args)
      if (!timeout) context = args = null
      // 如果延迟执行不存在，且没有设定结尾边界不执行选项
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining)
    }
    return result
  }
}

/**
 * 查询设备系统类型
 *
 * @export
 * @returns
 */
export function device() {
  const ua = navigator.userAgent
  const isWindowsPhone = /(?:Windows Phone)/.test(ua)
  const isSymbian = /(?:SymbianOS)/.test(ua) || isWindowsPhone
  const isAndroid = /(?:Android)/.test(ua)
  const isFireFox = /(?:Firefox)/.test(ua)
  const isChrome = /(?:Chrome|CriOS)/.test(ua)
  const isTablet = /(?:iPad|PlayBook)/.test(ua) || (isAndroid && !/(?:Mobile)/.test(ua)) || (isFireFox && /(?:Tablet)/.test(ua))
  const isPhone = /(?:iPhone)/.test(ua) && !isTablet
  const isPc = !isPhone && !isAndroid && !isSymbian
  return {
    isTablet,
    isPhone,
    isAndroid,
    isPc
  }
}

/**
 * rgb转hex  rgb(0,0,0) => #000
 *
 * @export
 * @param {*} str
 * @returns
 */
export function rgbToHex(str) {
  const hex = str
  // 十六进制颜色值的正则表达式
  const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/
  // 如果是rgb颜色表示
  if (/^(rgb|RGB)/.test(hex)) {
    const aColor = hex.replace(/(?:\(|\)|rgb|RGB)*/g, '').split(',')
    let strHex = '#'
    for (let i = 0; i < aColor.length; i++) {
      let hex = Number(aColor[i]).toString(16)
      if (hex.length < 2) {
        hex = `0${hex}`
      }
      strHex += hex
    }
    if (strHex.length !== 7) {
      strHex = hex
    }
    return strHex
  }
  if (reg.test(hex)) {
    const aNum = hex.replace(/#/, '').split('')
    if (aNum.length === 6) {
      return hex
    }
    if (aNum.length === 3) {
      let numHex = '#'
      for (let i = 0; i < aNum.length; i += 1) {
        numHex += (aNum[i] + aNum[i])
      }
      return numHex
    }
  }
  return hex
}

/**
 * hex转rgb #fff转rgb(255,255,255)
 *
 * @export
 */
export function hexToRgb(str) {
  if (!str) return
  let sColor = str.toLowerCase()
  // 十六进制颜色值的正则表达式
  const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/
  // 如果是16进制颜色
  if (sColor && reg.test(sColor)) {
    if (sColor.length === 4) {
      let sColorNew = '#'
      for (let i = 1; i < 4; i += 1) {
        sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1))
      }
      sColor = sColorNew
    }
    // 处理六位的颜色值
    const sColorChange = []
    for (let i = 1; i < 7; i += 2) {
      sColorChange.push(parseInt(`0x${sColor.slice(i, i + 2)}`))
    }
    return `RGB(${sColorChange.join(',')})`
  }
  return sColor
}
export function colorList() {
  // 92种颜色
  // 颜色列表
  const color = [
    '#1890FF',
    '#c213ad',
    '#2FC25B',
    '#FACC14',
    '#F04864',
    '#8543E0',
    // "#FFD00F",
    '#FF789D'
  ]
  // 8
  const schemeAccent = d3.scaleOrdinal(d3.schemeAccent)
  const schemeDark2 = d3.scaleOrdinal(d3.schemeDark2)
  const schemePastel2 = d3.scaleOrdinal(d3.schemePastel2)
  const schemeSet2 = d3.scaleOrdinal(d3.schemeSet2)
  // 9
  const schemeSet1 = d3.scaleOrdinal(d3.schemeSet1)
  const schemePastel1 = d3.scaleOrdinal(d3.schemePastel1)
  // 10
  const schemeCategory10 = d3.scaleOrdinal(d3.schemeCategory10)
  // 12
  const schemePaired = d3.scaleOrdinal(d3.schemePaired)
  const schemeSet3 = d3.scaleOrdinal(d3.schemeSet3)
  // 20
  // const schemeCategory20c = d3.scaleOrdinal(d3.schemeCategory20c)
  // const schemeCategory20b = d3.scaleOrdinal(d3.schemeCategory20b)
  // const schemeCategory20 = d3.scaleOrdinal(d3.schemeCategory20)
  for (let i = 0; i < 10; i++) {
    color.push(schemeCategory10(i))
  }
  for (let i = 0; i < 8; i++) {
    color.push(schemeAccent(i))
    color.push(schemeDark2(i))
    color.push(schemePastel2(i))
    color.push(schemeSet2(i))
  }
  for (let i = 0; i < 9; i++) {
    color.push(schemeSet1(i))
    color.push(schemePastel1(i))
  }
  for (let i = 0; i < 12; i++) {
    color.push(schemePaired(i))
    color.push(schemeSet3(i))
  }
  // for (let i = 0; i < 20; i++) {
  // color.push(schemeCategory20c(i))
  // color.push(schemeCategory20(i))
  // color.push(schemeCategory20b(i))
  // }
  return color
}
