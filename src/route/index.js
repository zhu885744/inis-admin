import cache from '{src}/utils/cache'
import utils from '{src}/utils/utils'
import notyf from '{src}/utils/notyf'
import axios from '{src}/utils/request'
import { useCommStore } from '{src}/store/comm'
import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'

// 安装引导
const install = {
    name: 'install',
    path: '/install',
    component: () => import('{src}/views/install/layout/base.vue'),
    meta: { title: '安装引导' },
    children: [{
        path: '/',
        name: 'install-index',
        meta: { title: '安装引导' },
    }],
}

// 前台路由
const index = {
    path: '/',
    component: () => import('{src}/views/index/layout/base.vue'),
    children: [{
        path: '/',
        name: 'index-home',
        meta: { title: '首页' },
        component: () => import('{src}/views/index/pages/index.vue'),
    },{
        path: '/account/home',
        name: 'index-account-home',
        meta: { title: '用户中心' },
        component: () => import('{src}/views/index/pages/account-home.vue'),
    },{
        path: '/oauth/:token',
        name: 'index-oauth',
        meta: { title: '三方登录' },
        component: () => import('{src}/views/index/pages/oauth.vue'),
    },{
        path: '/icons',
        name: 'index-icons',
        meta: { title: '图标' },
        component: () => import('{src}/views/index/pages/icons.vue'),
    }],
}

// 后台路由
const admin = {
    name: 'admin',
    path: '/admin',
    component: () => import('{src}/views/admin/layout/base.vue'),
    children: [{
        path: /index|admin/,
        name: 'admin-home',
        meta: { title: '控制台', auth: false },
        component: () => import('{src}/views/admin/pages/index.vue'),
    },{
        path: '/admin/users',
        name: 'admin-users',
        meta: { title: '用户管理' },
        component: () => import('{src}/views/admin/pages/users.vue'),
    },{
        path: '/admin/banner',
        name: 'admin-banner',
        meta: { title: '轮播管理' },
        component: () => import('{src}/views/admin/pages/banner.vue'),
    },{
        path: '/admin/links',
        name: 'admin-links',
        meta: { title: '友链管理' },
        component: () => import('{src}/views/admin/pages/links.vue'),
    },{
        path: '/admin/tags',
        name: 'admin-tags',
        meta: { title: '标签管理' },
        component: () => import('{src}/views/admin/pages/tags.vue'),
    },{
        path: '/admin/placard',
        name: 'admin-placard',
        meta: { title: '公告管理' },
        component: () => import('{src}/views/admin/pages/placard.vue'),
    },{
        path: '/admin/level',
        name: 'admin-level',
        meta: { title: '等级管理' },
        component: () => import('{src}/views/admin/pages/level.vue'),
    },{
        path: '/admin/comment',
        name: 'admin-comment',
        meta: { title: '评论管理' },
        component: () => import('{src}/views/admin/pages/comment.vue'),
    },{
        path: '/admin/article',
        name: 'admin-article',
        meta: { title: '文章列表' },
        component: () => import('{src}/views/admin/pages/article.vue'),
    },{
        path: '/admin/article/write/:id(\\d+)?',
        name: 'admin-article-write',
        meta: { title: '撰写文章' },
        component: () => import('{src}/views/admin/pages/article-write[id].vue'),
    },{
        path: '/admin/article/group',
        name: 'admin-article-group',
        meta: { title: '文章分组' },
        component: () => import('{src}/views/admin/pages/article-group.vue'),
    },{
        path: '/admin/pages',
        name: 'admin-pages',
        meta: { title: '页面列表' },
        component: () => import('{src}/views/admin/pages/pages.vue'),
    },{
        path: '/admin/pages/write/:id(\\d+)?',
        name: 'admin-pages-write',
        meta: { title: '撰写页面' },
        component: () => import('{src}/views/admin/pages/pages-write[id].vue'),
    },{
        path: '/admin/links/group',
        name: 'admin-links-group',
        meta: { title: '友链分组' },
        component: () => import('{src}/views/admin/pages/links-group.vue'),
    },{
        path: '/admin/auth/rules',
        name: 'admin-auth-rules',
        meta: { title: '权限规则' },
        component: () => import('{src}/views/admin/pages/auth-rules.vue'),
    },{
        path: '/admin/auth/group',
        name: 'admin-auth-group',
        meta: { title: '权限分组' },
        component: () => import('{src}/views/admin/pages/auth-group.vue'),
    },{
        path: '/admin/auth/pages',
        name: 'admin-auth-pages',
        meta: { title: '页面权限' },
        component: () => import('{src}/views/admin/pages/auth-pages.vue'),
    },{
        path: '/admin/api/keys',
        name: 'admin-api-keys',
        meta: { title: '接口密钥' },
        component: () => import('{src}/views/admin/pages/api-keys.vue'),
    },{
        path: '/admin/system',
        name: 'admin-system',
        meta: { title: '系统配置' },
        component: () => import('{src}/views/admin/pages/system.vue'),
    },{
        path: '/admin/ip/black',
        name: 'admin-ip-black',
        meta: { title: 'IP黑名单' },
        component: () => import('{src}/views/admin/pages/ip-black.vue'),
    },{
        path: '/admin/qps/warn',
        name: 'admin-qps-warn',
        meta: { title: 'QPS预警' },
        component: () => import('{src}/views/admin/pages/qps-warn.vue'),
    },{
        path: '/admin/badge',
        name: 'admin-badge',
        meta: { title: '徽章管理' },
        component: () => import('{src}/views/admin/pages/badge.vue'),
    }],
}

const routes = [ index, install, admin, {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('{src}/views/error.vue'),
}]

const base = '/'
const mode = 'hash'
const route = createRouter({
    routes, 
    history: mode === 'history' ? createWebHistory(base) : createWebHashHistory(base)
})

// 路由守卫
route.beforeEach(async (to, from, next) => {
    // 设置页面标题
    if (to.meta?.title) document.title = to.meta.title

    // 登录状态无效处理
    const invalid = async (params = { path: '/' }) => {
        cache.del('user-info')
        const { code } = await axios.del('/api/comm/logout')
        if (code !== 200) {
            cache.del('user-info')
            utils.clear.cookie(globalThis?.inis?.token_name || 'INIS_LOGIN_TOKEN')
        }
        next(params)
    }

    // 安装引导路由校验
    if (to.path.indexOf('/install') === 0) {
        const { code, msg } = await axios.get('/dev/install/check')
        if (code !== 200) {
            next('/')
            return notyf.error(msg)
        }
        next()
    }

    // 后台路由校验
    else if (to.path.indexOf('/admin') === 0) {
        const cacheName = 'check-token'

        // 校验登录状态
        if (!cache.has(cacheName)) {
            const { code } = await axios.post('/api/comm/check-token')
            if (code !== 200) return invalid()
            // 缓存登录状态10分钟
            cache.set(cacheName, true, inis.cache)
        }

        useCommStore().nav.title = to.meta.title
        next()
    }

    // 其他路由直接放行
    else {
        next()
    }
})

export default route