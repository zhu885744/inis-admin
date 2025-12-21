<template>
    <el-dialog v-model="state.item.dialog" class="custom small-dialog" :close-on-click-modal="false"width="500px"max-width="90vw">
        <template #default>
            <div class="container">
                <el-alert type="success" :closable="false" center class="mb-3 box-shadow-light">
                    <template #title>
                        <i-svg name="!" size="15px" color="var(--el-color-success)"></i-svg>
                        <span class="ms-1">忘记密码</span>
                    </template>
                </el-alert>

                <!-- 账号输入项 -->
                <div class="form-item mb-3">
                    <label class="form-label block mb-1">
                        <el-tooltip content="（必须）注册时候的账号" placement="top">
                            <span>
                                <i-svg color="rgb(var(--icon-color))" name="hint" size="14px"></i-svg>
                                <span class="ms-1">账号：</span>
                            </span>
                        </el-tooltip>
                    </label>
                    <el-input 
                        v-model="state.struct.account" 
                        class="custom-input" 
                        placeholder="请输入账号"
                        clearable
                    ></el-input>
                </div>

                <!-- 联系方式输入项 -->
                <div class="form-item mb-3">
                    <label class="form-label block mb-1">
                        <el-tooltip content="可以是邮箱或者手机号，用于找回密码或验证码登录等" placement="top">
                            <span>
                                <i-svg color="rgb(var(--icon-color))" name="hint" size="14px"></i-svg>
                                <span class="ms-1">联系方式：</span>
                            </span>
                        </el-tooltip>
                    </label>
                    <el-input 
                        v-model="state.struct.social" 
                        class="custom-input" 
                        placeholder="电子邮箱或手机号"
                        clearable
                    ></el-input>
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
                    <el-input 
                        v-model="state.struct.code" 
                        class="custom-input" 
                        placeholder="请输入验证码"
                        clearable
                    >
                        <template #suffix>
                            <el-button 
                                @click="method.code()" 
                                :loading="state.item.loading"
                                :disabled="state.item.loading"
                            >
                                {{ state.item.loading ? `${state.item.second} s` : '获取' }}
                            </el-button>
                        </template>
                    </el-input>
                </div>

                <!-- 新密码输入项 -->
                <div class="form-item mb-3">
                    <label class="form-label block mb-1 required">
                        <el-tooltip content="重置之后的新密码" placement="top">
                            <span>
                                <i-svg color="rgb(var(--icon-color))" name="hint" size="14px"></i-svg>
                                <span class="ms-1">新的密码：</span>
                            </span>
                        </el-tooltip>
                    </label>
                    <el-input 
                        v-model="state.password.value" 
                        show-password 
                        class="custom-input" 
                        placeholder="请输入新密码（至少6位）"
                        clearable
                    ></el-input>
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
                    <el-input 
                        v-model="state.password.verify" 
                        show-password 
                        class="custom-input" 
                        placeholder="请再次输入新密码"
                        clearable
                    ></el-input>
                </div>
            </div>
        </template>

        <template #footer>
            <div class="modal-footer d-flex justify-content-center">
                <el-button @click="method.login()">
                    记起来了？点我登录
                </el-button>
                <el-button 
                    type="primary" 
                    @click="method.reset()" 
                    :loading="state.item.wait"
                >
                    {{state.item.wait ? '重置中 ...' : '重置密码'}}
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
import { reactive, watch, onUnmounted, getCurrentInstance } from 'vue'
import utils from '{src}/utils/utils.js'
import notyf from '{src}/utils/notyf.js'
import axios from '{src}/utils/request.js'
import { useCommStore } from '{src}/store/comm'

const { ctx, proxy } = getCurrentInstance()
const emit  = defineEmits(['finish'])
const store = {
    comm: useCommStore()
}

const state = reactive({
    item: {
        loading:  false,        // 是否加载中
        dialog :  false,
        wait: false,
        second: 0,
    },
    struct: {
        social:   null,         // 联系方式
        account : null,         // 账号
        code:     null,         // 验证码
    },
    password: {
        value: null,
        verify: null,
    },
    timer: null,
})

const method = {
    // 重置密码
    reset: async () => {
        // 基础校验
        const { account, social, code } = state.struct
        const { value: pwd, verify: pwdVerify } = state.password

        if (utils.is.empty(account) && utils.is.empty(social)) {
            return notyf.warn('账号或联系方式二选一！')
        }
        if (utils.is.empty(pwd)) return notyf.warn('请输入新密码！')
        if (pwd.length < 6) return notyf.warn('密码长度至少6位！')
        if (utils.is.empty(pwdVerify)) return notyf.warn('请再次输入密码！')
        if (utils.is.empty(code)) return notyf.warn('请输入验证码！')
        if (pwd !== pwdVerify) return notyf.warn('两次输入的密码不一致！')

        // 联系方式格式校验
        if (social) {
            const isPhone = /^1[3-9]\d{9}$/.test(social)
            const isEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(social)
            if (!isPhone && !isEmail) {
                return notyf.warn('联系方式请填写正确的手机号或邮箱！')
            }
        }

        try {
            state.item.wait = true
            // 调用重置密码接口
            const { code: resCode, msg } = await axios.post('/api/comm/reset-password', {
                ...state.struct, 
                password: pwd
            })

            state.item.wait = false

            if (resCode !== 200) throw new Error(msg || '重置密码失败！')

            notyf.success('重置成功！')
            state.item.dialog = false
            emit('finish')

        } catch (error) {
            state.item.wait = false
            notyf.error(error.message || '网络异常，请稍后再试！')
        }
    },

    // 获取验证码
    code: async () => {
        // 基础校验
        const { account, social } = state.struct
        if (utils.is.empty(account) && utils.is.empty(social)) {
            return notyf.warn('账号或联系方式二选一！')
        }

        // 联系方式格式校验
        if (social) {
            const isPhone = /^1[3-9]\d{9}$/.test(social)
            const isEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(social)
            if (!isPhone && !isEmail) {
                return notyf.warn('联系方式请填写正确的手机号或邮箱！')
            }
        }

        try {
            state.item.loading = true
            // 拆分验证码接口（避免与重置密码复用）
            const { code: resCode, msg } = await axios.post('/api/comm/send-reset-code', {
                social,
                account
            })

            if (!utils.in.array(resCode, [200, 201])) throw new Error(msg || '发送验证码失败！')

            notyf.success(msg || '验证码发送成功！')

            // 安全管理定时器
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
            state.item.loading = false
            notyf.error(error.message || '网络异常，验证码发送失败！')
        }
    },

    // 显示对话框
    show: () => (state.item.dialog = true),

    // 切换到登录
    login: () => {
        store.comm.switchAuth('login', true)
    },
}

// 监听验证码输入（去空格）
watch(() => state.struct.code, (val) => {
    state.struct.code = val?.replace(/\s+/g, '') || ''
})

// 监听倒计时状态
watch(() => state.item.second, (val) => {
    state.item.loading = val > 0
})

// 组件销毁时清除定时器（防止内存泄漏）
onUnmounted(() => {
    if (state.timer) clearInterval(state.timer)
})

// 暴露方法给父组件
defineExpose({
    show: method.show,
})
</script>