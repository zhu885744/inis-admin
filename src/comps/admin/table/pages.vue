<template>
    <i-table :opts="state.opts" ref="i-table">

        <template #start>
            <el-table-column type="selection" width="55"></el-table-column>
        </template>

        <template v-if="props.type === 'all'" #end>
            <el-table-column :fixed="right" label="操作" width="100" class-name="text-end">
                <template #default="scope">
                    <span class="d-flex justify-content-end">
                        <el-button v-on:click="method.edit(scope.row)" size="small">
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
                        <el-button v-on:click="method.restore(scope.row.id)" size="small">
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

        <!-- 创建时间自定义插槽 -->
        <template #i-create_time="{ scope = {} }">
            <el-tooltip 
                :content="method.formatTime(scope.create_time)" 
                :disabled="!scope.create_time" 
                placement="top"
            >
                <span>{{ method.formatTime(scope.create_time) }}</span>
            </el-tooltip>
        </template>

        <!-- 更新时间自定义插槽 -->
        <template #i-update_time="{ scope = {} }">
            <el-tooltip 
                :content="method.formatTime(scope.update_time)" 
                :disabled="!scope.update_time" 
                placement="top"
            >
                <span>{{ method.formatTime(scope.update_time) }}</span>
            </el-tooltip>
        </template>

        <template #i-title="{ scope = {} }">
            <span v-on:dblclick="method.edit(scope)" class="d-flex align-items-center">
                <el-tooltip v-if="scope.audit === 1" content="已审核" placement="top">
                    <i-svg name="audit" size="20px" class="me-1"></i-svg>
                </el-tooltip>
                <el-tooltip :content="scope.title" :disabled="utils.is.empty(scope.title)" placement="top">
                    <span class="limit-1-line">{{ scope?.title }}</span>
                </el-tooltip>
            </span>
        </template>

        <template #i-remark="{ scope = {} }">
            <el-tooltip :disabled="utils.is.empty(scope.remark)" placement="top">
                <template #content>
                    <span v-html="method.autoWrap(scope.remark)"></span>
                </template>
                <span>{{ method.omit(scope?.remark) }}</span>
            </el-tooltip>
        </template>

    </i-table>
</template>

<script setup>
import utils from '{src}/utils/utils.js'
import notyf from '{src}/utils/notyf.js'
import axios from '{src}/utils/request.js'
import ITable from '{src}/comps/custom/i-table.vue'
import { computed, reactive, getCurrentInstance, onMounted, watch } from 'vue' // 补充导入
import { useRouter } from 'vue-router' // 补充导入useRouter

const router = useRouter()
const emit   = defineEmits(['refresh','update:init'])
const props  = defineProps({
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
        table: 'pages',
    },
    struct: {},
    opts: {
        url: '/api/pages/all',
        params: props.params,
        columns: [
            { prop: 'title',  label: '标题', width: 150, slot: true, fixed: left },
            { prop: 'key',    label: '唯一键', width: 100 },
            { prop: 'remark', label: '备注', width: 200, slot: true },
            { prop: 'create_time', label: '创建时间', width: 180, slot: true, sortable: true },
            { prop: 'update_time', label: '更新时间', width: 180, slot: true, sortable: true },
        ],
    },
})

const method = {
    // 刷新数据
    init: async () => {
        // 重新加载数据
        await proxy.$refs['i-table']['init']()
    },
    // 编辑数据
    edit: struct => {
        router.push({path: '/admin/pages/write/' + parseInt(struct.id)})
    },
    // 真删 和 软删
    async delete(ids = [], isSoft = true) {
        if (utils.is.empty(ids)) return
        // 拼接服务地址
        const uri = `/api/${state.item.table}/${isSoft ? 'remove' : 'delete'}`
        const { code, msg } = await axios.del(uri, { ids })
        if (code !== 200) return notyf.error(msg)
        // 刷新回收站数据
        emit('refresh', 'remove', 'check', 'audit')
        // 重新加载数据
        await method.init()
    },
    // 恢复数据
    async restore(ids = []) {
        if (utils.is.empty(ids)) return
        const { code, msg } = await axios.put(`/api/${state.item.table}/restore`, { ids })
        if (code !== 200) return notyf.error(msg)
        // 刷新全部数据
        emit('refresh', 'all', 'check', 'audit')
        // 重新加载数据
        await method.init()
    },
    // 自动换行
    autoWrap(text = '', length = 40, symbol = '<br>') {
        // 判断 text 是否为空
        if (utils.is.empty(text)) return text
        // 每隔 length 个字符添加一个换行符
        return text.replace(new RegExp(`(.{${length}})`, 'g'), `$1${symbol}`)
    },
    // 复制文本
    copy: (text = null, msg = '复制成功！') => {
        if (utils.is.empty(text)) return
        utils.set.copy.text(text)
        if (!utils.is.empty(msg)) return notyf.info(msg)
    },
    // 省略文本
    omit: (text = null, length = 10, omission = ' ... ', location = 'center') => {
        if (utils.is.empty(text)) return '空'
        return utils.string.omit(text, length, omission, location)
    },
    // 格式化时间戳为YYYY-MM-DD HH:mm:ss（通用方法）
    formatTime: (timestamp) => {
        if (!timestamp || timestamp === 0) return '无数据' // 针对创建/更新时间的空值处理
        // 若时间戳是秒级，转换为毫秒级（根据后端返回的时间戳类型调整）
        const time = timestamp.toString().length === 10 ? timestamp * 1000 : timestamp
        const date = new Date(time)
        // 补零函数
        const pad = (num) => num.toString().padStart(2, '0')
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
    }
}

onMounted(async () => {
    if (props.init) await method.init()
})

watch(() => props.init, (val) => {
    if (val) method.init()
})

// 将子组件方法暴露给父组件
defineExpose({
    init: method.init,
})
</script>