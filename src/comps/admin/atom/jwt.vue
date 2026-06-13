<template>
    <el-card v-loading="state.status.loading" style="margin-bottom: 1rem">
        <template #header>
            <div class="card-header-content">
                <i-svg name="crypt" size="55px" color="rgb(var(--assist-color))" style="position: absolute; opacity: 0.25; right: 1.5rem"></i-svg>
                <el-tooltip placement="top">
                    <template #content>
                        JWT（JSON Web Token）是一种在网络应用中传递声明信息的轻量级、安全的方式。<br>
                        JWT具有通用性和可扩展性，可以应用在很多场景，比如用户认证、单点登录、API访问授权等。
                    </template>
                    <span style="display: inline-flex; align-items: center">
                        <i-svg name="hint" color="rgb(var(--icon-color))" size="14px"></i-svg>
                        <span style="margin-left: 0.25rem">JWT</span>
                    </span>
                </el-tooltip>
            </div>
        </template>
        <template #default>
            <div style="display: flex; align-items: center; justify-content: space-between">
                <el-switch v-model="state.status.active" v-on:change="method.change" :disabled="!state.status.finish"
                           active-text="开始" inactive-text="关闭">
                </el-switch>
                <div style="display: flex; align-items: center; gap: 0.5rem">
                    <el-tag type="primary">+5%</el-tag>
                    <span style="color: var(--text-color-secondary)">
                        安全性提升，<span v-on:click="method.show()" style="color: var(--text-color); cursor: pointer">点我配置</span>
                    </span>
                </div>
            </div>
        </template>
    </el-card>

    <el-dialog v-model="state.status.dialog" class="custom" draggable :close-on-click-modal="false">
        <template #header>
            <strong class="flex-center">配置 JSON Web Token</strong>
        </template>
        <template #default>
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item label="签发者">
                        <el-tooltip content="可填写你的昵称" placement="top">
                            <span>
                                <i-svg name="hint" size="14px"></i-svg>
                                <span style="margin-left: 4px">签发者：</span>
                            </span>
                        </el-tooltip>
                        <el-input v-model="state.struct.issuer"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="主题">
                        <el-tooltip content="可填写站点名称" placement="top">
                            <span>
                                <i-svg name="hint" size="14px"></i-svg>
                                <span style="margin-left: 4px">主题：</span>
                            </span>
                        </el-tooltip>
                        <el-input v-model="state.struct.subject"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="密钥">
                        <el-tooltip content="生成JWT的密钥，建议复杂度高一些" placement="top">
                            <span>
                                <i-svg name="hint" size="14px"></i-svg>
                                <span style="margin-left: 0.25rem">密钥：</span>
                            </span>
                        </el-tooltip>
                        <el-input v-model="state.struct.key" class="custom" placeholder="请输入验证码">
                            <template #append>
                                <el-button v-on:click="method.rand()">
                                    <i-svg name="restore" color="rgb(var(--vice-color))" size="14px"></i-svg>
                                    <span style="margin-left: 4px">随机</span>
                                </el-button>
                            </template>
                        </el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="过期时间(秒)">
                        <el-tooltip content="签名有效期，可以用乘法，如：7 * 24 * 60 * 60 表示7天" placement="top">
                            <span>
                                <i-svg name="hint" size="14px"></i-svg>
                                <span style="margin-left: 0.25rem">过期时间(秒)：</span>
                            </span>
                        </el-tooltip>
                        <el-input v-model="state.struct.expire"></el-input>
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
import axios from '{src}/utils/request.js'

const { ctx, proxy } = getCurrentInstance()
const state = reactive({
    struct: {
        key    : null,
        issuer : null,
        subject: null,
        expire : null,
    },
    status: {
        active: true,
        finish: false,
        dialog: false,
        loading: true,
        wait: false,
    }
})

onMounted(async () => {
    await method.init()
})

const method = {
    init: async () => {

        state.status.finish  = false
        state.status.loading = true

        const { code, data } = await axios.get('/api/toml/crypt', {
            name: 'jwt'
        })

        state.status.loading = false

        if (code !== 200) return
        state.struct = data

        state.status.finish  = true
    },
    show() {
        if (!state.status.finish) return ElMessage.warning('分页限制配置获取失败，无法进行配置！')
        state.status.dialog = true
    },
    change: async value => {
        if (!value) {
            state.status.active = true
            ElMessage.warning({
                message: 'JWT是基础服务，这可不能关',
                dangerouslyUseHTMLString: true
            })
        }
    },
    save: async () => {

        state.status.wait   = true

        const { code, msg } = await axios.put('/api/toml/crypt-jwt', state.struct)

        state.status.wait   = false

        if (code !== 200) return ElMessage.error(`保存失败：${msg}`)
        
        ElMessage.success('保存成功')
        state.status.dialog = false
    },
    rand(field = 'key') {
        let result  = 'INIS-'
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        const len   = chars.length
        for (let i  = 0; i < 32; i++) {
            result += chars.charAt(Math.floor(Math.random() * len))
        }
        state.struct[field] = result
    },
}

watch(() => state.struct, () => {
    // key 只允许输入字母、数字和全部的特殊字符
    state.struct.key    = state.struct.key.replace(/[^\w!@#$%^&*()_+\-=\[\]{};:'"\\|\/?,.<>~`\s]/g, '')
    // 只能是 数字、空格和运算符
    state.struct.expire = state.struct.expire.replace(/[^\d\s*+\-\/]/g, '')

}, { deep: true })

// 将子组件方法暴露给父组件
defineExpose({
    init: method.init,
})
</script>