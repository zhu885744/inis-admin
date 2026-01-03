<template>
    <el-dialog v-model="state.item.dialog" class="custom small-dialog" :close-on-click-modal="false" width="500px" max-width="90vw">
        <template #default>
            <div class="container">
                <el-alert type="success" :closable="false" center class="mb-3 box-shadow-light">
                    <template #title>
                        <i-svg name="!" size="15px" color="var(--el-color-success)"></i-svg>
                        <span class="ms-1">账号密码登录</span>
                    </template>
                </el-alert>

                <div class="login-form">
                    <!-- 帐号输入框 -->
                    <div class="form-item mb-3 mt-3">
                        <label class="form-label block mb-1">帐号：</label>
                        <el-input 
                            v-model="state.struct.account" 
                            class="custom" 
                            placeholder="帐号 | 邮箱 | 手机号"
                        ></el-input>
                    </div>
                    <!-- 密码输入框 -->
                    <div class="form-item mb-3" ref="password">
                        <label class="form-label block mb-1">密码：</label>
                        <el-input 
                            v-model="state.struct.password" 
                            @keyup.enter="method.login()" 
                            show-password 
                            class="custom" 
                            placeholder="请输入密码"
                        ></el-input>
                    </div>
                </div>

                <div class="modal-footer d-flex justify-content-center">
                    <el-button @click="method.reset()" class="pointer">忘记密码</el-button>
                    <el-button @click="method.login()" :loading="state.item.wait">
                        {{state.item.wait ? '登录中 ...' : '登  录'}}
                    </el-button>
                    <el-button v-if="parseInt(store.config.getAllowRegister?.value) === 1" @click="method.register()" class="pointer">注册帐号</el-button>
                </div>
                <!-- 第三方登录 
                <div class="d-flex justify-content-center mt-3">
                    <span class="flex-center mx-1">
                        <el-button @click="method.oauth('qq')" round>
                            <i-svg name="qq" size="24px"></i-svg>
                        </el-button>
                    </span>
                    <span class="flex-center mx-1">
                        <el-button round>
                            <i-svg name="github" size="26px"></i-svg>
                        </el-button>
                    </span>
                </div>-->
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
import { reactive, watch, getCurrentInstance, onUnmounted } from 'vue'
import cache from '{src}/utils/cache.js'
import utils from '{src}/utils/utils.js'
import axios from '{src}/utils/request.js'
import crypto from '{src}/utils/crypto.js'
import { useCommStore } from '{src}/store/comm'
import { useConfigStore } from '{src}/store/config'
import ISvg from "{src}/comps/custom/i-svg.vue";

const { ctx, proxy } = getCurrentInstance()
const emit  = defineEmits(['finish'])
const store = {
    comm: useCommStore(),
    config: useConfigStore()
}
const state = reactive({
    item: {
        type: 'login',         // 登录类型固定为账号密码登录
        wait: false,           // 是否等待
        finish :  false,       // 登录完成
        dialog :  false,
        // 移除验证码倒计时相关状态
    },
    struct: {
        account : null,        // 邮箱 | 账号 | 手机号
        password: null,        // 密码
        // 移除验证码相关字段
    },
    timer: null,             // 计时器但不使用
})

const method = {
    // 登录 - 账号密码登录逻辑
    async login() {
        state.item.wait = true

        const unix = await method.unix()
        const iv   = crypto.token(`iv-${unix}` , 16, 'login')
        const key  = crypto.token(`key-${unix}`, 16, 'login')
        const AES  = crypto.AES(key, iv)

        // 固定使用账号密码登录参数
        const params = {
            account : AES.encrypt(state.struct.account),
            password: AES.encrypt(state.struct.password)
        }

        try {
            const { data, code, msg } = await axios.post('/api/comm/' + state.item.type, params, {
                headers: {
                    'X-Khronos': unix,
                    'X-Gorgon' : `${key} ${iv}`,
                    'X-Argus'  : AES.encrypt(JSON.stringify({
                        unix, account: state.struct.account, password: state.struct.password
                    }))
                }
            })

            state.item.wait = false

            if (code === 200) {
                // 冻结状态判断逻辑
                const userData = data?.user || {}
                const userStatus = Number(userData.status) || 0
                if (userStatus === 1) {
                    method.clearCache()
                    ElMessage.error('当前账号已被冻结，请联系管理员！')
                    method.animation()
                    return
                }

                // 正常登录流程
                cache.set('user-info', data.user, 10)
                utils.set.cookie(globalThis?.inis?.token_name || 'INIS_LOGIN_TOKEN', data.token, 7 * 24 * 60 * 60)
                state.item.finish = true
                state.item.dialog = false
                // 更新仓库状态
                store.comm.login.finish = true
                store.comm.login.user   = data.user
                store.comm.switchAuth('login', false)
                // 通知父组件
                emit('finish', data.user)
                ElMessage.success('登录成功')
                return
            }
            if (code === 201) return ElMessage.info(msg)

            // 水平抖动动画
            method.animation()

            ElMessage.error(msg)
            method.clearCache()

        } catch (error) {
            ElMessage.error(error.message || '登录失败')
            method.clearCache()
            state.item.wait = false
        }
    },

    // 显示对话框
    show: () => (state.item.dialog = true),
    // 点击注册
    register: () => {
        store.comm.switchAuth('register', true)
    },
    // 点击忘记密码
    reset: () => {
        store.comm.switchAuth('reset', true)
    },
    // 动画
    animation: () => {
        // 密码框的动画
        const el = proxy.$refs.password
        if (el) {
            el.classList.add('active', 'shake-horizontal')
            setTimeout(() => {
                el.classList.remove('active', 'shake-horizontal')
            }, 1000)
        }
    },
    // 清除缓存
    clearCache: () => {
        utils.set.cookie(globalThis?.inis?.token_name || 'INIS_LOGIN_TOKEN', '', -1)
    },
    // 获取当前时间戳
    unix: async () => {
        const { code, data } = await axios.get('/dev/info/time')
        if (code !== 200) return Math.round(new Date() / 1000)
        return data.unix
    },
    // 三方授权登录
    oauth: (target = 'qq') => {
        window.open(`/api/oauth/${target}?key=inis`, "oauth", "width=800,height=500,top=100,left=100")
    }
}

// 组件卸载时清除计时器
onUnmounted(() => {
    if (state.timer) {
        clearInterval(state.timer)
    }
})

// 将子组件方法暴露给父组件
defineExpose({
    show: method.show,
})
</script>