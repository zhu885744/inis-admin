<template>
    <el-dialog v-model="state.item.dialog" class="custom small-dialog" :close-on-click-modal="false"width="500px"max-width="90vw">
        <template #default>
            <div class="container">
                <el-alert type="success" :closable="false" center class="mb-3 box-shadow-light">
                    <template #title>
                        <i-svg name="!" size="15px" color="var(--el-color-success)"></i-svg>
                        <span class="ms-1">注册账号</span>
                    </template>
                </el-alert>

                <!-- 昵称输入项 -->
                <div class="form-item mb-3">
                    <label class="form-label block mb-1">
                        <el-tooltip content="希望别人怎么称呼您？" placement="top">
                            <span>
                                <i-svg color="rgb(var(--icon-color))" name="hint" size="14px"></i-svg>
                                <span class="ms-1 required">昵称：</span>
                            </span>
                        </el-tooltip>
                    </label>
                    <el-input v-model="state.struct.nickname" class="custom" placeholder="请输入昵称"></el-input>
                </div>

                <!-- 账号输入项 -->
                <div class="form-item mb-3">
                    <label class="form-label block mb-1 required">
                        <el-tooltip content="（必须）定制您的专属账号" placement="top">
                            <span>
                                <i-svg color="rgb(var(--icon-color))" name="hint" size="14px"></i-svg>
                                <span class="ms-1">账号：</span>
                            </span>
                        </el-tooltip>
                    </label>
                    <el-input v-model="state.struct.account" class="custom" placeholder="请输入账号"></el-input>
                </div>

                <!-- 密码输入项 -->
                <div class="form-item mb-3">
                    <label class="form-label block mb-1">
                        <el-tooltip content="该账号的密码" placement="top">
                            <span>
                                <i-svg color="rgb(var(--icon-color))" name="hint" size="14px"></i-svg>
                                <span class="ms-1 required">密码：</span>
                            </span>
                        </el-tooltip>
                    </label>
                    <el-input v-model="state.password.value" show-password class="custom" placeholder="请输入密码"></el-input>
                </div>

                <!-- 确认密码输入项 -->
                <div class="form-item mb-3">
                    <label class="form-label block mb-1 required">
                        <el-tooltip content="（必须）再次确认密码" placement="top">
                            <span>
                                <i-svg color="rgb(var(--icon-color))" name="hint" size="14px"></i-svg>
                                <span class="ms-1">确认密码：</span>
                            </span>
                        </el-tooltip>
                    </label>
                    <el-input v-model="state.password.verify" show-password class="custom" placeholder="请再次输入密码"></el-input>
                </div>

                <!-- 联系方式输入项 -->
                <div class="form-item mb-3">
                    <label class="form-label block mb-1">
                        <el-tooltip content="可以是邮箱或者手机号，用于找回密码或验证码登录等" placement="top">
                            <span>
                                <i-svg color="rgb(var(--icon-color))" name="hint" size="14px"></i-svg>
                                <span class="ms-1 required">联系方式：</span>
                            </span>
                        </el-tooltip>
                    </label>
                    <el-input v-model="state.struct.social" class="custom" placeholder="电子邮箱或手机号"></el-input>
                </div>

                <!-- 验证码输入项 -->
                <div class="form-item mb-3">
                    <label class="form-label block mb-1 required">
                        <el-tooltip content="（必须）用于确认您的邮箱或者手机号是有效的" placement="top">
                            <span>
                                <i-svg color="rgb(var(--icon-color))" name="hint" size="14px"></i-svg>
                                <span class="ms-1">验证码：</span>
                            </span>
                        </el-tooltip>
                    </label>
                    <el-input v-model="state.struct.code" class="custom" placeholder="请输入验证码">
                        <template #suffix>
                            <el-button @click="method.code()" :loading="state.item.loading">
                                获取 <span v-if="state.item.loading">{{ state.item.second }} s</span>
                            </el-button>
                        </template>
                    </el-input>
                </div>
            </div>
        </template>

        <template #footer>
            <div class="modal-footer d-flex justify-content-center">
                <el-button @click="method.login()">
                    已有账号？点我登录
                </el-button>
                <el-button @click="method.register()" :loading="state.item.wait">
                    {{ state.item.wait ? '注册中 ...' : '注  册' }}
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
import utils from '{src}/utils/utils.js'
import notyf from '{src}/utils/notyf.js'
import axios from '{src}/utils/request.js'
import cache from "{src}/utils/cache.js";
import { useCommStore } from '{src}/store/comm'
import { reactive, watch, onUnmounted, getCurrentInstance } from 'vue'

const { ctx, proxy } = getCurrentInstance()
const emit = defineEmits(['finish'])
const store = {
    comm: useCommStore()
}
const state = reactive({
    item: {
        loading: false, // 是否加载中
        dialog: false,
        wait: false,
        second: 0,
    },
    struct: {
        social: null, // 联系方式
        account: null, // 账号
        password: null, // 密码（未使用，可删除）
        nickname: null, // 昵称
        code: null, // 验证码
    },
    password: {
        value: null,
        verify: null,
    },
    timer: null,
})

const method = {
    // 注册
    register: async () => {
        if (utils.is.empty(state.struct.nickname)) return notyf.warn('请填写您的昵称！')
        if (utils.is.empty(state.struct.account)) return notyf.warn('请输入一个自定义账号！')
        if (utils.is.empty(state.struct.social)) return notyf.warn('请输入您的联系方式！')
        if (utils.is.empty(state.password.value)) return notyf.warn('请输入密码！')
        if (utils.is.empty(state.password.verify)) return notyf.warn('请再次输入密码！')
        if (utils.is.empty(state.struct.code)) return notyf.warn('请输入验证码！')
        if (state.password.value !== state.password.verify) return notyf.warn('两次输入的密码不一致！')

        state.item.wait = true

        try {
            const { code, msg, data } = await axios.post('/api/comm/register', {
                ...state.struct, password: state.password.value
            })

            state.item.wait = false

            if (code !== 200) return notyf.error(msg)

            notyf.success(msg)
            cache.set('user-info', data.user, 10)
            utils.set.cookie(globalThis?.inis?.token_name || 'INIS_LOGIN_TOKEN', data.token, 7 * 24 * 60 * 60)
            state.item.dialog = false
            // 更新仓库状态
            store.comm.login.finish = true
            store.comm.login.user = data.user
            store.comm.switchAuth('register', false)
            // 通知父组件
            emit('finish', data.user)
        } catch (error) {
            state.item.wait = false
            notyf.error('网络异常，请稍后再试！')
        }
    },
    // 获取验证码
    code: async () => {
        if (utils.is.empty(state.struct.social)) return notyf.warn('请输入您的联系方式！')

        // 校验联系方式格式（手机号/邮箱）
        const social = state.struct.social
        const isPhone = /^1[3-9]\d{9}$/.test(social)
        const isEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(social)
        if (!isPhone && !isEmail) {
            return notyf.warn('联系方式请填写正确的手机号或邮箱！')
        }

        try {
            const { code, msg } = await axios.post('/api/comm/send-register-code', {
                social: state.struct.social,
            })

            if (!utils.in.array(code, [200, 201])) return notyf.error(msg)

            notyf.success(msg || '验证码发送成功！')

            // 启动倒计时，先清除旧定时器
            if (state.timer) clearInterval(state.timer)
            state.item.second = 60
            state.timer = setInterval(() => {
                state.item.second--
                if (state.item.second <= 0) {
                    clearInterval(state.timer)
                    state.timer = null
                    state.item.second = 0
                }
            }, 1000)
        } catch (error) {
            notyf.error('网络异常，验证码发送失败！')
        }
    },
    // 显示对话框
    show: () => (state.item.dialog = true),
    // 点击登录
    login: () => {
        store.comm.switchAuth('login', true)
    },
}

watch(() => state.struct.code, (val) => {
    // 去除空字符串
    state.struct.code = val?.replace(/\s+/g, '')
})

watch(() => state.item.second, (val) => {
    state.item.loading = val > 0
})

// 组件销毁时清除定时器，防止内存泄漏
onUnmounted(() => {
    if (state.timer) clearInterval(state.timer)
})

// 将子组件方法暴露给父组件
defineExpose({
    show: method.show,
})
</script>