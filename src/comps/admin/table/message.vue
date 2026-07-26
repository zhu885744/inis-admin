<template>
    <div>
        <div style="margin-bottom: 12px" v-if="state.item.selection.length > 0 && props.type === 'all'">
            <el-button v-on:click="method.batchRead()" type="success" size="small">
                <i-svg color="rgb(var(--icon-color))" name="finish" size="16px"></i-svg>
                <span style="margin-left: 4px">批量标记已读</span>
            </el-button>
            <el-button v-on:click="method.batchDelete(true)" type="danger" size="small" style="margin-left: 8px">
                <i-svg color="rgb(var(--icon-color))" name="delete" size="16px"></i-svg>
                <span style="margin-left: 4px">批量删除</span>
            </el-button>
        </div>
        <div style="margin-bottom: 12px" v-if="state.item.selection.length > 0 && props.type === 'remove'">
            <el-button v-on:click="method.batchRestore()" type="primary" size="small">
                <i-svg color="rgb(var(--icon-color))" name="restore" size="16px"></i-svg>
                <span style="margin-left: 4px">批量恢复</span>
            </el-button>
            <el-button v-on:click="method.batchDelete(false)" type="danger" size="small" style="margin-left: 8px">
                <i-svg color="rgb(var(--icon-color))" name="delete" size="16px"></i-svg>
                <span style="margin-left: 4px">批量永久删除</span>
            </el-button>
        </div>
    <i-table :opts="state.opts" ref="i-table" @selection:change="method.selectionChange">

        <template #start>
            <el-table-column type="selection" width="55"></el-table-column>
        </template>

        <template v-if="props.type === 'all'" #end>
            <el-table-column :fixed="right" label="操作" width="150" class-name="text-end">
                <template #default="scope">
                    <span style="display: flex; justify-content: flex-end">
                        <el-button v-on:click="method.read(scope.row.id)" size="small" :disabled="scope.row.status === 1">
                            <i-svg color="rgb(var(--icon-color))" name="finish" size="16px"></i-svg>
                        </el-button>
                        <el-button v-on:click="method.edit(scope.row)" size="small" style="margin-left: 0">
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

        <template #i-title="{ scope = {} }">
            <span :class="{ 'font-bold': scope.status === 0 }">
                <span v-if="scope.uid === 0" style="color: var(--el-color-danger); margin-right: 4px">【广播】</span>
                {{ method.omit(scope.title) }}
            </span>
        </template>

        <template #i-content="{ scope = {} }">
            <el-tooltip :disabled="utils.is.empty(scope.content)" placement="top">
                <template #content>
                    <span>{{ scope.content }}</span>
                </template>
                <span>{{ method.omit(scope.content) }}</span>
            </el-tooltip>
        </template>

        <template #i-type="{ scope = {} }">
            <el-tag :type="method.getTypeTag(scope.type)" size="small">
                {{ method.getTypeName(scope.type) }}
            </el-tag>
        </template>

        <template #i-status="{ scope = {} }">
            <el-tag :type="scope.status === 0 ? 'danger' : 'success'" size="small">
                {{ scope.status === 0 ? '未读' : '已读' }}
            </el-tag>
        </template>

        <template #i-bind_type="{ scope = {} }">
            <span>{{ scope.bind_type || '-' }}</span>
        </template>

    </i-table>
    </div>

    <el-dialog v-model="state.item.dialog" class="custom" draggable :close-on-click-modal="false">
        <template #header>
            <strong class="flex-center">{{ utils.is.empty(state.struct.id) ? '添 加' : '编 辑' }} 消息</strong>
        </template>
        <template #default>
            <el-form label-width="120px" label-position="left">
                <el-form-item label="消息类型">
                    <el-select v-model="state.struct.type" placeholder="请选择类型">
                        <el-option label="系统消息" value="system"></el-option>
                        <el-option label="评论通知" value="comment"></el-option>
                        <el-option label="点赞通知" value="like"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="标题">
                    <el-input v-model="state.struct.title" placeholder="请输入消息标题"></el-input>
                </el-form-item>
                <el-form-item label="内容">
                    <el-input v-model="state.struct.content" :autosize="{ minRows: 3, maxRows: 6 }" type="textarea" placeholder="请输入消息内容"></el-input>
                </el-form-item>
                <el-form-item label="绑定类型">
                    <el-input v-model="state.struct.bind_type" placeholder="如：article, page, moments"></el-input>
                </el-form-item>
                <el-form-item label="绑定ID">
                    <el-input v-model="state.struct.bind_id" type="number" placeholder="绑定对象的ID"></el-input>
                </el-form-item>
            </el-form>
        </template>
        <template #footer>
            <el-button v-on:click="state.item.dialog = false">取 消</el-button>
            <el-button v-on:click="method.save()" :loading="state.item.wait">保 存</el-button>
        </template>
    </el-dialog>
</template>

<script setup>
import { reactive, computed, watch, onMounted, getCurrentInstance } from 'vue'
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

const left = computed(() => {
    let result = 'left'
    if (utils.is.mobile()) result = false
    return result
})

const right = computed(() => {
    let result = 'right'
    if (utils.is.mobile()) result = false
    return result
})

const { ctx, proxy } = getCurrentInstance()
const state  = reactive({
    item: {
        table: 'message',
        dialog: false,
        wait: false,
        selection: [],
    },
    struct: {},
    opts: {
        url: '/api/message/all',
        params: props.params,
        columns: [
            { prop: 'id', label: 'ID', width: 80, align: 'center' },
            { prop: 'type', label: '类型', width: 120, slot: true, align: 'center' },
            { prop: 'title', label: '标题', slot: true },
            { prop: 'content', label: '内容', slot: true },
            { prop: 'status', label: '状态', width: 80, slot: true, align: 'center' },
            { prop: 'bind_type', label: '绑定类型', width: 120, slot: true, align: 'center' },
            { prop: 'bind_id', label: '绑定ID', width: 100, align: 'center' },
            { prop: 'create_time', label: '创建时间', width: 140, sortable: true },
        ],
    },
})

const method = {
    init: async () => {
        await proxy.$refs['i-table']['init']()
    },
    save: async (params = state.struct || {}) => {
        if (utils.is.empty(params)) return ElMessage.warning('表单数据不能为空！')
        if (utils.is.empty(params?.title)) return ElMessage.warning('标题为必填项！')
        if (utils.is.empty(params?.content)) return ElMessage.warning('内容为必填项！')

        state.item.wait = true

        const { code, msg } = await axios.post(`/api/${state.item.table}/save`, params)

        state.item.wait = false

        if (code !== 200) return ElMessage.error(msg)

        state.item.dialog = false
        await method.init()
        ElMessage.success('保存成功')
    },
    edit: struct => {
        state.struct = struct
        state.item.dialog = true
    },
    show: () => (state.item.dialog = true),
    async delete(ids = [], isSoft = true) {
        if (utils.is.empty(ids)) return

        const uri = `/api/${state.item.table}/${isSoft ? 'remove' : 'delete'}`

        const { code, msg } = await axios.del(uri, { ids })

        if (code !== 200) return ElMessage.error(msg)

        emit('refresh', 'remove')
        await method.init()
        ElMessage.success('删除成功')
    },
    async restore(ids = []) {
        if (utils.is.empty(ids)) return

        const { code, msg } = await axios.put(`/api/${state.item.table}/restore`, { ids })

        if (code !== 200) return ElMessage.error(msg)

        emit('refresh', 'all')
        await method.init()
        ElMessage.success('恢复成功')
    },
    async read(id = null) {
        if (utils.is.empty(id)) return

        const { code, msg } = await axios.post(`/api/${state.item.table}/read`, { id })

        if (code !== 200) return ElMessage.error(msg)

        ElMessage.success('已标记为已读')
        await method.init()
    },
    async batchRead() {
        const ids = state.item.selection.map(item => item.id)
        if (utils.is.empty(ids)) return ElMessage.warning('请选择要标记已读的消息')

        state.item.wait = true
        try {
            for (const id of ids) {
                await axios.post(`/api/${state.item.table}/read`, { id })
            }
            state.item.wait = false

            ElMessage.success('批量标记已读成功！')
            await method.init()
        } catch (error) {
            state.item.wait = false
            ElMessage.error(error.message || '操作失败')
        }
    },
    selectionChange(selection) {
        state.item.selection = selection
    },
    async batchDelete(isSoft = true) {
        const ids = state.item.selection.map(item => item.id)
        if (utils.is.empty(ids)) return ElMessage.warning('请选择要操作的消息')

        try {
            await ElMessageBox.confirm(
                `确定要${isSoft ? '软删除' : '永久删除'}选中的 ${ids.length} 条消息吗？`,
                '提示',
                { type: 'warning' }
            )
        } catch {
            return
        }

        state.item.wait = true
        try {
            const uri = `/api/${state.item.table}/${isSoft ? 'remove' : 'delete'}`
            const { code, msg } = await axios.del(uri, { ids })
            state.item.wait = false
            if (code !== 200) throw new Error(msg)

            ElMessage.success(isSoft ? '批量软删除成功！' : '批量永久删除成功！')
            emit('refresh', 'remove')
            await method.init()
        } catch (error) {
            state.item.wait = false
            ElMessage.error(error.message || '删除失败')
        }
    },
    async batchRestore() {
        const ids = state.item.selection.map(item => item.id)
        if (utils.is.empty(ids)) return ElMessage.warning('请选择要恢复的消息')

        state.item.wait = true
        try {
            const { code, msg } = await axios.put(`/api/${state.item.table}/restore`, { ids })
            state.item.wait = false
            if (code !== 200) throw new Error(msg)

            ElMessage.success('批量恢复成功！')
            emit('refresh', 'all')
            await method.init()
        } catch (error) {
            state.item.wait = false
            ElMessage.error(error.message || '恢复失败')
        }
    },
    omit: (text = null, length = 20, omission = ' ...', location = 'center') => {
        if (utils.is.empty(text)) return '-'
        return utils.string.omit(text, length, omission, location)
    },
    getTypeName: (type = '') => {
        const types = {
            'system': '系统消息',
            'comment': '评论通知',
            'like': '点赞通知',
        }
        return types[type] || type || '未知'
    },
    getTypeTag: (type = '') => {
        const tags = {
            'system': 'danger',
            'comment': 'primary',
            'like': 'success',
        }
        return tags[type] || 'info'
    },
}

onMounted(async () => {
    if (props.init) await method.init()
})

watch(() => props.init, (val) => {
    if (val) method.init()
})

watch(() => state.item.dialog, (value) => {
    if (!value) state.struct = {}
})

defineExpose({
    init: method.init,
    show: method.show,
})
</script>