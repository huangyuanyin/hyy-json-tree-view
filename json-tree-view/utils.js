// 获取一个数据的类型
export const type = obj => {
  return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase()
}

// 判断一个数据是否是非空的对象或数组
export const isNoEmptyObjectOrArray = data => {
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
export const getFirstAncestorByClassName = (el, className) => {
  // 向上找到容器元素就停止
  while (!el.classList.contains('hyyJsonTreeViewContainer_abc123')) {
    if (el.classList.contains(className)) {
      return el
    }
    el = el.parentNode
  }
  return null
}
