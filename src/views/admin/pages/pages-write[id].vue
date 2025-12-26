<template>
    <div class="container-fluid container-box px-1 px-lg-0">
        <div class="row">
            <div class="col-lg-9">
                <div class="card mb-2">
                    <div v-loading="utils.is.empty(state.struct.editor)" class="card-body custom" style="min-height: 485px">
                        <span>
                            <i-vditor ref="vditor" v-model="state.struct.content" :opts="{ height: 600 }"></i-vditor>
                        </span>
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
                                    <el-tooltip content="（必须）页面的标题" placement="top">
                                        <span>
                                            <i-svg name="hint" size="14px"></i-svg>
                                            <span class="ms-1 required">标题：</span>
                                        </span>
                                    </el-tooltip>
                                    <el-input v-model="state.struct.title" placeholder="页面标题"></el-input>
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
                                <div class="form-group mb-3">
                                    <el-tooltip content="（必须）可以用做页面的唯一识别码或页面入口" placement="top">
                                        <span>
                                            <i-svg name="hint" size="14px"></i-svg>
                                            <span class="ms-1 required">唯一键：</span>
                                        </span>
                                    </el-tooltip>
                                    <el-input v-model="state.struct.key" autocomplete="new-password" placeholder="唯一识别码"></el-input>
                                </div>
                                <div class="form-group mb-3">
                                    <el-tooltip content="备注一下" placement="top">
                                        <span>
                                            <i-svg name="hint" size="14px"></i-svg>
                                            <span class="ms-1">备注：</span>
                                        </span>
                                    </el-tooltip>
                                    <el-input v-model="state.struct.remark" :autosize="{ minRows: 3, maxRows: 10 }" type="textarea"></el-input>
                                </div>
                            </el-collapse-item>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-body px-2 py-0">
                            <el-collapse-item name="2">
                                <template #title>
                                    高级选项
                                </template>
                                <div class="form-group mb-3">
                                    <label class="form-label">
                                        <el-tooltip content="可同时选择多个分类" placement="top">
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
                                        <el-tooltip content="可同时选择多个分类" placement="top">
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
import IVditor from '{src}/comps/custom/i-vditor.vue'
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
        active: ['1'],
        tags: [],
        loading: false,
        wait: false
    },
    struct: {
        content: '',
        editor: 'vditor', // 固定使用vditor
        json: { comment: { allow: 0, show: 0 } }
    },
    select: {
        tags: [],
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
    }
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
        await method.getTags()
        if (!utils.is.empty(state.item.id)) await method.getPage(state.item.id)
        else state.struct.editor = 'vditor' // 初始化默认使用vditor
    },
    // 获取文章标签
    getTags: async () => {
        const { code, data } = await axios.get('/api/tags/column', {
            field: 'id,name'
        })
        if (code !== 200) return
        state.select.tags = data.map(item => ({ value: item.id, label: item.name }))
    },
    // 获取页面信息
    getPage: async (id = null) => {
        const { code, msg, data } = await axios.get('/api/pages/one', { id })
        if (code !== 200) {
            await router.push({path: '/admin/pages/write'})
            notyf.error(msg)
            return notyf.warn('已为您跳转到页面撰写页！')
        }

        // 合并 json 项默认数据
        state.struct = {...data, json: Object.assign({}, data.json, state.struct.json), editor: 'vditor'}

        // 封面图 - 字符串转数组 - name 正则出文件名部分
        if (!utils.is.empty(data.covers)) {
            state.item.fileList = data.covers.split(',').map(item => ({
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
    // 保存
    save: async () => {
        // 获取Vditor内容
        state.struct.content = proxy.$refs['vditor'].getValue()

        // 正则匹配 html 纯文本内容 - 去除换行符
        const reg = /<[^>]+>/g
        // 页面字数
        let length = state.struct?.content?.replace(reg, '')?.replace(/\n/g, '')?.length || 0
        switch (length) {
        case 0:
            return notyf.warn('你这页面一个字都没写，糊弄谁呢？')
        case 1:
            return notyf.warn('真就只写一个字呗？')
        default:
            if (length < 10) return notyf.warn('你这太水了，10个字都不到。')
        }
        if (utils.is.empty(state.struct?.title)) return notyf.warn('你可能忘记写标题了')

        state.struct.tags = !utils.is.empty(state.item.tags) ? `|${state.item.tags.join('|')}|` : ''

        state.item.wait = true

        const { code, msg, data } = await axios.post('/api/pages/save', {
            ...state.struct, json: JSON.stringify(state.struct.json)
        })

        state.item.wait = false

        if (code !== 200) return notyf.error(msg)
        notyf.success(msg)

        state.item.id   = data.id
        state.struct.id = data.id

        await router.push({path: '/admin/pages/write/' + parseInt(data.id)})
    },
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

watch(() => route.params?.id, (value) => {
    if (utils.is.empty(value)) return
    method.init()
})
</script>