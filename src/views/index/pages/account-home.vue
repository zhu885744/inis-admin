<template>
    <div id="account-home" class="container-fluid container-box px-2">
        <!-- 加载状态 -->
        <el-loading v-if="state.loading" fullscreen text="加载中..."></el-loading>
        
        <div class="card mb-3">
            <div class="card-body">
                <div class="row">
                    <div class="col-md-8">
                        <div class="row align-items-center">
                            <div class="col-auto">
                                <el-avatar :src="state.user?.avatar" :size="70" fit="cover" size="large" class="avatar-shadow mirror-scan"></el-avatar>
                            </div>
                            <div class="col">
                                <span class="mb-0 d-flex align-items-center">
                                    <span class="font-18">{{ state.user?.nickname }}</span>
                                    <small class="badge-outline-info rounded-pill item right px-2 font-12 radius-10 d-flex align-items-center ms-2">
                                        <i-svg v-if="!utils.is.empty(store.comm.getLogin.user?.gender)" :name="store.comm.getLogin.user?.gender" size="18px" class="me-1"></i-svg>
                                        <span class="fw-bold">Lv.{{ store.comm.getLogin.user.result.level.current.value }}</span>
                                    </small>
                                </span>
                                <el-progress :percentage="((state.user?.exp / state.user?.result?.level?.next?.exp || 1) * 100).toFixed(2)" color="rgb(var(--assist-color))" style="width: 200px" class="mb-1"></el-progress>
                                <p class="mb-1">{{ state.user?.description }}</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 d-flex justify-content-end">
                        <el-button v-on:click="method.edit.show()" type="primary" class="shadow">修改资料</el-button>
                    </div>
                </div>
            </div>
        </div>

        <el-card class="d-flex justify-content-between mb-3">
            <div>积分：<span class="font-16 fw-bolder">{{ state.user?.points || 0 }}</span></div>
            <div>余额：<span class="font-16 fw-bolder">{{ state.user?.currency || 0 }}</span></div>
            <div>等级：<span class="font-16 fw-bolder">Lv.{{ store.comm.getLogin.user.result.level.current.value }}</span></div>
            <div>经验：<span class="font-16 fw-bolder">{{ state.user?.exp || 0 }} / {{ state.user?.result?.level?.next?.exp || 0 }}</span></div>
            <div>距离下一级还需「{{ state.user?.result?.level?.next?.exp - state.user?.exp || 0 }}」经验</div>
        </el-card>

        <el-card class="mb-3">
            <div class="mb-3">完成以下每日任务，可以获得对应的经验值</div>
            <el-table :data="state.item.rules" stripe style="width: 100%" class="custom simple">
                <el-table-column prop="name" label="名称"></el-table-column>
                <el-table-column prop="exp" label="经验值">
                    <template #default="scope">
                        +{{ scope.row.exp }}
                    </template>
                </el-table-column>
                <el-table-column prop="count" label="次/日"></el-table-column>
            </el-table>
        </el-card>

        <el-tabs v-model="state.item.tabs" type="border-card">
            <el-tab-pane name="info">
                <template #label>
                    <span class="fw-bolder font-12">基本信息</span>
                </template>
                <div>
                    <i-row-text title="昵称" :value="state.user?.nickname"></i-row-text>
                    <i-row-text title="头衔" :value="state.user?.title"></i-row-text>
                    <i-row-text title="性别">
                        <template #value>
                            <span v-if="utils.is.empty(state.user?.gender)">保密</span>
                            <span v-else>
                                {{ state.user?.gender === 'boy' ? '男' : '女' }}
                            </span>
                        </template>
                    </i-row-text>
                    <i-row-text title="简介" :value="state.user?.description"></i-row-text>
                    <i-row-text title="注册" :value="utils.time.nature(state.user?.create_time)"></i-row-text>
                </div>
            </el-tab-pane>

            <el-tab-pane name="account">
                <template #label>
                    <span class="fw-bolder font-12">账号设置</span>
                </template>
                <div>
                    <user-edit-account  v-model="state.item.edit" v-on:finish="method.edit.finish" v-on:edit="method.edit.click"></user-edit-account>
                    <user-edit-email    v-model="state.item.edit" v-on:finish="method.edit.finish" v-on:edit="method.edit.click"></user-edit-email>
                    <user-edit-phone    v-model="state.item.edit" v-on:finish="method.edit.finish" v-on:edit="method.edit.click"></user-edit-phone>
                    <user-edit-password v-model="state.item.edit" v-on:finish="method.edit.finish" v-on:edit="method.edit.click"></user-edit-password>
                </div>
            </el-tab-pane>
        </el-tabs>
    </div>

    <user-edit-info ref="info" v-on:finish="method.edit.finish"></user-edit-info>
</template>

<script setup>
import cache from '{src}/utils/cache'
import utils from '{src}/utils/utils'
import { useCommStore } from '{src}/store/comm'
import { useWalletStore } from '{src}/store/wallet'
import iRowText from '{src}/comps/custom/i-row-text.vue'
import UserEditInfo from '{src}/comps/index/user/edit-info.vue'
import UserEditAccount from '{src}/comps/index/user/edit-account.vue'
import UserEditEmail from '{src}/comps/index/user/edit-email.vue'
import UserEditPhone from '{src}/comps/index/user/edit-phone.vue'
import UserEditPassword from '{src}/comps/index/user/edit-password.vue'
import { ElLoading } from 'element-plus'

const { ctx, proxy } = getCurrentInstance()
const store  = {
    comm: useCommStore(),
    wallet: useWalletStore(),
}
const state  = reactive({
    loading: false,
    user: cache.get('user-info') || {},
    item: {
        tabs: 'info',
        edit: null,
        month: null,
        rules: [{
            name: '签到',
            exp: 10,
            count: 1,
        },{
            name: '登录',
            exp: 5,
            count: 1,
        },{
            name: '点赞',
            exp: 1,
            count: 10,
        },{
            name: '收藏',
            exp: 1,
            count: 10,
        },{
            name: '访问',
            exp: 1,
            count: 10,
        },{
            name: '分享',
            exp: 1,
            count: 10,
        },{
            name: '评论',
            exp: 1,
            count: 10,
        }]
    },
    wallet: {
        show: false,
        struct: {
            money: 0,
            compute: 0,
        }
    }
})

// 方法
const method = {
    // 修改资料
    edit: {
        show: () => proxy.$refs['info'].show(),
        finish: params => {
            if (utils.is.empty(params)) return
            state.user = params
            // 保存到缓存
            cache.set('user-info', params)
        },
        click: params => (state.item.edit = params),
    },
    // 刷新页面数据
    refresh: async () => {
        state.loading = true
        try {
            // 模拟重新获取用户信息
            await new Promise(resolve => setTimeout(resolve, 800))
            // 实际项目中这里可以调用接口重新获取用户信息
            const freshUser = cache.get('user-info') || {}
            state.user = freshUser
            ElMessage.success('刷新成功')
        } catch (error) {
            ElMessage.error('刷新失败')
            console.error(error)
        } finally {
            state.loading = false
        }
    }
}
</script>