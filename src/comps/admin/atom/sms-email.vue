<template>
    <el-card v-loading="state.status.loading" style="margin-bottom: 1rem">
        <template #header>
            <div class="card-header-content">
                <i-svg name="email" color="rgb(var(--assist-color))" size="55px" style="position: absolute; right: 1.5rem; opacity: 0.25"></i-svg>
                <el-tooltip placement="top">
                    <template #content>
                        ● 用于发送验证码、通知等邮件相关的服务<br>
                        ● 注册、找回密码、通知等功能都需要依赖此服务
                    </template>
                    <span style="display: inline-flex; align-items: center">
                        <i-svg name="hint" color="rgb(var(--icon-color))" size="14px"></i-svg>
                        <span style="margin-left: 0.25rem">邮件服务</span>
                    </span>
                </el-tooltip>
            </div>
        </template>
        <template #default>
            <div style="display: flex; align-items: center; justify-content: space-between">
                <el-switch v-model="state.status.active" v-on:change="method.change" :disabled="!state.status.finish"
                           active-text="开启" inactive-text="关闭">
                </el-switch>
                <div style="display: flex; align-items: center; gap: 0.5rem">
                    <el-tag type="danger">推荐</el-tag>
                    <span style="color: var(--el-text-color-secondary)">
                        因为不花钱，<span v-on:click="method.show()" style="color: var(--el-text-color-primary); cursor: pointer">点我配置</span>
                    </span>
                </div>
            </div>
        </template>
    </el-card>

    <el-dialog v-model="state.status.dialog" class="custom" draggable :close-on-click-modal="false">
        <template #header>
            <strong style="display: flex; align-items: center; justify-content: center">配置邮件服务</strong>
        </template>
        <template #default>
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item label="邮件服务器地址">
                        <el-tooltip content="邮件服务器地址，如：smtp.qq.com" placement="top">
                            <span>
                                <i-svg name="hint" size="14px"></i-svg>
                                <span style="margin-left: 0.25rem">邮件服务器地址：</span>
                            </span>
                        </el-tooltip>
                        <el-input v-model="state.struct.host"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="邮件服务端口">
                        <el-tooltip content="邮件服务端口，如：465" placement="top">
                            <span>
                                <i-svg name="hint" size="14px"></i-svg>
                                <span style="margin-left: 0.25rem">邮件服务端口：</span>
                            </span>
                        </el-tooltip>
                        <el-input-number v-model="state.struct.port" style="width: 100%; display: flex" controls-position="right" :min="1"></el-input-number>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="邮件账号">
                        <el-tooltip content="邮件账号，如：xxx@qq.com" placement="top">
                            <span>
                                <i-svg name="hint" size="14px"></i-svg>
                                <span style="margin-left: 0.25rem">邮件账号：</span>
                            </span>
                        </el-tooltip>
                        <el-input v-model="state.struct.account"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="服务密码">
                        <el-tooltip content="服务密码，不是邮箱密码" placement="top">
                            <span>
                                <i-svg name="hint" size="14px"></i-svg>
                                <span style="margin-left: 0.25rem">服务密码：</span>
                            </span>
                        </el-tooltip>
                        <el-input v-model="state.struct.password" show-password></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="邮件昵称">
                        <el-tooltip content="邮件昵称，可以为空，但不能包含中文" placement="top">
                            <span>
                                <i-svg name="hint" size="14px"></i-svg>
                                <span style="margin-left: 0.25rem">邮件昵称：</span>
                            </span>
                        </el-tooltip>
                        <el-input v-model="state.struct.nickname"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="邮件签名">
                        <el-tooltip content="邮件签名，也就是邮件的主题或标题，不推荐为空" placement="top">
                            <span>
                                <i-svg name="hint" size="14px"></i-svg>
                                <span style="margin-left: 0.25rem">邮件签名：</span>
                            </span>
                        </el-tooltip>
                        <el-input v-model="state.struct.sign_name"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="24">
                    <el-form-item label="接收者邮箱">
                        <el-tooltip content="用于邮件服务测试接收测试信息的邮箱" placement="top">
                            <span>
                                <i-svg name="hint" size="14px"></i-svg>
                                <span style="margin-left: 0.25rem">接收者邮箱：</span>
                            </span>
                        </el-tooltip>
                        <el-input v-model="state.struct.email" v-on:keydown.enter="method.test()" class="custom" placeholder="请输入邮箱">
                            <template #append>
                                <el-button v-on:click="method.test()" :loading="state.status.test">
                                    <i-svg v-if="!state.status.test" name="email" size="14px"></i-svg>
                                    <span style="margin-left: 0.25rem">邮件服务测试</span>
                                </el-button>
                            </template>
                        </el-input>
                    </el-form-item>
                </el-col>
            </el-row>
        </template>
        <template #footer>
            <el-button v-on:click="state.status.dialog = false">取 消</el-button>
            <el-button v-on:click="method.save()" :loading="state.status.wait">保 存</el-button>
        </template>
    </el-dialog>
</template>

<script setup>
import utils from '{src}/utils/utils.js'
import axios from '{src}/utils/request.js'

const { ctx, proxy } = getCurrentInstance()
const emit  = defineEmits(['refresh'])
const state = reactive({
    struct: {
        email:     null,
        host:      null,
        port:      null,
        account:   null,
        password:  null,
        nickname:  null,
        sign_name: null,
        drive:     {
            email: null,
            default: null,
        },
    },
    status: {
        finish: false,
        active: false,
        dialog: false,
        loading: true,
        wait: false,
        test: false,
    },
    backup: {}
})

onMounted(async () => {
    await method.init()
})

const method = {
    init: async () => {

        state.status.finish  = false
        state.status.loading = true

        const { code, data } = await axios.get('/api/toml/sms', {
            name: 'email'
        })

        state.status.loading = false

        if (code !== 200) return
        state.struct = data

        // 拷贝一份备份
        state.backup = JSON.parse(JSON.stringify(data))

        state.status.finish  = true
    },
    show() {
        if (!state.status.finish) return ElMessage.warning('邮件服务配置获取失败，无法进行配置！')
        state.status.dialog = true
    },
    change: async value => {

        const { code, msg } = await axios.put('/api/toml/sms-drive', {
            email: value ? 'email' : ''
        })

        if (code === 200) return

        state.status.active = !value
        ElMessage.error(msg)
    },
    save: async () => {

        let field = ['host', 'port', 'account', 'password']

        // 检查关键配置是否有变化
        if (!utils.object.equal(state.struct, state.backup, field)) return ElMessage.warning('请先完成邮件服务测试')

        if (utils.is.empty(state.struct.host))      return ElMessage.warning('请填写邮件服务器地址！')
        if (utils.is.empty(state.struct.port))      return ElMessage.warning('请填写邮件服务器端口！')
        if (utils.is.empty(state.struct.account))   return ElMessage.warning('请填写邮件账号！')
        if (utils.is.empty(state.struct.password))  return ElMessage.warning('请填写服务密码！')
        if (utils.is.empty(state.struct.sign_name)) return ElMessage.warning('请填写邮件签名！')
        if (method.chinese(state.struct.nickname))  return ElMessage.warning('邮件昵称不能包含中文！')

        state.status.wait   = true

        const { code, msg } = await axios.put('/api/toml/sms-email', state.struct)

        state.status.wait   = false

        if (code !== 200) return ElMessage.error('保存失败：' + msg)

        state.status.dialog = false
        ElMessage.success('保存成功')
    },
    test: async () => {

        if (utils.is.empty(state.struct.email))     return ElMessage.warning('请填写接收者邮箱！')
        if (utils.is.empty(state.struct.host))      return ElMessage.warning('请填写邮件服务器地址！')
        if (utils.is.empty(state.struct.port))      return ElMessage.warning('请填写邮件服务器端口！')
        if (utils.is.empty(state.struct.account))   return ElMessage.warning('请填写邮件账号！')
        if (utils.is.empty(state.struct.password))  return ElMessage.warning('请填写服务密码！')
        if (utils.is.empty(state.struct.sign_name)) return ElMessage.warning('请填写邮件签名！')
        if (!utils.is.email(state.struct.email))    return ElMessage.warning('接收者邮箱格式不正确！')
        if (method.chinese(state.struct.nickname))  return ElMessage.warning('邮件昵称不能包含中文！')

        state.status.test         = true

        const { code, msg, data } = await axios.post('/api/toml/test-sms-email', state.struct)

        state.status.test         = false

        if (code === 200) {
            // 拷贝一份备份
            state.backup = JSON.parse(JSON.stringify(state.struct))
            return ElMessage.success(msg)
        }

        ElMessage.error(`${msg}<br>${data}`)
    },
    chinese: value => {
        // 匹配中文字符的Unicode范围
        let pattern = /[\u4e00-\u9fa5]/
        return pattern.test(value)
    }
}

watch(() => state.struct, () => {
    state.status.active = state.struct.drive.email === 'email'
}, { deep: true })

// 将子组件方法暴露给父组件
defineExpose({
    init: method.init,
})
</script>