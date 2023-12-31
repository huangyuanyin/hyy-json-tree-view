import {
  type,
  isNoEmptyObjectOrArray,
  getFirstAncestorByClassName
} from './utils'

class JsonTreeView {
  constructor({
    el,
    expandBtnPosition = 'default',
    showLine = false,
    showExpandBtn = true,
    showHover = true,
    showRowNum = false,
    errorSliceNum = 20
  }) {
    this.el = type(el) === 'string' ? document.querySelector(el) : el
    if (!el) throw new Error('请提供容器元素！')
    this.expandBtnPosition = expandBtnPosition // 展开按钮的位置：default(紧贴括号)，left(统一在左侧)
    this.showLine = showLine // 是否显示竖线
    this.showExpandBtn = showExpandBtn // 是否显示展开收起按钮
    this.showHover = showHover // 是否显示鼠标滑入的高亮效果
    this.showRowNum = showRowNum // 是否显示行数
    this.errorSliceNum = errorSliceNum // 出错位置前后截取的字符串长度
    this.wrap = null // 总的容器元素
    this.rowWrap = null // 渲染行的容器元素
    this.treeWrap = null // 渲染json树的容器元素
    this.errorWrap = null // 错误信息容器元素
    this.uniqueId = 0 // 每一层的id（唯一的id）
    this.lastMouseoverEl = null // 上一次鼠标滑入的元素
    this.oneRowHeight = -1 // 一行元素的高度
    this.lastRenderRows = 0 // 上一次渲染的行数
    this.hasError = false // 是否出现了错误
    this.init()
    this.bindEvent()
  }

  init() {
    this.wrap = document.createElement('div') // 最外层容器
    this.wrap.className = `hyyJsonTreeViewContainer_abc123`
    // 行号容器
    if (this.showRowNum) {
      this.rowWrap = document.createElement('div')
      this.rowWrap.className = 'rowWrap'
      this.wrap.appendChild(this.rowWrap)
    }
    // 树容器
    this.treeWrap = document.createElement('div')
    this.treeWrap.className = `treeWrap ${
      this.expandBtnPosition === 'left' ? 'addPadding' : ''
    }`
    this.wrap.appendChild(this.treeWrap)
    // 错误信息容器
    this.errorWrap = document.createElement('div')
    this.errorWrap.className = 'errorWrap'
    this.el.appendChild(this.wrap)
  }

  // 绑定事件
  bindEvent() {
    this.onClick = this.onClick.bind(this)
    this.onMouseover = this.onMouseover.bind(this)
    this.onMouseout = this.onMouseout.bind(this)
    this.wrap.addEventListener('click', this.onClick)
    if (this.showHover) {
      this.wrap.addEventListener('mouseover', this.onMouseover)
      this.wrap.addEventListener('mouseout', this.onMouseout)
    }
  }

  // 销毁
  destroy() {
    this.wrap.removeEventListener('click', this.onClick)
    if (this.showHover) {
      this.wrap.removeEventListener('mouseover', this.onMouseover)
      this.wrap.removeEventListener('mouseout', this.onMouseout)
    }
    this.el.removeChild(this.wrap)
  }

  // 格式化
  stringify(data) {
    try {
      if (typeof data === 'string') {
        if (data.trim()) {
          data = JSON.parse(data)
        } else {
          // 空字符串
          this.treeWrap.innerHTML = ''
          return
        }
      }
      // 如果上一次解析出错，这次解析成功了，需要清空错误信息
      if (this.hasError) {
        this.hasError = false
        this.treeWrap.removeChild(this.errorWrap)
      }
      this.treeWrap.innerHTML = `<div class="row">${this.stringifyToHtml(
        data
      )}</div>`
      this.renderRows()
    } catch (error) {
      // 解析出错，显示错误信息
      let str = ``
      let msg = error.message
      str += `<div class="errorMsg">${msg}</div>`
      // 获取出错位置，截取出前后一段字符串
      let res = msg.match(/position\s+(\d+)/)
      if (res && res[1]) {
        let position = Number(res[1])
        str += `<div class="errorStr">${data.slice(
          position - this.errorSliceNum,
          position
        )}<span class="errorPosition">${data[position]}</span>${data.slice(
          position + 1,
          position + this.errorSliceNum
        )}</div>`
      }
      this.hasError = true
      this.treeWrap.innerHTML = ''
      this.errorWrap.innerHTML = str
      this.treeWrap.appendChild(this.errorWrap)
    }
  }

  // 将json转换成html字符串
  stringifyToHtml(data, isAsKeyValue = false, isLast = true) {
    const dataType = type(data)
    let str = '' // 每一层的字符串
    let isEmpty = false // 是否为空对象或数组
    let id = 'hyyJsonTreeViewId_' + this.uniqueId++ // 每一层的id
    const expandBtnStr = this.showExpandBtn
      ? `<span class="expandBtn expand ${
          this.expandBtnPosition === 'left' ? 'inLeft' : ''
        }" data-id='${id}'>
        </span>`
      : '' // 根据 this.showExpandBtn 的值，生成展开收起按钮的 HTML 字符串，存储在 expandBtnStr 中
    switch (dataType) {
      case 'object':
        const keys = Object.keys(data)
        isEmpty = keys.length <= 0
        // 添加开始的括号
        str +=
          isEmpty || isAsKeyValue
            ? `<span class="brace">${isEmpty ? '' : expandBtnStr}{</span>`
            : `<div class="brace">${expandBtnStr}{</div>`
        // 中间的内容
        if (!isEmpty) {
          // 中间的整体
          str += `<div class="object ${
            this.showLine ? 'showLine' : ''
          }" data-fid="${id}">`
          // 中间的每一行
          keys.forEach((key, index) => {
            str += `<div class="row">`
            str += `<span class="key">"${key}"</span><span class="colon">:</span>`
            str += this.stringifyToHtml(
              data[key],
              true,
              index >= keys.length - 1
            )
            // 避免非空对象或数组的最后一行也有逗号
            if (index < keys.length - 1 && !isNoEmptyObjectOrArray(data[key])) {
              str += `<span class="comma">,</span>`
            }
            str += `</div>`
          })
          str += `</div>`
        }
        // 添加结束的括号
        str += isEmpty
          ? '<span class="brace">}</span>'
          : `<div class="brace">}${
              isLast ? '' : '<span class="comma">,</span>'
            }</div>`
        break
      case 'array':
        isEmpty = data.length <= 0
        // 添加开始的括号
        str +=
          isEmpty || isAsKeyValue
            ? `<span class="bracket">${isEmpty ? '' : expandBtnStr}[</span>`
            : `<div class="bracket">${expandBtnStr}[</div>`
        // 中间的内容
        if (!isEmpty) {
          str += `<div class="array ${
            this.showLine ? 'showLine' : ''
          }" data-fid=${id}>`
          // 中间的每一行
          data.forEach((item, index) => {
            str += `<div class="row">`
            str += this.stringifyToHtml(item, false, index >= data.length - 1)
            // 避免非空对象或数组的最后一行也有逗号
            if (index < data.length - 1 && !isNoEmptyObjectOrArray(item)) {
              str += `<span class="comma">,</span>`
            }
            str += `</div>`
          })
          str += `</div>`
        }
        // 添加结束的括号
        str += isEmpty
          ? '<span class="bracket">]</span>'
          : `<div class="bracket">]${
              isLast ? '' : '<span class="comma">,</span>'
            }</div>`
        break
      default:
        let isString = dataType === 'string'
        str += `<span class="${dataType}">${isString ? '"' : ''}${data}${
          isString ? '"' : ''
        }</span>`
        break
    }
    return str
  }

  // 渲染行数
  renderRows() {
    if (!this.showRowNum) return
    // 获取树区域元素的实际高度
    let rect = this.treeWrap.getBoundingClientRect()
    // 获取每一行的高度
    let oneRowHeight = this.getOneRowHeight()
    // 总行数
    let rowNum = rect.height / oneRowHeight
    // 如果新行数比上一次渲染的行数多，那么要创建缺少的行数
    if (rowNum > this.lastRenderRows) {
      let fragment = document.createDocumentFragment()
      for (let i = 0; i < rowNum - this.lastRenderRows; i++) {
        let el = document.createElement('div')
        el.className = 'rowNum'
        el.textContent = this.lastRenderRows + i + 1
        fragment.appendChild(el)
      }
      this.rowWrap.appendChild(fragment)
    } else if (rowNum < this.lastRenderRows) {
      // 如果新行数比上一次渲染的行数少，那么要删除多余的行数
      for (let i = 0; i < this.lastRenderRows - rowNum; i++) {
        let lastChild = this.rowWrap.children[this.rowWrap.children.length - 1]
        this.rowWrap.removeChild(lastChild)
      }
    }
    this.lastRenderRows = rowNum
  }

  // 计算一行元素的大小
  getOneRowHeight() {
    if (this.oneRowHeight !== -1) return this.oneRowHeight
    // let el = document.createElement('div')
    // el.textContent = 1
    // this.treeWrap.appendChild(el)
    // let rect = el.getBoundingClientRect()
    // this.treeWrap.removeChild(el)
    // return (this.oneRowHeight = rect.height)
    let style = window.getComputedStyle(this.treeWrap)
    // 获取到行高
    let lineHeight = style.lineHeight
    this.oneRowHeight = parseInt(lineHeight.replace('px', ''))
    return this.oneRowHeight
  }

  // 处理点击事件
  onClick(e) {
    // 获取点击的元素的父级元素
    let target = e.target
    // 如果点击的是展开收起按钮
    if (target.classList.contains('expandBtn')) {
      // 当前是否是展开状态
      let isExpand = target.classList.contains('expand')
      // 获取当前的id
      let id = target.getAttribute('data-id')
      // 找到对应的元素
      let el = document.querySelector(`div[data-fid="${id}"]`)
      // 省略号元素
      let ellipsisEl = document.querySelector(`div[data-eid="${id}"]`)
      if (!ellipsisEl) {
        // 如果不存在，则创建一个
        ellipsisEl = document.createElement('div')
        ellipsisEl.className = 'ellipsis'
        ellipsisEl.innerHTML = '...'
        ellipsisEl.setAttribute('data-eid', id)
        ellipsisEl.style.display = 'none'
        el.parentNode.insertBefore(ellipsisEl, el)
      }
      // 如果是展开状态.根据当前状态切换展开收起按钮的类名、切换整体元素和省略号元素的显示与否
      if (isExpand) {
        target.classList.remove('expand')
        target.classList.add('unExpand')
        el.style.display = 'none'
        ellipsisEl.style.display = 'block'
      } else {
        target.classList.remove('unExpand')
        target.classList.add('expand')
        el.style.display = 'block'
        ellipsisEl.style.display = 'none'
      }
      this.renderRows()
    }
  }

  // 处理鼠标滑入事件
  onMouseover(e) {
    this.clearLastHoverEl()
    let el = getFirstAncestorByClassName(e.target, 'row')
    if (!el) return
    this.lastMouseoverEl = el
    el.classList.add('hover')
  }

  // 处理鼠标滑出事件
  onMouseout() {
    this.clearLastHoverEl()
  }

  // 清除上一次鼠标滑入元素的高亮样式
  clearLastHoverEl() {
    if (this.lastMouseoverEl) {
      this.lastMouseoverEl.classList.remove('hover')
    }
  }

  // 收起所有
  unExpandAll() {
    this.handleToggleExpandAll('expand')
  }

  // 展开所有
  expandAll() {
    this.handleToggleExpandAll('unExpand')
  }

  // 处理展开所有和收起所有
  handleToggleExpandAll(type) {
    let walk = el => {
      if (el.classList.contains('expandBtn') && el.classList.contains(type)) {
        this.onClick({
          target: el
        })
      }
      let children = Array.from(el.children)
      children.forEach(item => {
        walk(item)
      })
    }
    walk(this.treeWrap)
  }
}

export default JsonTreeView
