<template>
    <i-table :opts="state.opts" ref="i-table">

        <template #start>
            <el-table-column type="selection" width="55"></el-table-column>
        </template>

        <template v-if="props.type === 'all'" #end>
            <el-table-column :fixed="right" label="操作" width="100" class-name="text-end">
                <template #default="scope">
                    <span style="display: flex; justify-content: flex-end">
                        <el-button v-on:click="method.edit(scope.row)" size="small">
                            <i-svg color="rgb(var(--icon-color))" name="edit" size="16px"></i-svg>
                        </el-button>
                        <el-button v-on:click="method.delete(scope.row.id, true)" size="small" style="margin-left: 0">
                            <i-svg color="rgb(var(--icon-color))" name="delete" size="21px"></i-svg>
                        </el-button>
                    </span>
                </template>
            </el-table-column>
        </template>
        <template v-if="props.type === 'remove'">
            <el-table-column :fixed="right" label="操作" width="160" class-name="text-end">
                <template #default="scope">
                    <span style="display: flex; justify-content: flex-end">
                        <el-button v-on:click="method.restore(scope.row.id)" size="small">
                            <i-svg color="rgb(var(--icon-color))" name="restore" size="16px"></i-svg>
                        </el-button>
                        <el-button v-on:click="method.edit(scope.row)" size="small" style="margin-left: 0">
                            <i-svg color="rgb(var(--icon-color))" name="edit" size="16px"></i-svg>
                        </el-button>
                        <el-button v-on:click="method.delete(scope.row.id, false)" size="small" style="margin-left: 0">
                            <i-svg color="rgb(var(--icon-color))" name="delete" size="21px"></i-svg>
                        </el-button>
                    </span>
                </template>
            </el-table-column>
        </template>

        <template #i-ip="{ scope = {} }">
            <el-tooltip v-if="!utils.is.empty(scope?.cause)" :content="'原因：' + scope?.cause" placement="top">
                <i-svg color="rgb(var(--icon-color))" v-on:dblclick="method.copy(scope?.cause)" name="remark" size="16px" style="margin-right: 4px"></i-svg>
            </el-tooltip>
            <el-tooltip v-if="!utils.is.empty(scope?.agent)" :content="'双击复制 User-Agent：' + scope?.agent" placement="top">
                <i-svg color="rgb(var(--icon-color))" v-on:dblclick="method.copy(scope?.agent)" name="user-agent" size="16px" style="margin-right: 4px"></i-svg>
            </el-tooltip>
            <el-tooltip :content="'双击复制：' + scope.ip" :disabled="utils.is.empty(scope?.ip)" placement="top">
                <span v-on:dblclick="method.copy(scope?.ip)">{{ method.omit(scope?.ip, 15) }}</span>
            </el-tooltip>
        </template>

        <template #i-level="{ scope = {} }">
            <el-tag :type="method.levelType(scope.level)" size="small">
                {{ method.levelLabel(scope.level, scope.is_permanent) }}
            </el-tag>
        </template>

        <template #i-violation_count="{ scope = {} }">
            <span>{{ scope.violation_count || 0 }} 次</span>
        </template>

        <template #i-duration="{ scope = {} }">
            <span>{{ method.formatDuration(scope.duration, scope.is_permanent) }}</span>
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

    <el-dialog v-model="state.item.dialog" class="custom" draggable :close-on-click-modal="false">
        <template #header>
            <strong class="flex-center">{{ utils.is.empty(state.struct.id) ? '添 加' : '编 辑' }} IP 黑 名 单</strong>
        </template>
        <template #default>
            <el-form label-width="100px" label-position="left">
                <el-row :gutter="20">
                    <el-col :lg="24">
                        <el-form-item label="IP">
                            <el-input v-model="state.struct.ip" placeholder="例如：192.168.1.1" style="width: 100%"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :lg="24">
                        <el-form-item label="备注">
                            <el-input v-model="state.struct.remark" :autosize="{ minRows: 3, maxRows: 10 }" placeholder="备注一下" type="textarea" style="width: 100%"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
        </template>
        <template #footer>
            <el-button v-on:click="state.item.dialog = false">取 消</el-button>
            <el-button v-on:click="method.save()" :loading="state.item.wait">保 存</el-button>
        </template>
    </el-dialog>
</template>

<script setup>
import utils from '{src}/utils/utils.js'
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
        table: 'ip-black',
        dialog: false,
        wait: false,
    },
    struct: {
        ip: null
    },
    opts: {
        url: '/api/ip-black/all',
        params: props.params,
        columns: [
            { prop: 'ip', label: 'IP', slot: true, fixed: left },
            { prop: 'level', label: '封禁等级', width: 100, slot: true, align: 'center' },
            { prop: 'violation_count', label: '违规次数', width: 90, slot: true, align: 'center' },
            { prop: 'duration', label: '封禁时长', width: 100, slot: true, align: 'center' },
            { prop: 'remark' , label: '备注', slot: true },
            { prop: 'update_time', label: '更新时间', width: 140, sortable: true },
            { prop: 'create_time', label: '创建时间', width: 140, sortable: true },
        ],
    },
})

const method = {
    // 刷新数据
    init: async () => {
        // 重新加载数据
        await proxy.$refs['i-table']['init']()
    },
    // 封禁等级标签类型
    levelType: (level) => {
        const types = {
            1: 'info',
            2: 'warning',
            3: 'danger',
            4: 'danger',
        }
        return types[level] || 'default'
    },
    // 封禁等级标签文字
    levelLabel: (level, isPermanent) => {
        if (isPermanent) return '永久封禁'
        const labels = {
            1: '1级 (1小时)',
            2: '2级 (24小时)',
            3: '3级 (7天)',
            4: '4级 (永久)',
        }
        return labels[level] || '未知'
    },
    // 格式化封禁时长
    formatDuration: (duration, isPermanent) => {
        if (isPermanent) return '永久'
        if (!duration || duration === 0) return '-'
        if (duration < 24) return `${duration} 小时`
        if (duration < 168) return `${Math.round(duration / 24)} 天`
        return `${Math.round(duration / 168)} 周`
    },
    // 保存数据
    save: async (params = state.struct || {}) => {

        if (utils.is.empty(params))    return ElMessage.warning('你在想什么？什么都不填！')  // 使用ElMessage
        if (utils.is.empty(params.ip)) return ElMessage.warning('IP地址不能为空！')  // 使用ElMessage

        state.item.wait     = true

        const { code, msg } = await axios.post(`/api/${state.item.table}/save`, params)

        state.item.wait     = false

        if (code !== 200) return ElMessage.error(msg)  // 使用ElMessage

        // 关闭对话框
        state.item.dialog = false
        // 重新加载数据
        await method.init()
        ElMessage.success('保存成功')  // 使用ElMessage
    },
    // 编辑数据
    edit: struct => {
        state.struct = struct
        state.item.dialog = true
    },
    // 显示盒子
    show: () => (state.item.dialog = true),
     // 真删 和 软删
    async delete(ids = [], isSoft = true) {

        if (utils.is.empty(ids)) return

        // 拼接服务地址
        const uri = `/api/${state.item.table}/${isSoft ? 'remove' : 'delete'}`

        const { code, msg } = await axios.del(uri, { ids })

        if (code !== 200) return ElMessage.error(msg)  // 使用ElMessage

        // 刷新回收站数据
        emit('refresh', 'remove')

        // 重新加载数据
        await method.init()
        ElMessage.success('删除成功')  // 使用ElMessage
    },
    // 恢复数据
    async restore(ids = []) {

        if (utils.is.empty(ids)) return

        const { code, msg } = await axios.put(`/api/${state.item.table}/restore`, { ids })

        if (code !== 200) return ElMessage.error(msg)  // 使用ElMessage

        // 刷新全部数据
        emit('refresh', 'all')

        // 重新加载数据
        await method.init()
        ElMessage.success('恢复成功')  // 使用ElMessage
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

        if (!utils.is.empty(msg)) return ElMessage.success(msg)  // 使用ElMessage
    },
    // 省略文本
    omit  : (text = null, length = 10, omission = ' ... ', location = 'center') => {
        if (utils.is.empty(text)) return '空'
        return utils.string.omit(text, length, omission, location)
    },
}

onMounted(async () => {
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