<template>
    <el-card style="margin-bottom: 1rem" v-loading="state.status.loading">
        <template #header>
            <div class="card-header-content">
                <i-svg name="tencent" color="rgb(var(--assist-color))" size="60px" style="position: absolute; right: 1.5rem; opacity: 0.25"></i-svg>
                <el-tooltip placement="top">
                    <template #content>
                        ● 用于发送验证码相关的服务<br>
                        ● 注册、登录、找回密码、通知等功能都需要依赖此服务
                    </template>
                    <span style="display: inline-flex; align-items: center">
                        <i-svg name="hint" color="rgb(var(--icon-color))" size="14px"></i-svg>
                        <span style="margin-left: 0.25rem">腾讯云短信</span>
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
                    <el-tag type="primary">企业</el-tag>
                    <span style="color: var(--el-text-color-secondary)">
                        也可以用这个，<span v-on:click="method.show()" style="color: var(--el-text-color-primary); cursor: pointer">点我配置</span>
                    </span>
                </div>
            </div>
        </template>
    </el-card>

    <el-dialog v-model="state.status.dialog" class="custom" draggable :close-on-click-modal="false">
        <template #header>
            <strong>配置腾讯云短信服务</strong>
        </template>
        <template #default>
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item label="SecretId：">
                        <el-tooltip content="腾讯云 SecretId" placement="top">
                            <template #content>
                                <i-svg name="hint" size="14px"></i-svg>
                                <span style="margin-left: 0.25rem">SecretId：</span>
                            </template>
                            <el-input v-model="state.struct.secret_id" show-password></el-input>
                        </el-tooltip>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="SecretKey：">
                        <el-tooltip content="腾讯云 SecretKey" placement="top">
                            <template #content>
                                <i-svg name="hint" size="14px"></i-svg>
                                <span style="margin-left: 0.25rem">SecretKey：</span>
                            </template>
                            <el-input v-model="state.struct.secret_key" show-password></el-input>
                        </el-tooltip>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item label="endpoint：">
                        <el-tooltip content="腾讯云短信服务 endpoint" placement="top">
                            <template #content>
                                <i-svg name="hint" size="14px"></i-svg>
                                <span style="margin-left: 0.25rem">endpoint：</span>
                            </template>
                            <el-input v-model="state.struct.endpoint"></el-input>
                        </el-tooltip>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="appid：">
                        <el-tooltip content="腾讯云短信服务 appid" placement="top">
                            <template #content>
                                <i-svg name="hint" size="14px"></i-svg>
                                <span style="margin-left: 0.25rem">appid：</span>
                            </template>
                            <el-input v-model="state.struct.sms_sdk_app_id"></el-input>
                        </el-tooltip>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-form-item label="短信签名：">
                        <el-tooltip content="短信签名，如：萌卜兔" placement="top">
                            <template #content>
                                <i-svg name="hint" size="14px"></i-svg>
                                <span style="margin-left: 0.25rem">短信签名：</span>
                            </template>
                            <el-input v-model="state.struct.sign_name"></el-input>
                        </el-tooltip>
                    </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="验证码模板 id：">
                        <el-tooltip content="验证码模板 id，如：146XXX" placement="top">
                            <template #content>
                                <i-svg name="hint" size="14px"></i-svg>
                                <span style="margin-left: 0.25rem">验证码模板 id：</span>
                            </template>
                            <el-input v-model="state.struct.verify_code"></el-input>
                        </el-tooltip>
                    </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="区域：">
                        <el-tooltip content="短信服务所属区域，如：ap-guangzhou" placement="top">
                            <template #content>
                                <i-svg name="hint" size="14px"></i-svg>
                                <span style="margin-left: 0.25rem">区域：</span>
                            </template>
                            <el-input v-model="state.struct.region"></el-input>
                        </el-tooltip>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row :gutter="20">
                <el-col :span="24">
                    <el-form-item label="接收者手机号：">
                        <el-tooltip content="用于腾讯云短信测试接收测试信息的手机号" placement="top">
                            <template #content>
                                <i-svg name="hint" size="14px"></i-svg>
                                <span style="margin-left: 0.25rem">接收者手机号：</span>
                            </template>
                            <el-input v-model="state.struct.phone" v-on:keydown.enter="method.test()" class="custom" placeholder="请输入手机号">
                                <template #append>
                                    <el-button v-on:click="method.test()" :loading="state.status.test">
                                        <i-svg v-if="!state.status.test" name="phone" size="14px"></i-svg>
                                        <span style="margin-left: 0.25rem">腾讯云短信测试</span>
                                    </el-button>
                                </template>
                            </el-input>
                        </el-tooltip>
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
        phone:          null,
        secret_id:      null,
        secret_key:     null,
        endpoint:       null,
        sms_sdk_app_id: null,
        sign_name:      null,
        verify_code:    null,
        region:         null,
        drive:     {
            sms: null,
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
            name: 'tencent'
        })

        state.status.loading = false

        if (code !== 200) return
        state.struct = data

        // 拷贝一份备份
        state.backup = JSON.parse(JSON.stringify(data))

        state.status.finish  = true
    },
    show() {
        if (!state.status.finish) return ElMessage.warning('配置获取失败，无法进行配置！')
        state.status.dialog = true
    },
    change: async value => {

        const { code, msg } = await axios.put('/api/toml/sms-drive', {
            sms: value ? 'tencent' : ''
        })

        if (code === 200) return emit('refresh', 'sms-aliyun', 'sms-aliyun-verify')

        state.status.active = !value
        ElMessage.error(msg)
    },
    save: async () => {

        let field = ['secret_id', 'secret_key', 'endpoint', 'sms_sdk_app_id', 'sign_name', 'verify_code', 'region']

        // 检查关键配置是否有变化
        if (!utils.object.equal(state.struct, state.backup, field)) return ElMessage.warning('请先完成邮件服务测试')

        if (utils.is.empty(state.struct.secret_id))      return ElMessage.warning('请填写 SecretId！')
        if (utils.is.empty(state.struct.secret_key))     return ElMessage.warning('请填写 SecretKey！')
        if (utils.is.empty(state.struct.endpoint))       return ElMessage.warning('请填写 endpoint！')
        if (utils.is.empty(state.struct.sms_sdk_app_id)) return ElMessage.warning('请填写 appid！')
        if (utils.is.empty(state.struct.sign_name))      return ElMessage.warning('请填写 短信签名！')
        if (utils.is.empty(state.struct.verify_code))    return ElMessage.warning('请填写 验证码模板 id！')
        if (utils.is.empty(state.struct.region))         return ElMessage.warning('请填写 区域！')

        state.status.wait   = true

        const { code, msg } = await axios.put('/api/toml/sms-tencent', state.struct)

        state.status.wait   = false

        if (code !== 200) return ElMessage.error('保存失败：' + msg)

        state.status.dialog = false
    },
    test: async () => {

        if (utils.is.empty(state.struct.phone))          return ElMessage.warning('请填写接收者手机号！')
        if (utils.is.empty(state.struct.secret_id))      return ElMessage.warning('请填写 SecretId！')
        if (utils.is.empty(state.struct.secret_key))     return ElMessage.warning('请填写 SecretKey！')
        if (utils.is.empty(state.struct.endpoint))       return ElMessage.warning('请填写 endpoint！')
        if (utils.is.empty(state.struct.sms_sdk_app_id)) return ElMessage.warning('请填写 appid！')
        if (utils.is.empty(state.struct.sign_name))      return ElMessage.warning('请填写 短信签名！')
        if (utils.is.empty(state.struct.verify_code))    return ElMessage.warning('请填写 验证码模板 id！')
        if (utils.is.empty(state.struct.region))         return ElMessage.warning('请填写 区域！')
        if (!utils.is.phone(state.struct.phone))         return ElMessage.warning('接收者手机号格式不正确！')

        state.status.test         = true

        const { code, msg, data } = await axios.post('/api/toml/test-sms-tencent', state.struct)

        state.status.test         = false

        if (code === 200) {
            // 拷贝一份备份
            state.backup = JSON.parse(JSON.stringify(state.struct))
            return ElMessage.success(msg)
        }

        ElMessage.error(`${msg}<br>${data}`)
    },
}

watch(() => state.struct, () => {
    state.status.active = state.struct.drive.sms === 'tencent'
}, { deep: true })

// 将子组件方法暴露给父组件
defineExpose({
    init: method.init,
})
</script>