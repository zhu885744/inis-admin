<template>
    <el-dialog v-model="state.item.dialog" class="custom" :close-on-click-modal="false">
        <template #header>
            <strong class="flex-center">修改个人信息</strong>
        </template>
        <template #default>
            <div class="row">
                <div class="col-md-3">
                    <div class="form-group mb-3">
                        <label class="form-label">
                            <el-tooltip content="您的尊称是？" placement="top">
                                <span>
                                    <i-svg color="rgb(var(--icon-color))" name="hint" size="14px"></i-svg>
                                    <span class="ms-1">昵称：</span>
                                </span>
                            </el-tooltip>
                        </label>
                        <el-input v-model="state.struct.nickname"></el-input>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="form-group mb-3">
                        <label class="form-label">
                            <el-tooltip content="您的性别是？" placement="top">
                                <span>
                                    <i-svg color="rgb(var(--icon-color))" name="hint" size="14px"></i-svg>
                                    <span class="ms-1">性别：</span>
                                </span>
                            </el-tooltip>
                        </label>
                        <el-select v-model="state.struct.gender" class="d-block custom font-13" placeholder="请选择">
                            <el-option v-for="item in state.select.gender" :key="item.value" :label="item.label" :value="item.value">
                            </el-option>
                        </el-select>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="form-group mb-3">
                        <label class="form-label">
                            <el-tooltip content="建议设置一个头像，效果更佳" placement="top">
                                <span>
                                    <i-svg color="rgb(var(--icon-color))" name="hint" size="14px"></i-svg>
                                    <span class="ms-1">头像：</span>
                                </span>
                            </el-tooltip>
                        </label>
                        <el-input v-model="state.struct.avatar" autocomplete="off" class="custom" placeholder="填写图片地址或点击上传图片">
                            <template #append>
                                <el-button v-on:click="method.upload('avatar')" :loading="state.item.upload">
                                    <i-svg v-if="!state.item.upload" name="upload" color="rgb(var(--icon-color))" size="14px"></i-svg>
                                    <span class="ms-1">上传</span>
                                </el-button>
                            </template>
                        </el-input>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-lg-12">
                    <div class="form-group mb-3">
                        <label class="form-label">
                            <el-tooltip content="简单的介绍一下" placement="top">
                                <span>
                                    <i-svg color="rgb(var(--icon-color))" name="hint" size="14px"></i-svg>
                                    <span class="ms-1">个人简介：</span>
                                </span>
                            </el-tooltip>
                        </label>
                        <el-input v-model="state.struct.description" :autosize="{ minRows: 3, maxRows: 10 }" type="textarea"></el-input>
                    </div>
                </div>
            </div>
        </template>
        <template #footer>
            <el-button v-on:click="state.item.dialog = false">取 消</el-button>
            <el-button v-on:click="method.save()" :loading="state.item.wait">保 存</el-button>
        </template>
    </el-dialog>
</template>

<script setup>
import cache from '{src}/utils/cache'
import utils from '{src}/utils/utils'
import axios from '{src}/utils/request'

const { ctx, proxy } = getCurrentInstance()
const emit  = defineEmits(['finish'])
const state = reactive({
    item: {
        wait: false,    // 是否等待
        dialog: false,  // 是否显示对话框
        upload: false,  // 是否正在上传
    },
    struct: cache.get('user-info') || {},
    select: {
        gender: [
            { value: null, label: '保密'},
            { value: 'boy', label: '男' },
            { value: 'girl', label: '女' },
        ]
    }
})

const method = {
    // 显示对话框
    show: () => (state.item.dialog = true),
    save: async () => {
        // 增加昵称必填验证
        if (utils.is.empty(state.struct?.nickname)) {
            return ElMessage.warning('请输入昵称！')
        }
        
        if (utils.is.empty(state.struct?.id)) {
            return ElMessage.warning('请先登录！')
        }

        state.item.wait = true

        try {
            const { code, msg } = await axios.put('/api/users/update', state.struct)

            if (code !== 200) {
                ElMessage.error(msg)
                return
            }

            ElMessage.success('个人信息修改成功！')
            state.item.dialog = false
            
            // 重新获取用户信息
            await method.checkToken()
        } catch (error) {
            ElMessage.error('网络异常，修改失败')
        } finally {
            state.item.wait = false
        }
    },
    // 校验登录
    async checkToken() {
        try {
            const { data, code } = await axios.post('/api/comm/check-token')

            if (code !== 200) {
                ElMessage.warning('用户信息同步失败')
                return
            }

            emit('finish', data.user)
            cache.set('user-info', data.user, 10)
            ElMessage.success('用户信息已更新')
        } catch (error) {
            ElMessage.error('用户信息同步失败')
        }
    },
    // 上传
    async upload(field = 'image') {
        // 创建一个 input
        const input  = document.createElement('input')
        input.type   = 'file'
        input.accept = 'image/*'

        // 监听 input 的 change 事件
        input.addEventListener('change', async () => {
            // 验证是否选择了文件
            if (!input.files || input.files.length === 0) {
                return ElMessage.warning('请选择图片文件')
            }

            // 创建一个 formData
            const params = new FormData
            params.append('file', input.files[0])

            state.item.upload = true

            try {
                // 上传图片
                const { code, msg, data } = await axios.post('/api/file/upload', params)

                if (code !== 200) {
                    ElMessage.error(msg)
                    return
                }
                
                // 设置图片
                state.struct[field] = data.path
                ElMessage.success('上传成功！')
            } catch (error) {
                ElMessage.error('图片上传失败，请重试')
            } finally {
                // 清空 input
                input.value = ''
                state.item.upload = false
            }
        })

        // 触发 input 的 click 事件
        input.click()
    },
}

// 将子组件方法暴露给父组件
defineExpose({
    show: method.show,
})
</script>