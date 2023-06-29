<script setup lang="ts">
import JsonTreeView from 'hyy-json-tree-view'
import 'hyy-json-tree-view/themes/default.css'
import { onMounted, ref, watch } from 'vue'
import testData from './test.json'

const jsonStr = ref(JSON.stringify(testData))
const output = ref(null)
let jsonTreeView: any = null

watch(
  () => jsonStr.value,
  () => {
    jsonTreeView.stringify(jsonStr.value)
  }
)

onMounted(() => {
  jsonTreeView = new JsonTreeView({
    el: output.value,
    expandBtnPosition: 'default', // left
    showLine: true,
    showExpandBtn: true,
    showHover: true
  })
  jsonTreeView.stringify(jsonStr.value)
})
</script>

<template>
  <div class="jsonTreeViewContainer">
    <div class="jsonTreeViewInputBox">
      <textarea class="jsonTreeViewInput" v-model="jsonStr"></textarea>
    </div>
    <div class="jsonTreeViewOutputBox" ref="output"></div>
  </div>
</template>

<style scoped>
.jsonTreeViewContainer {
  position: absolute;
  left: 0;
  top: 0;
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
  padding: 10px;
  overflow: auto;
}
</style>
