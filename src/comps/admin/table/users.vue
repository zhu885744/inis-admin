<template>
    <i-table :opts="state.opts" ref="i-table">

        <template #start>
            <el-table-column type="selection" width="55"></el-table-column>
        </template>

        <template v-if="props.type === 'all'" #end>
            <el-table-column :fixed="right" label="操作" width="100" class-name="text-end">
                <template #default="scope">
                    <span class="d-flex justify-content-end">
                        <el-button v-on:click="method.edit(scope.row)" class="custom" size="small">
                            <i-svg color="rgb(var(--icon-color))" name="edit" size="16px"></i-svg>
                        </el-button>
                        <el-button v-on:click="method.delete(scope.row.id, true)" size="small" class="ms-0">
                            <i-svg color="rgb(var(--icon-color))" name="delete" size="21px"></i-svg>
                        </el-button>
                    </span>
                </template>
            </el-table-column>
        </template>
        <template v-if="props.type === 'remove'" #end>
            <el-table-column :fixed="right" label="操作" width="160" class-name="text-end">
                <template #default="scope">
                    <span class="d-flex justify-content-end">
                        <el-button v-on:click="method.restore(scope.row.id)" class="custom" size="small">
                            <i-svg color="rgb(var(--icon-color))" name="restore" size="16px"></i-svg>
                        </el-button>
                        <el-button v-on:click="method.edit(scope.row)" size="small" class="ms-0">
                            <i-svg color="rgb(var(--icon-color))" name="edit" size="16px"></i-svg>
                        </el-button>
                        <el-button v-on:click="method.delete(scope.row.id, false)" size="small" class="ms-0">
                            <i-svg color="rgb(var(--icon-color))" name="delete" size="21px"></i-svg>
                        </el-button>
                    </span>
                </template>
            </el-table-column>
        </template>

        <template #i-nickname="{ scope = {} }">
            <span v-on:dblclick="method.edit(scope)" class="d-flex align-items-center">
                <el-tooltip :disabled="utils.is.empty(scope.description)" placement="top">
                    <template #content>
                        <span v-html="method.autoWrap(scope.nickname + '：' + scope.description)"></span>
                    </template>
                    <el-avatar shape="square" :src="method.imageSize(scope?.avatar)" size="small" class="me-1"></el-avatar>
                </el-tooltip>
                <el-tooltip v-if="!utils.is.empty(scope.url)" :content="`链接：${scope.url}`" placement="top">
                    <i-svg color="rgb(var(--icon-color))" v-on:click="method.window(scope.url)" name="link" size="12px" class="me-1"></i-svg>
                </el-tooltip>
                <el-tooltip :content="scope.nickname" :disabled="utils.is.empty(scope.nickname)" placement="top">
                    <span>{{ method.omit(scope?.nickname, 4, ' ...', 'end') }}</span>
                </el-tooltip>
            </span>
        </template>

        <template #i-account="{ scope = {} }">
            <el-tooltip :content="'双击复制：' + scope?.account" :disabled="utils.is.empty(scope?.account)" placement="top">
                <span v-on:dblclick="method.copy(scope?.account, '复制成功！')">
                    {{ method.omit(scope?.account) }}
                </span>
            </el-tooltip>
        </template>

        <template #i-email="{ scope = {} }">
            <el-tooltip :content="'双击复制：' + scope?.email" :disabled="utils.is.empty(scope?.email)" placement="top">
                <span v-on:dblclick="method.copy(scope?.email, '复制成功！')">
                    {{ method.omit(scope?.email, 9) }}
                </span>
            </el-tooltip>
        </template>

        <template #i-phone="{ scope = {} }">
            <el-tooltip :content="'双击复制：' + scope?.phone" :disabled="utils.is.empty(scope?.phone)" placement="top">
                <span v-on:dblclick="method.copy(scope?.phone, '复制成功！')">
                    {{ method.omit(scope?.phone, 7, '***') }}
                </span>
            </el-tooltip>
        </template>

        <template #i-login_time="{ scope = { login_time: 0 } }">
            <span v-if="scope?.login_time === 0">从未登录</span>
            <span v-else>{{ utils.time.nature(scope?.login_time) }}</span>
        </template>

        <template #i-remark="{ scope = {} }">
            <el-tooltip :disabled="utils.is.empty(scope.remark)" placement="top">
                <template #content>
                    <span v-html="method.autoWrap(scope.remark)"></span>
                </template>
                <span v-on:dblclick="method.copy(scope.remark, '复制成功！')">
                    {{ method.omit(scope?.remark) }}
                </span>
            </el-tooltip>
        </template>

    </i-table>

    <el-dialog v-model="state.item.dialog" class="custom" draggable :close-on-click-modal="false">
        <template #header>
            <strong class="flex-center">{{ utils.is.empty(state.struct.id) ? '添 加' : '编 辑' }} 用 户</strong>
        </template>
        <template #default>
            <div class="row">
                <div class="col-md-3">
                    <div class="form-group mb-3">
                        <label class="form-label">
                            <el-tooltip content="这位兄dei叫什么？" placement="top">
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
                        <label class="form-label required">
                            <el-tooltip content="（必须）可用于账密登录" placement="top">
                                <span>
                                    <i-svg color="rgb(var(--icon-color))" name="hint" size="14px"></i-svg>
                                    <span class="ms-1">账号：</span>
                                </span>
                            </el-tooltip>
                        </label>
                        <el-input v-model="state.struct.account"></el-input>
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
                        <div class="input-with-button">
                            <el-input v-model="state.struct.avatar" class="custom" placeholder="填写图片地址或点击上传图片"></el-input>
                            <el-button @click="method.upload('avatar')" :loading="state.item.upload"class="upload-btn">
                                <i-svg v-if="!state.item.upload" name="upload" color="rgb(var(--icon-color))" size="14px"></i-svg>
                                <span class="ms-1">上传</span>
                            </el-button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-4">
                    <div class="form-group mb-3">
                        <label class="form-label required">
                            <el-tooltip content="（必须）可用于邮箱验证码登录" placement="top">
                                <span>
                                    <i-svg color="rgb(var(--icon-color))" name="hint" size="14px"></i-svg>
                                    <span class="ms-1">邮箱：</span>
                                </span>
                            </el-tooltip>
                        </label>
                        <el-input v-model="state.struct.email"></el-input>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="form-group mb-3">
                        <label class="form-label">
                            <el-tooltip content="可用于手机验证码登录" placement="top">
                                <span>
                                    <i-svg color="rgb(var(--icon-color))" name="hint" size="14px"></i-svg>
                                    <span class="ms-1">手机：</span>
                                </span>
                            </el-tooltip>
                        </label>
                        <el-input v-model="state.struct.phone"></el-input>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="form-group mb-3">
                        <label class="form-label">
                            <el-tooltip content="为空不修改，反之修改密码" placement="top">
                                <span>
                                    <i-svg color="rgb(var(--icon-color))" name="hint" size="14px"></i-svg>
                                    <span class="ms-1">密码：</span>
                                </span>
                            </el-tooltip>
                        </label>
                        <el-input v-model="state.struct.password" placeholder="为空不修改密码"></el-input>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-4">
                    <div class="form-group mb-3">
                        <label class="form-label">
                            <el-tooltip content="为该用户分配权限，默认只有公共权限" placement="top">
                                <span>
                                    <i-svg color="rgb(var(--icon-color))" name="hint" size="14px"></i-svg>
                                    <span class="ms-1">权限：</span>
                                </span>
                            </el-tooltip>
                        </label>
                        <el-select v-model="state.struct.result.auth.group.ids" multiple collapse-tags placeholder="请选择权限" class="d-block custom font-13">
                            <el-option v-for="item in state.select.auth_group" :key="item.value" :label="item.label" :value="item.value">
                                <span class="font-13">{{ item.label }}</span>
                            </el-option>
                        </el-select>
                    </div>
                </div>
                <div class="col-md-4">
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
                <div class="col-md-4">
                    <div class="form-group mb-3">
                        <label class="form-label">
                            <el-tooltip content="为这个用户设置一个专属的头衔，彰显与众不同" placement="top">
                                <span>
                                    <i-svg color="rgb(var(--icon-color))" name="hint" size="14px"></i-svg>
                                    <span class="ms-1">专属头衔：</span>
                                </span>
                            </el-tooltip>
                        </label>
                        <el-input v-model="state.struct.title" placeholder="独领风骚"></el-input>
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
            <div class="row">
                <div class="col-lg-12">
                    <div class="form-group mb-3">
                        <label class="form-label">
                            <el-tooltip content="备注而已，页面上不会显示此项" placement="top">
                                <span>
                                    <i-svg color="rgb(var(--icon-color))" name="hint" size="14px"></i-svg>
                                    <span class="ms-1">备注：</span>
                                </span>
                            </el-tooltip>
                        </label>
                        <el-input v-model="state.struct.remark" :autosize="{ minRows: 3, maxRows: 10 }" placeholder="备注一下，避免忘记！" type="textarea"></el-input>
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
import utils from '{src}/utils/utils.js'
import notyf from '{src}/utils/notyf.js'
import axios from '{src}/utils/request.js'
import ITable from '{src}/comps/custom/i-table.vue'

const emit  = defineEmits(['refresh','update:init'])
const props = defineProps({
    type: {
        type: String,
        default: 'all',
    },
    params: {
        type: Object,
        default: () => ({
            order: 'id asc',
        }),
    },
    init: {
        type: Boolean,
        default: false,
    }
})

// table - fixed
const left = computed(() => {
    let result = 'left'
    if (utils.is.mobile()) result = false
    return result
})
// table - fixed
const right = computed(() => {
    let result = 'right'
    if (utils.is.mobile()) result = false
    return result
})

const { ctx, proxy } = getCurrentInstance()
const state  = reactive({
    item: {
        table: 'users',
        dialog: false,
        upload: false,
        wait: false,
    },
    struct: {
        remark: null,
        result: {
            auth: {
                all: false,
                root: false,
                group: {
                    ids: [],
                    list: [],
                },
            }
        }
    },
    opts: {
        url: '/api/users/all',
        params: props.params,
        columns: [
            { prop: 'nickname',label: '昵称', width: 130, slot: true, fixed: left },
            { prop: 'account', label: '账号', width: 130, slot: true },
            { prop: 'email',   label: '邮箱', width: 120, slot: true },
            { prop: 'phone',   label: '电话', width: 120, slot: true },
            { prop: 'remark' , label: '备注', width: 150, slot: true },
            { prop: 'login_time', label: '最近登录', width: 140, sortable: true, slot: true },
            { prop: 'create_time', label: '创建时间', width: 140, sortable: true },
        ],
    },
    // 下拉框
    select: {
        auth_group: [],
        gender: [
            { value: null, label: '保密'},
            { value: 'boy', label: '男' },
            { value: 'girl', label: '女' },
        ]
    },
})

const method = {
    // 刷新数据
    init: async () => {
        state.struct = {
            remark: null,
            result: {
                auth: {
                    all: false,
                    root: false,
                    group: {
                        ids: [],
                        list: [],
                    },
                }
            }
        }
        // 重新加载数据
        await proxy.$refs['i-table']['init']()
    },
    // 获取权限分组
    async authGroup() {
        const { code, data } = await axios.get('/api/auth-group/column',{
            field: 'id,name'
        })
        if (code !== 200) return
        state.select.auth_group = data.map(item => ({ value: item.id, label: item.name }))
    },
    // 更新用户权限
    async updateAuthGroup(uid = null, ids = []) {
        if (utils.is.empty(uid)) return
        const { code, msg } = await axios.put('/api/auth-group/uids', { uid, ids })
        if (code !== 200) return notyf.error(msg)
    },
    // 保存数据
    save: async (params = state.struct || {}) => {

        if (utils.is.empty(params))          return notyf.warn('你在想什么？什么都不填！')
        if (utils.is.empty(params?.account)) return notyf.warn('账号还是要设置的！')
        if (!utils.is.empty(params?.email))  if (!utils.is.email(params?.email)) return notyf.warn('邮箱格式不正确！')
        if (!utils.is.empty(params?.phone))  if (!utils.is.phone(params?.phone)) return notyf.warn('手机号格式不正确！')

        state.item.wait           = true

        const { code, msg, data } = await axios.post(`/api/${state.item.table}/save`, params)

        state.item.wait           = false

        if (code !== 200) return notyf.error(msg)

        // 关闭对话框
        state.item.dialog = false
        // 重新加载数据
        await method.init()
        // 更新用户权限
        await method.updateAuthGroup(data.id, params.result.auth.group.ids)
    },
    // 编辑数据
    edit: struct => {
        state.struct = struct
        state.item.dialog = true
    },
    // 显示盒子
    show: () => {
        method.init()
        state.item.dialog = true
    },
     // 真删 和 软删
    async delete(ids = [], isSoft = true) {

        if (utils.is.empty(ids)) return

        // 拼接服务地址
        const uri = `/api/${state.item.table}/${isSoft ? 'remove' : 'delete'}`

        const { code, msg } = await axios.del(uri, { ids })

        if (code !== 200) return notyf.error(msg)

        // 刷新回收站数据
        emit('refresh', 'remove')

        // 重新加载数据
        await method.init()
    },
    // 恢复数据
    async restore(ids = []) {

        if (utils.is.empty(ids)) return

        const { code, msg } = await axios.put(`/api/${state.item.table}/restore`, { ids })

        if (code !== 200) return notyf.error(msg)

        // 刷新全部数据
        emit('refresh', 'all')

        // 重新加载数据
        await method.init()
    },
    // 上传
    async upload(field = 'image') {

        // 创建一个 input
        const input  = document.createElement('input')
        input.type   = 'file'
        input.accept = 'image/*'

        // 监听 input 的 change 事件
        input.addEventListener('change', async () => {
            // 创建一个 formData
            const params = new FormData
            params.append('file', input.files[0])

            state.item.upload         = true

            // 上传图片
            const { code, msg, data } = await axios.post('/api/file/upload', params)

            state.item.upload         = false

            if (code !== 200) return notyf.error(msg)
            // 设置图片
            state.struct[field] = data.path
            // 清空 input
            input.value = ''
            notyf.info('上传成功！')
        })

        // 触发 input 的 click 事件
        input.click()
    },
    // 打开新窗口
    window(url = null, target = '_blank'){
        if (utils.is.empty(url)) return
        // 新窗口打开
        globalThis.open(url, target)
    },
    // 图片大小
    imageSize(url = '', size = '50x50') {
        // 判断 url 是否为空
        if (utils.is.empty(url)) return url
        // 返回新的 url
        return url.includes('?') ? `${url}&size=${size}` : `${url}?size=${size}`
    },
    // 自动换行
    autoWrap(text = '', length = 40, symbol = '<br>') {
        // 判断 text 是否为空
        if (utils.is.empty(text)) return text
        // 每隔 length 个字符添加一个换行符
        return text.replace(new RegExp(`(.{${length}})`, 'g'), `$1${symbol}`)
    },
    // 复制文本
    copy  : (text = null, msg = '复制成功！') => {

        if (utils.is.empty(text)) return

        utils.set.copy.text(text)

        if (!utils.is.empty(msg)) return notyf.info(msg)
    },
    // 省略文本
    omit  : (text = null, length = 10, omission = ' ... ', location = 'center') => {
        if (utils.is.empty(text)) return '-'
        return utils.string.omit(text, length, omission, location)
    },
}

onMounted(async () => {
    await method.authGroup()
    if (props.init) await method.init()
})

watch(() => props.init, (val) => {
    if (val) method.init()
})

// 监听对话框状态
watch(() => state.item.dialog, (value) => {
    // 关闭对话框时清空数据
    if (!value) state.struct = {}
})

// 将子组件方法暴露给父组件
defineExpose({
    init: method.init,
    show: method.show,
})
</script>