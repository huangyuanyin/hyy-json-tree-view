const type = obj => {
  return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase()
}

const isNoEmptyObjectOrArray = data => {
  const dataType = type(data)
  switch (dataType) {
    case 'object':
      return Object.keys(data).length > 0 // 对象的key长度大于0, 则认为是非空对象，返回true
    case 'array':
      return data.length > 0
    default:
      return false
  }
}

// 获取指定元素的第一个指定类名的祖先元素
const getFirstAncestorByClassName = (el, className) => {
  // 向上找到容器元素就停止
  while (!el.classList.contains('hyyJsonTreeViewContainer_abc123')) {
    if (el.classList.contains(className)) {
      return el
    }
    el = el.parentNode
  }
  return null
}

class JsonTreeView {
  constructor({
    el,
    expandBtnPosition = 'default',
    showLine = false,
    showExpandBtn = true,
    showHover = true
  }) {
    this.el = type(el) === 'string' ? document.querySelector(el) : el
    this.expandBtnPosition = expandBtnPosition // 展开按钮的位置：default(紧贴括号)，left(统一在左侧)
    this.showLine = showLine // 是否显示竖线
    this.showExpandBtn = showExpandBtn // 是否显示展开按钮
    this.showHover = showHover // 是否显示hover效果
    this.wrap = null // 容器
    this.uniqueId = 0 // 每一层的id
    this.lastMouseoverEl = null // 上一次鼠标移入的元素
    this.init()
  }

  init() {
    this.wrap = document.createElement('div')
    this.wrap.className = `hyyJsonTreeViewContainer_abc123 ${
      this.expandBtnPosition === 'left' ? 'addPadding' : ''
    }`
    this.el.appendChild(this.wrap)
    this.onClick = this.onClick.bind(this)
    this.onMouseover = this.onMouseover.bind(this)
    this.onMouseout = this.onMouseout.bind(this)
    this.wrap.addEventListener('click', this.onClick)
    if (this.showHover) {
      this.wrap.addEventListener('mouseover', this.onMouseover)
      this.wrap.addEventListener('mouseout', this.onMouseout)
    }
  }

  destory() {
    this.wrap.removeEventListener('click', this.onClick)
    if (this.showHover) {
      this.wrap.removeEventListener('mouseover', this.onMouseover)
      this.wrap.removeEventListener('mouseout', this.onMouseout)
    }
    this.el.removeChild(this.wrap)
  }

  stringify(data) {
    if (typeof data === 'string') {
      data = JSON.parse(data)
    }
    this.wrap.innerHTML = `<div class="row">${this.stringifyToHtml(data)}</div>`
  }

  stringifyToHtml(data, isAsKeyValue = false, isLast = true) {
    const dataType = type(data)
    let str = '' // 每一层的字符串
    let isEmpty = false // 是否为空对象或数组
    let id = 'hyyJsonTreeViewId_' + this.uniqueId++ // 每一层的id
    const expandBtnStr = this.showExpandBtn
      ? `<span class="expandBtn expand ${
          this.expandBtnPosition === 'left' ? 'inLeft' : ''
        }" data-id='${id}'>
        <svg data-v-2ac842d8="" fill="#747983" viewBox="0 0 24 24" style="vertical-align: middle; color: rgb(1, 160, 228); height: 1em; width: 1em;" preserveAspectRatio="xMidYMid meet"><path data-v-2ac842d8="" d="M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M7,13H17V11H7"></path></svg>
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

  onClick(e) {
    // 获取点击的元素的父级元素
    let target = e.target.parentNode
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
        target.innerHTML = `<svg data-v-2ac842d8="" fill="#747983" viewBox="0 0 24 24" style="vertical-align: middle; color: rgb(161, 106, 148); height: 1em; width: 1em;" preserveAspectRatio="xMidYMid meet"><path data-v-2ac842d8="" d="M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M13,7H11V11H7V13H11V17H13V13H17V11H13V7Z"></path></svg>        `
        el.style.display = 'none'
        ellipsisEl.style.display = 'block'
      } else {
        target.classList.remove('unExpand')
        target.classList.add('expand')
        target.innerHTML = `<svg data-v-2ac842d8="" fill="#747983" viewBox="0 0 24 24" style="vertical-align: middle; color: rgb(1, 160, 228); height: 1em; width: 1em;" preserveAspectRatio="xMidYMid meet"><path data-v-2ac842d8="" d="M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M7,13H17V11H7"></path></svg>        `
        el.style.display = 'block'
        ellipsisEl.style.display = 'none'
      }
    }
  }

  onMouseover(e) {
    this.clearLastHoverEl()
    let el = getFirstAncestorByClassName(e.target, 'row')
    this.lastMouseoverEl = el
    el.classList.add('hover')
  }

  onMouseout() {
    this.clearLastHoverEl()
  }

  clearLastHoverEl() {
    if (this.lastMouseoverEl) {
      this.lastMouseoverEl.classList.remove('hover')
    }
  }
}

export default JsonTreeView
