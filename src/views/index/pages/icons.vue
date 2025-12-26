<template>
  <div class="container-fluid container-box">
    <el-alert title="双击图标名称可复制" type="info" effect="dark" show-icon :closable="false"/>
    <div class="row icons-list-demo g-1">
      <div v-for="item in state.icons" :key="item" class="col-xl-4 col-lg-6 col-sm-6 col-4">
        <el-card shadow="hover" class="p-1">
          <div class="d-flex align-items-center">
            <i-svg :name="item" size="20px" />
            <span v-on:dblclick="copy(item, '复制成功')" class="ms-2 text-truncate" style="flex: 1">
              {{ item }}
            </span>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import utils from '{src}/utils/utils.js'
import notyf from '{src}/utils/notyf.js'

const { ctx, proxy } = getCurrentInstance()

const state = reactive({
  icons: []
})
const modulesFiles = import.meta.glob('../../../assets/svg/*.svg');
let files = []
for (let path in modulesFiles) files.push(path)
state.icons = files.map(item => item.split('/').pop().split('.').shift())

const copy = (text = null, msg = null) => {
  if (utils.is.empty(text)) return
  utils.set.copy.text(text)
  if (!utils.is.empty(msg)) return notyf.success(msg)
}
</script>

<style scoped>
/* 可选：调整卡片样式 */
.icons-list-demo {
  padding: 20px 0;
}

/* 解决文本过长溢出问题 */
.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>