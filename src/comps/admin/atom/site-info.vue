<template>
    <el-card v-loading="state.status.loading" style="margin-bottom: 1rem; cursor: pointer" v-on:click="method.show()">
        <template #header>
            <div class="card-header-content">
                <i-svg name="site" color="rgb(var(--assist-color))" size="50px" style="position: absolute; right: 2rem; opacity: 0.25"></i-svg>
                <el-tooltip content="（点击卡片配置）站点信息，如：备案号、头像、favicon、关键词和描述等" placement="top">
                    <span style="display: inline-flex; align-items: center">
                        <i-svg name="hint" color="rgb(var(--icon-color))" size="14px"></i-svg>
                        <span style="margin-left: 0.25rem">站点信息</span>
                    </span>
                </el-tooltip>
            </div>
        </template>
        <template #default>
            <div style="display: flex">
                <span style="display: flex; align-items: center; justify-content: center; position: relative; width: 60px; height: 60px">
                    <i-lottie name="avatar/crane" v-model="state.item.avatar" width="65px" height="65px" style="z-index: 9"></i-lottie>
                    <el-avatar :src="state.struct.json.avatar" :size="52" style="top: 7px; left: 2px; box-shadow: var(--el-box-shadow-light); position: absolute"></el-avatar>
                </span>
                <div style="display: flex; flex-direction: column; justify-content: center; margin-left: 0.5rem">
                    <span style="font-size: 18px; color: var(--el-text-color-primary); display: flex; align-items: center">
                        <span style="color: var(--el-text-color-primary); font-size: 16px; margin-right: 0.5rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 200px">{{ state.struct.json.title }}</span>
                    </span>
                    <small style="color: var(--el-text-color-secondary); overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical">{{ state.struct.json.description || '这个人很懒，什么都没留下！' }}</small>
                </div>
            </div>
        </template>
    </el-card>

    <el-dialog v-model="state.status.dialog" class="custom" draggable :close-on-click-modal="false">
        <template #header>
            <strong style="display: flex; align-items: center; justify-content: center">站 点 信 息 配 置</strong>
        </template>
        <template #default>
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item label="ICP 备案码">
                        <el-tooltip content="ICP备案码" placement="top">
                            <span>
                                <i-svg color="rgb(var(--icon-color))" name="hint" size="14px"></i-svg>
                                <span style="margin-left: 0.25rem">ICP 备案码：</span>
                            </span>
                        </el-tooltip>
                        <el-input v-model="state.struct.json.copy.code" placeholder="ICP备案码"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="ICP 备案链接">
                        <el-tooltip content="工信部网址，如：https://beian.miit.gov.cn" placement="top">
                            <span>
                                <i-svg color="rgb(var(--icon-color))" name="hint" size="14px"></i-svg>
                                <span style="margin-left: 0.25rem">ICP 备案链接：</span>
                            </span>
                        </el-tooltip>
                        <el-input v-model="state.struct.json.copy.link" placeholder="如：https://beian.miit.gov.cn"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="公安备案码">
                        <el-tooltip content="公安备案码" placement="top">
                            <span>
                                <i-svg color="rgb(var(--icon-color))" name="hint" size="14px"></i-svg>
                                <span style="margin-left: 0.25rem">公安备案码：</span>
                            </span>
                        </el-tooltip>
                        <el-input v-model="state.struct.json.police.code" placeholder="公安备案码"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="公安备案链接">
                        <el-tooltip content="公安备案网址，如：https://www.beian.gov.cn" placement="top">
                            <span>
                                <i-svg color="rgb(var(--icon-color))" name="hint" size="14px"></i-svg>
                                <span style="margin-left: 0.25rem">公安备案链接：</span>
                            </span>
                        </el-tooltip>
                        <el-input v-model="state.struct.json.police.link" placeholder="如：https://www.beian.gov.cn"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="站点头像">
                        <el-tooltip content="本站点的头像" placement="top">
                            <span>
                                <i-svg color="rgb(var(--icon-color))" name="hint" size="14px"></i-svg>
                                <span style="margin-left: 0.25rem">站点头像：</span>
                            </span>
                        </el-tooltip>
                        <el-input v-model="state.struct.json.avatar" class="custom" placeholder="填写图片地址或点击上传">
                            <template #append>
                                <el-button v-on:click="method.upload('avatar')" :loading="state.upload.avatar">
                                    <i-svg v-if="!state.upload.avatar" name="upload" color="rgb(var(--icon-color))" size="14px"></i-svg>
                                    <span style="margin-left: 0.25rem">上传</span>
                                </el-button>
                            </template>
                        </el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="favicon">
                        <el-tooltip content="本站点的小图标" placement="top">
                            <span>
                                <i-svg color="rgb(var(--icon-color))" name="hint" size="14px"></i-svg>
                                <span style="margin-left: 0.25rem">favicon：</span>
                            </span>
                        </el-tooltip>
                        <el-input v-model="state.struct.json.favicon" class="custom" placeholder="填写图片地址或点击上传">
                            <template #append>
                                <el-button v-on:click="method.upload('favicon')" :loading="state.upload.favicon">
                                    <i-svg v-if="!state.upload.favicon" name="upload" color="rgb(var(--icon-color))" size="14px"></i-svg>
                                    <span style="margin-left: 0.25rem">上传</span>
                                </el-button>
                            </template>
                        </el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="站点标题">
                        <el-tooltip content="站点标题，如：米哈游" placement="top">
                            <span>
                                <i-svg color="rgb(var(--icon-color))" name="hint" size="14px"></i-svg>
                                <span style="margin-left: 0.25rem">站点标题：</span>
                            </span>
                        </el-tooltip>
                        <el-input v-model="state.struct.json.title"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="关键词">
                        <el-tooltip content="网站关键词，主要用于SEO场景，有助于收录" placement="top">
                            <span>
                                <i-svg color="rgb(var(--icon-color))" name="hint" size="14px"></i-svg>
                                <span style="margin-left: 0.25rem">关键词：</span>
                            </span>
                        </el-tooltip>
                        <el-select v-model="state.item.keyword" :reserve-keyword="false" default-first-option collapse-tags-tooltip
                            allow-create multiple filterable collapse-tags style="display: block" class="custom" placeholder-class="font-13" placeholder="请输入站点关键词">
                            <el-option v-for="(item, index) in state.item.keyword" :key="index" :label="item" :value="item"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="运营时间">
                        <el-tooltip content="本网站运营的开始时间" placement="top">
                            <span>
                                <i-svg color="rgb(var(--icon-color))" name="hint" size="14px"></i-svg>
                                <span style="margin-left: 0.25rem">运营时间：</span>
                            </span>
                        </el-tooltip>
                        <el-date-picker v-model="state.struct.json.date" type="date" format="YYYY-MM-DD" value-format="X" style="display: block; width: 100%" class="custom" placeholder="请选择本站开设的时间">
                        </el-date-picker>
                    </el-form-item>
                </el-col>
                <el-col :span="24">
                    <el-form-item label="站点描述">
                        <el-tooltip content="网站描述，主要用于SEO场景，有助于收录" placement="top">
                            <span>
                                <i-svg color="rgb(var(--icon-color))" name="hint" size="14px"></i-svg>
                                <span style="margin-left: 0.25rem">站点描述：</span>
                            </span>
                        </el-tooltip>
                        <el-input v-model="state.struct.json.description" :autosize="{ minRows: 1, maxRows: 10 }" placeholder="站点描述！" type="textarea"></el-input>
                    </el-form-item>
                </el-col>
            </el-row>
        </template>
        <template #footer>
            <el-button v-on:click="state.status.dialog = false">取 消</el-button>
            <el-button v-on:click="method.save()" :loading="state.status.wait">保 存</el-button>
        </template>
    </el-dialog>
</template>

<script setup>
import cache from '{src}/utils/cache'
import utils from '{src}/utils/utils'
import axios from '{src}/utils/request'

const emit = defineEmits(['refresh'])
const { ctx, proxy } = getCurrentInstance()
const state = reactive({
    item: {
        avatar: true,
        keyword: ''
    },
    struct: {
        key: 'SITE_INFO',
        json: {
            title: '',
            avatar: '',
            favicon: '',
            copy: {
                code: '',
                link: '',
            },
            police: {
                code: '',
                link: '',
            },
            date: '',
            keyword: '',
            description: '',
        },
        remark: '站点信息',
    },
    status: {
        finish: false,
        loading: true,
        dialog: false,
        wait: false
    },
    upload: {
        avatar: false,
        favicon: false,
    }
})

onMounted(async () => {
    await method.init()
})

const method = {
    init: async () => {

        state.status.finish  = false
        state.status.loading = true

        const { code, data } = await axios.get('/api/config/one', {
            key: 'SITE_INFO'
        })

        state.status.loading = false

        if (code === 204) return  method.save()
        if (code !== 200) return
        state.struct = utils.object.deep.merge(state.struct, data)

        // 处理关键词
        if (data.json.keyword) {
            state.item.keyword = data.json.keyword.split(',')
        }

        state.status.finish  = true
    },
    show() {
        if (!state.status.finish) return ElMessage.warning('配置获取失败，无法进行配置！')
        state.status.dialog = true
    },
    save: async () => {

        state.status.wait   = true

        const { code, msg } = await axios.post('/api/config/save', {
            ...state.struct,
            json: JSON.stringify(state.struct.json)
        })

        state.status.wait   = false

        if (code !== 200) return ElMessage.error('保存失败：' + msg)

        state.status.dialog = false
        ElMessage.success('保存成功')

        // 删除本地缓存
        cache.del('site-info')
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

            state.upload[field]       = true
            // 上传图片
            const { code, msg, data } = await axios.post('/api/file/upload', params)

            state.upload[field]       = false

            if (code !== 200) return ElMessage.error(msg)
            // 设置图片
            state.struct.json[field] = data.path
            // 清空 input
            input.value = ''
            ElMessage.info('上传成功！')
        })

        // 触发 input 的 click 事件
        input.click()
    },
}

watch(() => state.item.keyword, value => {
    state.struct.json.keyword = !value ? '' : value.join(',')
})

// 将子组件方法暴露给父组件
defineExpose({
    init: method.init,
})
</script>