<template>
    <div class="container-fluid container-box px-1 px-lg-0">
        <div class="row">
            <div class="col-lg-9">
                <div class="card mb-2">
                    <div v-loading="utils.is.empty(state.struct.editor)" class="card-body custom" style="min-height: 485px">
                        <!-- 仅保留 Vditor 编辑器 -->
                        <i-vditor ref="vditor" v-model="state.struct.content" :opts="{ height: 600 }"></i-vditor>
                    </div>
                    <div class="card-footer">
                        <el-button v-on:click="method.save()" :loading="state.item.wait" type="primary" plain class="float-end">保 存</el-button>
                    </div>
                </div>
            </div>
            <div v-loading="state.item.loading" class="col-lg-3 custom" id="page-header-title">
                <el-collapse accordion v-model="state.item.active">
                    <div class="card mb-2">
                        <div class="card-body px-2 py-0">
                            <el-collapse-item name="1">
                                <template #title>
                                    展示信息
                                </template>
                                <div class="form-group mb-3">
                                    <el-tooltip content="（必须）文章的标题" placement="top">
                                        <span>
                                            <i-svg name="hint" size="14px"></i-svg>
                                            <span class="ms-1 required">标题：</span>
                                        </span>
                                    </el-tooltip>
                                    <el-input v-model="state.struct.title" placeholder="文章标题"></el-input>
                                </div>
                                <!-- 新增：日期时间选择器待后端更新自定义日期接口 -->
                                <div class="form-group mb-3">
                                    <label class="form-label">
                                        <el-tooltip content="文章的发布时间，留空则为当前时间" placement="top">
                                            <span>
                                                <i-svg name="hint" size="14px"></i-svg>
                                                <span class="ms-1">发布时间：</span>
                                            </span>
                                        </el-tooltip>
                                    </label>
                                    <el-date-picker
                                        v-model="state.struct.publishTime"
                                        type="datetime"
                                        placeholder="选择发布时间"
                                        format="YYYY-MM-DD HH:mm:ss"
                                        value-format="YYYY-MM-DD HH:mm:ss"
                                        class="w-100"
                                    />
                                </div>
                                <div v-if="store.comm.login.user.result.auth.all === true" class="form-group mb-3">
                                    <label class="form-label">
                                        <el-tooltip content="审核状态" placement="top">
                                            <span>
                                                <i-svg name="hint" size="14px"></i-svg>
                                                <span class="ms-1">审核状态：</span>
                                            </span>
                                        </el-tooltip>
                                    </label>
                                    <el-select v-model="state.struct.audit" class="d-block custom font-13" placeholder="请选择">
                                        <el-option v-for="item in state.select.audit" :key="item.value" :label="item.label" :value="item.value">
                                            <span class="font-13">{{ item.label }}</span>
                                            <small class="text-muted float-end">{{ item.value }}</small>
                                        </el-option>
                                    </el-select>
                                </div>
                                <div class="form-group mb-3">
                                    <el-tooltip content="文章的摘要" placement="top">
                                        <span>
                                            <i-svg name="hint" size="14px"></i-svg>
                                            <span class="ms-1">摘要：</span>
                                        </span>
                                    </el-tooltip>
                                    <el-input v-model="state.struct.abstract" :autosize="{ minRows: 3, maxRows: 10 }" placeholder="简单的描述一下您的文章" type="textarea">
                                    </el-input>
                                </div>
                            </el-collapse-item>
                        </div>
                    </div>
                    <div class="card mb-2">
                        <div class="card-body px-2 py-0">
                            <el-collapse-item name="2">
                                <template #title>
                                    封面图
                                </template>
                                <el-tabs v-model="state.item.tabs" :stretch="true">
                                    <el-tab-pane label="预览" name="preview">
                                        <el-upload class="custom upload" action="/api/file/upload" :headers="method.headers()" :multiple="true" list-type="picture"
                                            :on-remove="method.cover.remove" :on-success="method.cover.success"
                                            :on-error="method.cover.error" :file-list="state.item.cover.preview">
                                            <el-button type="primary" class="w-100">上 传</el-button>
                                        </el-upload>
                                    </el-tab-pane>
                                    <el-tab-pane label="外链" name="links">
                                        <el-input v-model="state.item.cover.links" v-on:change="method.cover.change" wrap="off"
                                            :autosize="{ minRows: 3, maxRows: 10 }" placeholder="外链图片地址，一行一个" type="textarea">
                                        </el-input>
                                    </el-tab-pane>
                                </el-tabs>
                            </el-collapse-item>
                        </div>
                    </div>
                    <div class="card mb-2">
                        <div class="card-body px-2 py-0">
                            <el-collapse-item name="3">
                                <template #title>
                                    置顶、分类、标签
                                </template>
                                <div class="form-group mb-3">
                                    <label class="form-label">
                                        <el-tooltip content="可同时选择多个分类" placement="top">
                                            <span>
                                                <i-svg name="hint" size="14px"></i-svg>
                                                <span class="ms-1">置顶：</span>
                                            </span>
                                        </el-tooltip>
                                    </label>
                                    <el-select v-model="state.struct.top" class="d-block custom" placeholder="请选择" filterable>
                                        <el-option v-for="item in state.select.top" :key="item.value" :label="item.label" :value="item.value">
                                        </el-option>
                                    </el-select>
                                </div>
                                <div class="form-group mb-3">
                                    <label class="form-label">
                                        <el-tooltip content="可同时选择多个分类" placement="top">
                                            <span>
                                                <i-svg name="hint" size="14px"></i-svg>
                                                <span class="ms-1">分类：</span>
                                            </span>
                                        </el-tooltip>
                                    </label>
                                    <el-cascader :options="state.select.group" :props="{ multiple: true, checkStrictly: true }"
                                         v-model="state.item.group" collapse-tags clearable filterable class="w-100">
                                    </el-cascader>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">
                                        <el-tooltip content="可同时选择多个标签" placement="top">
                                            <span>
                                                <i-svg name="hint" size="14px"></i-svg>
                                                <span class="ms-1">标签：</span>
                                            </span>
                                        </el-tooltip>
                                    </label>
                                    <el-select v-model="state.item.tags" v-on:change="method.change.tags"
                                        multiple collapse-tags filterable allow-create default-first-option class="d-block custom" placeholder="请选择">
                                        <el-option v-for="item in state.select.tags" :key="item.value" :label="item.label" :value="item.value">
                                        </el-option>
                                    </el-select>
                                </div>
                            </el-collapse-item>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-body px-2 py-0">
                            <el-collapse-item name="4">
                                <template #title>
                                    高级选项
                                </template>
                                <div class="form-group mb-3">
                                    <label class="form-label">
                                        <el-tooltip content="对当前文章的评论选项单独控制" placement="top">
                                            <span>
                                                <i-svg name="hint" size="14px"></i-svg>
                                                <span class="ms-1">允许评论：</span>
                                            </span>
                                        </el-tooltip>
                                    </label>
                                    <el-select v-model="state.struct.json.comment.allow" class="d-block custom font-13" placeholder="请选择">
                                        <el-option v-for="item in state.select.comment.allow" :key="item.value" :label="item.label" :value="item.value">
                                            <span class="font-13">{{ item.label }}</span>
                                            <small class="text-muted float-end">{{ item.value }}</small>
                                        </el-option>
                                    </el-select>
                                </div>
                                <div class="form-group mb-3">
                                    <label class="form-label">
                                        <el-tooltip content="对当前文章的评论选项单独控制" placement="top">
                                            <span>
                                                <i-svg name="hint" size="14px"></i-svg>
                                                <span class="ms-1">显示评论：</span>
                                            </span>
                                        </el-tooltip>
                                    </label>
                                    <el-select v-model="state.struct.json.comment.show" class="d-block custom font-13" placeholder="请选择">
                                        <el-option v-for="item in state.select.comment.show" :key="item.value" :label="item.label" :value="item.value">
                                            <span class="font-13">{{ item.label }}</span>
                                            <small class="text-muted float-end">{{ item.value }}</small>
                                        </el-option>
                                    </el-select>
                                </div>
                            </el-collapse-item>
                        </div>
                    </div>
                </el-collapse>
            </div>
        </div>
    </div>
</template>

<script setup>
import cache from '{src}/utils/cache'
import utils from '{src}/utils/utils'
import notyf from '{src}/utils/notyf'
import axios from '{src}/utils/request'
import IVditor from '{src}/comps/custom/i-vditor.vue'  // 仅保留 Vditor 组件
import { useCommStore } from '{src}/store/comm'

const { ctx, proxy } = getCurrentInstance()

const route  = useRoute()
const router = useRouter()
const store  = {
    comm: useCommStore(),
}
const state  = reactive({
    item: {
        id: null,
        tags: [],
        group: [],
        active: ['1'],
        tabs: 'preview',
        // 封面数据
        cover: {
            // 预览图
            preview: [],
            // 外链图
            links: ''
        },
        loading: false,
        wait: false
    },
    struct: {
        content: '',
        editor: 'vditor',  // 固定使用 Vditor 编辑器
        json: { comment: { allow: 0, show: 0 } }
    },
    select: {
        top: [{ value: 1, label: '置顶' }, { value: 0, label: '不置顶' }],
        tags: [],
        group: [],
        comment: {
            allow: [
                { value: 0, label: '继承父级（推荐）' },
                { value: 1, label: '允许' },
                { value: 2, label: '禁止' },
            ],
            show: [
                { value: 0, label: '继承父级（推荐）' },
                { value: 1, label: '显示' },
                { value: 2, label: '隐藏' },
            ]
        },
        audit: [
            { value: 0, label: '待审核' },
            { value: 1, label: '通过' },
            { value: 2, label: '不通过' },
        ],
    },
    backup: {
        group: [],
    },
})

onMounted(async () => {
    await method.init()
})

const method = {
    init: async () => {
        let id = route.params?.id
        if (!utils.is.empty(id)) {
            state.item.id = parseInt(id)
            state.item.loading = true
        }
        await method.getGroup()
        await method.getTags()
        if (!utils.is.empty(state.item.id))  await method.getArticle(state.item.id)
        else {
            // 直接设置为 Vditor 编辑器，无需读取缓存
            state.struct.editor = 'vditor'
        }
    },
    // 获取文章信息
    getArticle: async (id = null) => {

        const { code, msg, data } = await axios.get('/api/article/one', { id })
        if (code !== 200) {
            await router.push({path: '/admin/article/write'})
            return notyf.error('已为您跳转到文章撰写页！', msg)
        }

        // 合并 json 项默认数据
        state.struct = {...data, json: Object.assign({}, data.json, state.struct.json)}
        // 强制使用 Vditor
        state.struct.editor = 'vditor'

        // 封面图 - 字符串转数组 - name 正则出文件名部分
        if (!utils.is.empty(data.covers)) {
            state.item.cover.preview = data.covers.split(',').map(item => ({
                name: item.replace(/.*\//, ''), url: item,
            }))
        }
        // 分类 - 字符串转数组 - 去空 去重 转int
        if (!utils.is.empty(data.group)) {
            let group = data.group.split('|').filter(item => !utils.is.empty(item)).map(item => parseInt(item))
            state.item.group = method.tree.parse(state.backup.group, group)
        }
        // 标签 - 字符串转数组 - 去空 去重 转int
        if (!utils.is.empty(data.tags)) {
            state.item.tags = data.tags.split('|').filter(item => !utils.is.empty(item)).map(item => parseInt(item))
        }

        // 关闭加载状态
        if (!utils.is.empty(id)) state.item.loading = false
    },
    // 获取文章分组
    getGroup: async () => {
        const { code, data } = await axios.get('/api/article-group/column', {
            field: 'id,pid,name,avatar'
        })
        if (code !== 200) return
        state.backup.group = data
        state.select.group = method.tree.stringify(data, 0)
    },
    // 获取文章标签
    getTags: async () => {
        const { code, data } = await axios.get('/api/tags/column', {
            field: 'id,name'
        })
        if (code !== 200) return
        state.select.tags = data.map(item => ({ value: item.id, label: item.name }))
    },
    // 保存
    save: async () => {

        // 获取 Vditor 内容
        state.struct.content = proxy.$refs['vditor'].getValue()

        // 正则匹配纯文本内容 - 去除换行符
        const reg = /<[^>]+>/g
        // 文章字数
        let length = state.struct?.content?.replace(reg, '')?.replace(/\n/g, '')?.length || 0
        switch (length) {
        case 0:
            return notyf.warn('你这文章一个字都没写，糊弄谁呢？')
        case 1:
            return notyf.warn('真就只写一个字呗？')
        default:
            if (length < 10) return notyf.warn('你这太水了，10个字都不到。')
        }
        if (utils.is.empty(state.struct?.title)) return notyf.warn('你可能忘记写标题了')

        // 封面图 - 去空
        let covers = state.item.cover.links.split('\n').filter(item => !utils.is.empty(item))
        // 把 state.item.group 的二维数组转换成一维数组
        let group = state.item.group.reduce((prev, next) => prev.concat(next), [])
        // 去空 去重 排序
        group = Array.from(new Set(group.filter(item => item))).sort((a, b) => a - b)

        state.struct.covers = !utils.is.empty(covers) ? covers.join(',') : ''
        state.struct.tags   = !utils.is.empty(state.item.tags) ? `|${state.item.tags.join('|')}|` : ''
        state.struct.group  = !utils.is.empty(group) ? `|${group.join('|')}|` : ''

        state.item.wait = true

        const { code, msg, data } = await axios.post('/api/article/save', {
            ...state.struct, json: JSON.stringify(state.struct.json)
        })

        state.item.wait = false

        if (code !== 200) return notyf.error(msg)
        notyf.success(msg)

        state.item.id   = data.id
        state.struct.id = data.id

        await router.push({path: '/admin/article/write/' + parseInt(data.id)})
    },
    // 树
    tree: {
        stringify: (data = [], pid = 0) => {
            const result = []
            for (const item of data) {
                if (item.pid === pid) {
                    const node = { value: item.id, label: item.name, children: [] }
                    node.children = method.tree.stringify(data, item.id)
                    result.push(node)
                }
            }
            return result
        },
        parse: (data, selected) => {
            let result = []
            for (let item of data) {
                if (selected.includes(item.id)) {
                    if (item.pid === 0) result.push([item.id])
                    else {
                        for (let i = 0; i < result.length; i++) {
                            if (result[i][result[i].length - 1] === item.pid) {
                                result.push([...result[i], item.id])
                                break
                            }
                        }
                    }
                }
            }
            return result
        }
    },
    cover: {
        // 移除封面图
        remove: (file) => {
            delete state.item.cover.preview[file.uid]
        },
        // 上传成功
        success: async (response, file, list) => {

            const { code, msg } = response
            if (code !== 200) return notyf.error(msg)

            for (let key = 0; key < list.length; key++) {
                // 判断是否存在 response
                if (list[key].response) {
                    const { data } = list[key].response
                    if (!data?.path) continue
                    list[key] = { name: data.path.replace(/.*\//, ''), url: data.path }
                }
            }
            state.item.cover.preview = list
        },
        // 上传失败
        error: (err, file, fileList) => {
            console.log(err, file, fileList)
        },
        // 外链输入框事件
        change: (data) => {
            state.item.cover.preview = data.split('\n').filter(item => !utils.is.empty(item)).map(item => ({ name: item.replace(/.*\//, ''), url: item }))
        }
    },
    // 文件上传自定义头
    headers: () => {
        let result = {}
        if (!utils.is.empty(globalThis?.inis?.api?.key)) {
            result['i-api-key'] = globalThis?.inis?.api?.key
        }
        let TOKEN_NAME = globalThis?.inis?.token_name || 'INIS_LOGIN_TOKEN'
        if (utils.has.cookie(TOKEN_NAME)) {
            let token = utils.get.cookie(TOKEN_NAME)
            if (!utils.is.empty(token)) {
                result.Authorization = token
            }
        }
        return result
    },
    empty: value => utils.is.empty(value),
    // 数据变化
    change: {
        // 标签变化
        tags: (data) => {

            if (utils.is.empty(data)) return

            data.forEach(async (item, index) => {
                if (typeof item === 'string') {
                    const {code, msg, data} = await axios.post('/api/tags/save', {name: item})
                    // 创建失败，删除对应的 tag
                    if (code !== 200) {
                        notyf.error('添加标签失败：' + msg)
                        return state.item.tags.splice(index, 1)
                    }
                    // 把原来的 tag 替换成新的 tag.id
                    state.item.tags[index] = data.id
                    // 把新的 tag 添加到 select.tags 列表中
                    state.select.tags.push({value: data.id, label: item})
                }
            })
        }
    },
}

// 监听封面图预览图变化
watch(() => state.item.cover.preview, (value = {}) => {
    state.item.cover.links = value.map(item => item.url).join('\n') + '\n'
}, { deep: true })

watch(() => state.item.cover.links, (value) => {
    // 去除空格和换行
    value = value?.replace(/[\s\n]/g, '')
    // 判断是否为空
    if (!utils.is.empty(value)) return
    state.item.cover.links = ''
})

watch(() => route.params?.id, (value) => {
    if (utils.is.empty(value)) return
    method.init()
})
</script>