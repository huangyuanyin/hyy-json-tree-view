<script setup lang="ts">
import JsonTreeView from 'hyy-json-tree-view'
import 'hyy-json-tree-view/themes/default.css'
import { onMounted, ref, watch } from 'vue'
import testData from './test.js'

const jsonStr = ref(testData)
const output = ref(null)
let jsonTreeView: any = null
let timer: number | null = null
const showRowNum = ref(false)
const showLine = ref(true)
const showExpandAll = ref(true)
const showExpandBtn = ref(true)
const expandBtnPosition = ref('default')
const showHover = ref(true)
const options = ref([
  { label: '是否显示行号', type: 'toggleShowRowNum', value: true },
  { label: '是否显示竖线', type: 'toggleShowLine', value: true },
  { label: '是否展开所有', type: 'togglExpandAll', value: true },
  { label: '是否显示展开收起按钮', type: 'toggleShowExpandBtn', value: true },
  { label: '开启鼠标滑过效果', type: 'toggleShowHover', value: true }
])

watch(
  () => {
    return jsonStr.value
  },
  () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      jsonTreeView.stringify(jsonStr.value)
    }, 300)
  }
)

const init = () => {
  if (jsonTreeView) {
    jsonTreeView.destroy()
  }
  jsonTreeView = new JsonTreeView({
    el: output.value,
    expandBtnPosition: expandBtnPosition.value,
    showLine: showLine.value,
    showExpandBtn: showExpandBtn.value,
    showHover: showHover.value,
    showRowNum: showRowNum.value
  })
  jsonTreeView.stringify(jsonStr.value)
}

const toggleShowRowNum = () => {
  showRowNum.value = !showRowNum.value
  init()
}

const toggleShowLine = () => {
  showLine.value = !showLine.value
  init()
}

const expandAll = () => {
  jsonTreeView.expandAll()
}

const unExpandAll = () => {
  jsonTreeView.unExpandAll()
}

const toggleShowExpandBtn = () => {
  showExpandBtn.value = !showExpandBtn.value
  init()
}

const toggleExpandBtnPosition = () => {
  expandBtnPosition.value =
    expandBtnPosition.value === 'default' ? 'left' : 'default'
  init()
}

const toggleShowHover = () => {
  showHover.value = !showHover.value
  init()
}

const handleOptions = (val: { type: any }) => {
  switch (val.type) {
    case 'toggleShowRowNum':
      toggleShowRowNum()
      break
    case 'toggleShowLine':
      toggleShowLine()
      break
    case 'togglExpandAll':
      showExpandAll.value = !showExpandAll.value
      showExpandAll.value ? expandAll() : unExpandAll()
      break
    case 'toggleShowExpandBtn':
      toggleShowExpandBtn()
      break
    case 'toggleExpandBtnPosition':
      toggleExpandBtnPosition()
      break
    case 'toggleShowHover':
      toggleShowHover()
      break
    default:
      break
  }
}

const selectExpandBtnPosition = () => {
  init()
}

onMounted(() => {
  init()
})
</script>

<template>
  <div class="exmaple">
    <h1>hyy-json-tree-view</h1>
    <p>
      Welcome to the demo space of Hyy-Json-Tree-view, here we provide the
      following different function options, please try to click on different
      options to browse.
    </p>
    <div class="tabs">
      <div class="tabs_header">
        <div class="tabs-header-item is-active">Basic Use</div>
      </div>
      <div class="tabs-content">
        <div class="example-box">
          <div class="block">
            <h3>JSON:</h3>
            <textarea v-model="jsonStr"></textarea>
            <h3>Options:</h3>
            <div class="options">
              <div v-for="(item, index) in options" :key="'options' + index">
                <label>{{ item.label }}</label>
                <input
                  type="checkbox"
                  v-model="item.value"
                  @change="handleOptions(item)"
                />
              </div>
              <div>
                <label>展开收起按钮显示位置</label>
                <select
                  v-model="expandBtnPosition"
                  @change="selectExpandBtnPosition"
                >
                  <option value="default">左侧</option>
                  <option value="left">括号旁边</option>
                </select>
              </div>
            </div>
          </div>
          <div class="block">
            <div class="jsonTreeViewOutputBox">
              <h3>hyy-json-tree-view：</h3>
              <div class="jsonTreeViewOutput" ref="output"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.exmaple {
  /* width: 100%; */
  height: 100%;
  padding: 0 20px;
}
.exmaple h1 {
  text-align: center;
}
.exmaple p {
  margin: 20px 20px 20px 0;
  color: #8c8c8c;
}
.exmaple .tabs .tabs_header {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #ccc;
}
.exmaple .tabs .tabs_header .tabs-header-item {
  color: #1890ff;
  position: relative;
  margin-right: 20px;
  padding: 8px 0;
  cursor: pointer;
}
.tabs-header-item.is-active:after,
.tabs-header-item:after {
  border-bottom: 2px solid #1890ff;
  content: '';
  width: 100%;
  position: absolute;
  left: 0;
  bottom: -1px;
}
.tabs .tabs-content .example-box {
  display: flex;
}
.example-box .block:first-child {
  margin-right: 30px;
}
.example-box textarea {
  width: 100%;
  height: 150px;
  resize: vertical;
  padding: 3px 8px;
  border-radius: 5px;
  border: 1px solid #bbb;
  font-family: inherit;
}
.tabs .tabs-content .example-box .block {
  width: 50%;
}
.jsonTreeViewContainer {
  position: absolute;
  left: 0;
  top: 10;
  width: 100%;
  height: 100%;
  display: flex;
  overflow: hidden;
}
.jsonTreeViewInputBox,
.jsonTreeViewOutputBox {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.jsonTreeViewInputBox {
  border-right: 1px solid #d0d7de;
}
.jsonTreeViewInput {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  padding: 10px;
}

.jsonTreeViewOutputBox {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.jsonTreeViewOutputToolbar {
  height: 30px;
  flex-shrink: 0;
  border-bottom: 1px solid #d0d7de;
  display: flex;
  align-items: center;
}

.jsonTreeViewOutputToolbar button {
  margin-right: 10px;
}

.jsonTreeViewOutput {
  overflow: auto;
}

.options {
  font-size: 14px;
}
.options label {
  margin-right: 5px;
}
</style>
