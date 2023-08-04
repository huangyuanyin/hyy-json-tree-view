# hyy json tree view

一个简洁的 json 格式化插件，不依赖任何库和框架。

## 安装

```bash
npm i hyy-json-tree-view
```

## 引入

```js
import JsonTreeView from 'hyy-json-tree-view'
import 'hyy-json-tree-view/themes/default.css'
```

## 使用

```js
new JsonTreeView({
  el: '#container'
})
```

> 具体示例请参照：https://github.com/huangyuanyin/hyy-json-tree-view/blob/master/demo/src/App.vue

## API

### 创建实例

```js
import JsonTreeView from 'hyy-json-tree-view'
let jsonTreeView = new JsonTreeView(options)
```

### 实例化选项 options

一个对象，支持的属性如下：

| 属性              | 说明                                                | 类型        | 可选值                                  | 默认值  |
| ----------------- | --------------------------------------------------- | ----------- | --------------------------------------- | ------- |
| el                | 必传，容器元素，可以传一个选择器，也可以传 dom 元素 | HTMLElement | —                                       |         |
| expandBtnPosition | 展开收起按钮的位置                                  | String      | default（紧贴括号）、left（统一在左侧） | default |
| showLine          | 是否显示竖线                                        | Boolean     | —                                       | false   |
| showExpandBtn     | 是否显示展开收起按钮                                | Boolean     | —                                       | true    |
| showHover         | 是否显示鼠标滑入的高亮效果                          | Boolean     | —                                       | true    |
| showRowNum        | 是否显示行数                                        | Boolean     | —                                       | false   |
| errorSliceNum     | 出错位置前后截取的字符串长度                        | Number      | —                                       | 20      |

### 实例方法

#### destroy()

销毁。

#### stringify(data)

- data：json 字符串，或 json 对象

渲染 json 树。

#### unExpandAll()

收起所有。

#### expandAll()

展开所有。
