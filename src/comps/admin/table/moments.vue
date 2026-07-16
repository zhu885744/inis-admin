<template>
    <div>
        <i-table :opts="state.opts" ref="i-table">

            <template #start>
                <el-table-column type="selection" width="55"></el-table-column>
            </template>

            <template v-if="props.type === 'all'" #end>
                <el-table-column :fixed="right" label="操作" width="100" class-name="text-end">
                    <template #default="scope">
                        <span style="display: flex; justify-content: flex-end">
                            <el-button v-on:click="method.edit(scope.row)" size="small">
                                <i-svg name="edit" color="rgb(var(--icon-color))" size="16px"></i-svg>
                            </el-button>
                            <el-button v-on:click="method.delete(scope.row.id, true)" size="small" style="margin-left: 0">
                                <i-svg name="delete" color="rgb(var(--icon-color))" size="21px"></i-svg>
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
                                <i-svg name="restore" color="rgb(var(--icon-color))" size="16px"></i-svg>
                            </el-button>
                            <el-button v-on:click="method.edit(scope.row)" size="small" style="margin-left: 0">
                                <i-svg name="edit" color="rgb(var(--icon-color))" size="16px"></i-svg>
                            </el-button>
                            <el-button v-on:click="method.delete(scope.row.id, false)" size="small" style="margin-left: 0">
                                <i-svg name="delete" color="rgb(var(--icon-color))" size="21px"></i-svg>
                            </el-button>
                        </span>
                    </template>
                </el-table-column>
            </template>

            <template #i-create_time="{ scope = {} }">
                <el-tooltip 
                    :content="method.formatTime(scope.create_time)" 
                    :disabled="!scope.create_time" 
                    placement="top"
                >
                    <span>{{ method.formatTime(scope.create_time) }}</span>
                </el-tooltip>
            </template>

            <template #i-update_time="{ scope = {} }">
                <el-tooltip 
                    :content="method.formatTime(scope.update_time)" 
                    :disabled="!scope.update_time" 
                    placement="top"
                >
                    <span>{{ method.formatTime(scope.update_time) }}</span>
                </el-tooltip>
            </template>

            <template #i-content="{ scope = {} }">
                <span v-on:dblclick="method.edit(scope)" style="display: flex; align-items: center">
                    <el-tooltip v-if="scope.audit === 1" content="已审核" placement="top">
                        <i-svg name="audit" size="20px" style="margin-right: 4px"></i-svg>
                    </el-tooltip>
                    <el-tooltip v-if="scope.status === 0" content="草稿" placement="top">
                        <el-icon><Edit /></el-icon>
                    </el-tooltip>
                    <el-tooltip :content="scope.content" :disabled="utils.is.empty(scope.content)" placement="top">
                        <span class="limit-1-line">{{ method.omit(scope?.content, 30) }}</span>
                    </el-tooltip>
                </span>
            </template>

            <template #i-images="{ scope = {} }">
                <div style="display: flex; flex-wrap: wrap; gap: 4px; max-height: 88px; overflow: hidden; align-content: flex-start">
                    <el-image 
                        v-for="(img, index) in method.getImages(scope.images).slice(0, 6)" 
                        :key="index"
                        :src="img" 
                        @click.stop="method.previewImage(img, method.getImages(scope.images))"
                        style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px; cursor: pointer"
                    />
                    <span v-if="method.getImages(scope.images).length > 6" style="line-height: 40px; font-size: 12px">
                        +{{ method.getImages(scope.images).length - 6 }}
                    </span>
                </div>
            </template>

            <template #i-author="{ scope = {} }">
                <div style="display: flex; align-items: center">
                    <el-avatar :src="scope.result?.author?.avatar" size="small" />
                    <span style="margin-left: 8px; font-size: 13px">{{ scope.result?.author?.nickname || '未知' }}</span>
                </div>
            </template>

            <template #i-location="{ scope = {} }">
                <el-tooltip :content="scope.location" :disabled="utils.is.empty(scope.location)" placement="top">
                    <span v-if="scope.location">
                        <i-svg name="location" size="14px" style="margin-right: 2px" />
                        {{ scope.location }}
                    </span>
                    <span v-else>-</span>
                </el-tooltip>
            </template>

            <template #i-status="{ scope = {} }">
                <el-tag :type="scope.status === 1 ? 'success' : 'warning'" size="small">
                    {{ scope.status === 1 ? '已发布' : '草稿' }}
                </el-tag>
            </template>

            <template #i-audit="{ scope = {} }">
                <el-tag :type="scope.audit === 1 ? 'success' : 'info'" size="small">
                    {{ scope.audit === 1 ? '已审核' : '待审核' }}
                </el-tag>
            </template>

        </i-table>

        <el-dialog :title="dialog.title" v-model="dialog.show" width="700px" @closed="method.resetForm">
            <el-form :model="form" label-width="80px">
                <el-form-item label="内容" required>
                    <el-input 
                        v-model="form.content" 
                        type="textarea" 
                        :rows="6" 
                        placeholder="请输入动态内容"
                    />
                </el-form-item>
                <el-form-item label="图片">
                    <el-tabs v-model="dialog.tabs" :stretch="true">
                        <el-tab-pane label="预览" name="preview">
                            <el-upload 
                            class="custom upload" 
                            action="/api/attachment/batch" 
                            :headers="method.headers()" 
                            :multiple="true" 
                            list-type="picture"
                            :on-remove="method.images.remove" 
                            :on-success="method.images.success"
                            :on-error="method.images.error" 
                            :file-list="dialog.images.preview"
                            :data="{ target_type: 'comment' }">
                                <el-button type="primary" style="width: 100%">上传图片</el-button>
                            </el-upload>
                        </el-tab-pane>
                        <el-tab-pane label="外链" name="links">
                            <el-input 
                                v-model="dialog.images.links" 
                                @change="method.images.change" 
                                wrap="off"
                                :autosize="{ minRows: 3, maxRows: 10 }" 
                                placeholder="外链图片地址，一行一个" 
                                type="textarea">
                            </el-input>
                        </el-tab-pane>
                    </el-tabs>
                </el-form-item>
                <el-form-item label="位置">
                    <el-input 
                        v-model="form.location" 
                        placeholder="请输入位置信息"
                        prefix-icon="Location"
                    />
                </el-form-item>
                <el-form-item label="状态">
                    <el-switch 
                        v-model="form.status" 
                        :active-value="1" 
                        :inactive-value="0"
                        active-text="已发布"
                        inactive-text="草稿"
                    />
                </el-form-item>
                <el-form-item label="审核">
                    <el-switch 
                        v-model="form.audit" 
                        :active-value="1" 
                        :inactive-value="0"
                        active-text="已审核"
                        inactive-text="待审核"
                    />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialog.show = false">取消</el-button>
                <el-button type="primary" @click="method.save">保存</el-button>
            </template>
        </el-dialog>

        <el-image-viewer 
            v-if="state.viewer.show" 
            :url-list="state.viewer.list" 
            :initial-index="state.viewer.index"
            @close="state.viewer.show = false"
            append-to-body
        />
    </div>
</template>

<script setup>
import utils from '{src}/utils/utils.js'
import axios from '{src}/utils/request.js'
import cache from '{src}/utils/cache.js'
import ITable from '{src}/comps/custom/i-table.vue'
import { computed, reactive, getCurrentInstance, onMounted, watch, toRaw } from 'vue'
import { ElImageViewer } from 'element-plus'

const emit  = defineEmits(['refresh','update:init'])
const props = defineProps({
    type: {
        type: String,
        default: 'all',
    },
    tableName: {
        type: String,
        default: 'moments'
    },
    params: {
        type: Object,
        default: () => ({
            order: 'id desc',
        }),
    },
    init: {
        type: Boolean,
        default: false,
    }
})

const left = computed(() => utils.is.mobile() ? false : 'left')
const right = computed(() => utils.is.mobile() ? false : 'right')

const { proxy } = getCurrentInstance()
const state  = reactive({
    struct: {},
    viewer: {
        show: false,
        list: [],
        index: 0
    },
    opts: {
        url: `/api/${props.tableName}/all`,
        params: toRaw(props.params),
        columns: [
            { prop: 'content', label: '内容', slot: true, fixed: left },
            { prop: 'images', label: '图片', width: 120, slot: true, align: 'center' },
            { prop: 'author', label: '作者', width: 120, slot: true, align: 'center' },
            { prop: 'location', label: '位置', width: 100, slot: true },
            { prop: 'status', label: '状态', width: 80, slot: true, align: 'center' },
            { prop: 'audit', label: '审核', width: 80, slot: true, align: 'center' },
            { prop: 'create_time', label: '创建时间', width: 180, slot: true, sortable: true },
            { prop: 'update_time', label: '更新时间', width: 180, slot: true, sortable: true },
        ],
    },
})

const dialog = reactive({
    show: false,
    title: '发布动态',
    tabs: 'preview',
    images: {
        preview: [],
        links: ''
    }
})

const form = reactive({
    id: 0,
    content: '',
    location: '',
    status: 1,
    audit: 0,
})

const method = {
    init: async () => {
        await proxy.$refs['i-table'].init()
    },
    headers: () => ({
        Authorization: `Bearer ${cache.get('user-token') || ''}`
    }),
    open: () => {
        dialog.title = '发布动态'
        method.resetForm()
        dialog.show = true
    },
    edit: struct => {
        dialog.title = '编辑动态'
        form.id = struct.id || 0
        form.content = struct.content || ''
        form.location = struct.location || ''
        form.status = struct.status || 1
        form.audit = struct.audit || 0
        const images = method.getImages(struct.images)
        dialog.images.preview = images.map((url, index) => ({
            uid: index,
            name: `image-${index}`,
            status: 'success',
            url: url
        }))
        dialog.images.links = images.join('\n')
        dialog.show = true
    },
    resetForm: () => {
        form.id = 0
        form.content = ''
        form.location = ''
        form.status = 1
        form.audit = 0
        dialog.tabs = 'preview'
        dialog.images.preview = []
        dialog.images.links = ''
    },
    images: {
        remove: (file, fileList) => {
            dialog.images.preview = fileList
            dialog.images.links = fileList.map(item => item.url).join('\n')
        },
        success: (response) => {
            if (response.code === 200) {
                response.data.results.forEach(result => {
                    dialog.images.preview.push({
                        uid: Date.now(),
                        name: result.original_name || 'image',
                        status: 'success',
                        url: result.full_url
                    })
                })
                dialog.images.links = dialog.images.preview.map(item => item.url).join('\n')
            } else {
                ElMessage.error(response.msg || '上传失败')
            }
        },
        error: () => {
            ElMessage.error('上传失败')
        },
        change: () => {
            const links = dialog.images.links.split('\n').filter(item => !utils.is.empty(item))
            dialog.images.preview = links.map((url, index) => ({
                uid: index,
                name: `image-${index}`,
                status: 'success',
                url: url
            }))
        }
    },
    async save() {
        if (utils.is.empty(form.content)) {
            return ElMessage.warning('请输入动态内容')
        }
        const images = dialog.images.links.split('\n').filter(item => !utils.is.empty(item))
        const data = {
            id: form.id > 0 ? form.id : null,
            content: form.content,
            location: form.location,
            images: images.join(','),
            status: form.status,
            audit: form.audit,
        }
        const { code, msg } = await axios.post(`/api/${props.tableName}/save`, data)
        if (code !== 200) return ElMessage.error(msg)
        ElMessage.success(form.id > 0 ? '修改成功！' : '发布成功！')
        dialog.show = false
        emit('refresh', 'all', 'check', 'audit', 'remove')
        await method.init()
    },
    async delete(ids, isSoft = true) {
        if (utils.is.empty(ids)) return
        const idList = Array.isArray(ids) ? ids : [ids]
        const uri = `/api/${props.tableName}/${isSoft ? 'remove' : 'delete'}`
        const { code, msg } = await axios.del(uri, { ids: idList })
        if (code !== 200) return ElMessage.error(msg)
        emit('refresh', 'remove', 'all', 'check', 'audit')
        await method.init()
    },
    async restore(ids) {
        if (utils.is.empty(ids)) return
        const idList = Array.isArray(ids) ? ids : [ids]
        const { code, msg } = await axios.put(`/api/${props.tableName}/restore`, { ids: idList })
        if (code !== 200) return ElMessage.error(msg)
        emit('refresh', 'all', 'check', 'audit')
        await method.init()
    },
    getImages: (images) => {
        if (utils.is.empty(images)) return []
        return images.split(',').filter(img => !utils.is.empty(img))
    },
    previewImage: (url, list) => {
        const index = list.indexOf(url)
        state.viewer.list = list
        state.viewer.index = index >= 0 ? index : 0
        state.viewer.show = true
    },
    omit: (text = null, length = 10, omission = ' ... ', location = 'center') => {
        if (utils.is.empty(text)) return '空'
        return utils.string.omit(text, length, omission, location)
    },
    formatTime: (timestamp) => {
        if (!timestamp || timestamp === 0) return '无数据'
        const time = timestamp.toString().length === 10 ? timestamp * 1000 : timestamp
        const date = new Date(time)
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

defineExpose({
    init: method.init,
    open: method.open,
})
</script>
