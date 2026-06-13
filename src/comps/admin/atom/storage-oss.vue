<template>
    <el-card v-loading="state.status.loading" style="margin-bottom: 1rem">
        <template #header>
            <div class="card-header-content">
                <i-svg name="aliyun" color="rgb(var(--assist-color))" size="60px" style="position: absolute; right: 1.5rem; opacity: 0.25"></i-svg>
                <el-tooltip placement="top">
                    <template #content>
                        ● 阿里云对象存储OSS可以替代传统的本地存储，有能力的情况推荐开启OSS存储<br>
                        ● 开启后，后续上传的文件将会自动上传到OSS，不会占用服务器的空间和带宽
                    </template>
                    <span style="display: inline-flex; align-items: center">
                        <i-svg name="hint" color="rgb(var(--icon-color))" size="14px"></i-svg>
                        <span style="margin-left: 0.25rem">阿里云对象存储</span>
                    </span>
                </el-tooltip>
            </div>
        </template>
        <template #default>
            <div style="display: flex; align-items: center; justify-content: space-between">
                <el-switch v-model="state.status.active" v-on:change="method.change" :disabled="!state.status.finish"
                           active-text="开始" inactive-text="关闭">
                </el-switch>
                <div style="display: flex; align-items: center; gap: 0.5rem">
                    <el-tag type="warning">推荐</el-tag>
                    <span style="color: var(--el-text-color-secondary)">
                        这个还不错，<span v-on:click="method.show()" style="color: var(--el-text-color-primary); cursor: pointer">点我配置</span>
                    </span>
                </div>
            </div>
        </template>
    </el-card>

    <el-dialog v-model="state.status.dialog" class="custom" draggable :close-on-click-modal="false">
        <template #header>
            <strong style="display: flex; align-items: center; justify-content: center">配置 阿里云OSS 存储</strong>
        </template>
        <template #default>
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item label="AccessKey ID">
                        <el-tooltip content="阿里云 AccessKey ID" placement="top">
                            <span>
                                <i-svg name="hint" size="14px"></i-svg>
                                <span style="margin-left: 0.25rem">AccessKey ID：</span>
                            </span>
                        </el-tooltip>
                        <el-input v-model="state.struct.access_key_id" show-password></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="AccessKey Secret">
                        <el-tooltip content="阿里云AccessKey Secret" placement="top">
                            <span>
                                <i-svg name="hint" size="14px"></i-svg>
                                <span style="margin-left: 0.25rem">AccessKey Secret：</span>
                            </span>
                        </el-tooltip>
                        <el-input v-model="state.struct.access_key_secret" show-password></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="Endpoint">
                        <el-tooltip content="OSS 外网 Endpoint" placement="top">
                            <span>
                                <i-svg name="hint" size="14px"></i-svg>
                                <span style="margin-left: 0.25rem">Endpoint：</span>
                            </span>
                        </el-tooltip>
                        <el-select v-model="state.struct.endpoint" placeholder="请选择所在地区" style="display: block" class="custom" placeholder-class="font-13">
                            <el-option v-for="item in state.select.endpoint" :key="item.value" :label="item.label" :value="item.value">
                                <span style="font-size: 13px">{{ item.label }}</span>
                                <small style="color: var(--el-text-color-secondary); float: right">{{ item.value }}</small>
                            </el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="OSS Bucket">
                        <el-tooltip content="存储桶名称" placement="top">
                            <span>
                                <i-svg name="hint" size="14px"></i-svg>
                                <span style="margin-left: 0.25rem">OSS Bucket：</span>
                            </span>
                        </el-tooltip>
                        <el-input v-model="state.struct.bucket"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="存储目录">
                        <el-tooltip content="存储在哪个目录下" placement="top">
                            <span>
                                <i-svg name="hint" size="14px"></i-svg>
                                <span style="margin-left: 0.25rem">存储目录：</span>
                            </span>
                        </el-tooltip>
                        <el-input v-model="state.struct.path" placeholder="如: inis"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="24">
                    <el-form-item label="OSS 外网域名">
                        <el-tooltip content="用于访问 - 不填写则使用默认域名" placement="top">
                            <span>
                                <i-svg name="hint" size="14px"></i-svg>
                                <span style="margin-left: 0.25rem">OSS 外网域名：</span>
                            </span>
                        </el-tooltip>
                        <el-input v-model="state.struct.domain"></el-input>
                    </el-form-item>
                </el-col>
            </el-row>
        </template>
        <template #footer>
            <el-button v-on:click="state.status.dialog = false">取 消</el-button>
            <el-button v-on:click="method.test()" :loading="state.status.test">
                <i-svg v-if="!state.status.test" name="connect" size="14px"></i-svg>
                <span style="margin-left: 0.25rem">测试连接</span>
            </el-button>
            <el-button v-on:click="method.save()" :loading="state.status.wait">保 存</el-button>
        </template>
    </el-dialog>
</template>

<script setup>
import utils from '{src}/utils/utils.js'
import axios from '{src}/utils/request.js'

const { ctx, proxy } = getCurrentInstance()
const emit  = defineEmits(['refresh'])
const state = reactive({
    struct: {
        path:              'inis',
        default:           null,
        domain:            null,
        bucket:            null,
        endpoint:          null,
        access_key_id:     null,
        access_key_secret: null,
    },
    status: {
        active: true,
        finish: false,
        dialog: false,
        loading: true,
        wait: false,
        test: false,
    },
    backup: {},
    select: {
        endpoint: [
            { value: 'oss-cn-hangzhou.aliyuncs.com', label: '华东1（杭州）' },
            { value: 'oss-cn-shanghai.aliyuncs.com', label: '华东2（上海）' },
            { value: 'oss-cn-nanjing.aliyuncs.com', label: '华东5（南京-本地地域）' },
            { value: 'oss-cn-fuzhou.aliyuncs.com', label: '华东6（福州-本地地域）' },
            { value: 'oss-cn-qingdao.aliyuncs.com', label: '华北1（青岛）' },
            { value: 'oss-cn-beijing.aliyuncs.com', label: '华北2（北京）' },
            { value: 'oss-cn-zhangjiakou.aliyuncs.com', label: '华北 3（张家口）' },
            { value: 'oss-cn-huhehaote.aliyuncs.com', label: '华北5（呼和浩特）' },
            { value: 'oss-cn-wulanchabu.aliyuncs.com', label: '华北6（乌兰察布）' },
            { value: 'oss-cn-shenzhen.aliyuncs.com', label: '华南1（深圳）' },
            { value: 'oss-cn-heyuan.aliyuncs.com', label: '华南2（河源）' },
            { value: 'oss-cn-guangzhou.aliyuncs.com', label: '华南3（广州）' },
            { value: 'oss-cn-chengdu.aliyuncs.com', label: '西南1（成都）' },
            { value: 'oss-cn-hongkong.aliyuncs.com', label: '中国香港' },
            { value: 'oss-us-west-1.aliyuncs.com', label: '美国（硅谷）①' },
            { value: 'oss-us-east-1.aliyuncs.com', label: '美国（弗吉尼亚）①' },
            { value: 'oss-ap-northeast-1.aliyuncs.com', label: '日本（东京）①' },
            { value: 'oss-ap-northeast-2.aliyuncs.com', label: '韩国（首尔）' },
            { value: 'oss-ap-southeast-1.aliyuncs.com', label: '新加坡①' },
            { value: 'oss-ap-southeast-2.aliyuncs.com', label: '澳大利亚（悉尼）①' },
            { value: 'oss-ap-southeast-3.aliyuncs.com', label: '马来西亚（吉隆坡）①' },
            { value: 'oss-ap-southeast-5.aliyuncs.com', label: '印度尼西亚（雅加达）①' },
            { value: 'oss-ap-southeast-6.aliyuncs.com', label: '菲律宾（马尼拉）' },
            { value: 'oss-ap-southeast-7.aliyuncs.com', label: '泰国（曼谷）' },
            { value: 'oss-ap-south-1.aliyuncs.com', label: '印度（孟买）①' },
            { value: 'oss-eu-central-1.aliyuncs.com', label: '德国（法兰克福）①' },
            { value: 'oss-eu-west-1.aliyuncs.com', label: '英国（伦敦）' },
            { value: 'oss-me-east-1.aliyuncs.com', label: '阿联酋（迪拜）①' },
            { value: 'oss-rg-china-mainland.aliyuncs.com', label: '无地域属性（中国内地）' },
            { value: 'oss-cn-hzfinance.aliyuncs.com', label: '杭州金融云公网' },
            { value: 'oss-cn-shanghai-finance-1-pub.aliyuncs.com', label: '上海金融云公网' },
            { value: 'oss-cn-szfinance.aliyuncs.com', label: '深圳金融云公网' },
            { value: 'oss-cn-beijing-finance-1-pub.aliyuncs.com', label: '北京金融云公网' },
        ],
    },
})

onMounted(async () => {
    await method.init()
})

const method = {
    init: async () => {

        state.status.finish  = false
        state.status.loading = true

        const { code, data } = await axios.get('/api/toml/storage', {
            name: 'oss'
        })

        state.status.loading = false

        if (code !== 200) return
        state.struct = data

        // 拷贝一份备份
        state.backup = JSON.parse(JSON.stringify(data))

        state.status.finish  = true
    },
    show() {
        if (!state.status.finish) return ElMessage.warning('存储配置获取失败，无法进行配置！')
        state.status.dialog = true
    },
    change: async value => {

        if (!value) return state.status.active = true

        const { code, msg } = await axios.put('/api/toml/storage-default', {
            value: value ? 'oss' : null
        })

        if (code === 200) return emit('refresh')

        state.status.active = !value
        ElMessage.error(msg)
    },
    save: async () => {

        let field = ['access_key_id', 'access_key_secret', 'endpoint', 'bucket']

        // 检查关键配置是否有变化
        if (!utils.object.equal(state.struct, state.backup, field)) return ElMessage.warning('请先OSS连接测试')

        if (utils.is.empty(state.struct.access_key_id))     return ElMessage.warning('请填写 AccessKey ID！')
        if (utils.is.empty(state.struct.access_key_secret)) return ElMessage.warning('请填写 AccessKey Secret！')
        if (utils.is.empty(state.struct.endpoint))          return ElMessage.warning('请填写 Endpoint！')
        if (utils.is.empty(state.struct.bucket))            return ElMessage.warning('请填写 Bucket！')

        state.status.wait   = true

        const { code, msg } = await axios.put('/api/toml/storage-oss', state.struct)

        state.status.wait   = false

        if (code !== 200) return ElMessage.error('保存失败：' + msg)
        
        ElMessage.success('保存成功')
        state.status.dialog = false
    },
    test: async () => {

        if (utils.is.empty(state.struct.access_key_id))     return ElMessage.warning('请填写 AccessKey ID！')
        if (utils.is.empty(state.struct.access_key_secret)) return ElMessage.warning('请填写 AccessKey Secret！')
        if (utils.is.empty(state.struct.endpoint))          return ElMessage.warning('请填写 Endpoint！')
        if (utils.is.empty(state.struct.bucket))            return ElMessage.warning('请填写 Bucket！')

        state.status.test         = true

        const { code, msg, data } = await axios.post('/api/toml/test-oss', state.struct)

        state.status.test         = false

        if (code === 200) {
            // 拷贝一份备份
            state.backup = JSON.parse(JSON.stringify(state.struct))
            return ElMessage.success(msg)
        }

        ElMessage.error(`${msg}<br>${data}`)
    },
}

watch(() => state.struct, () => {
    state.status.active = state.struct.default === 'oss'
}, { deep: true })

// 将子组件方法暴露给父组件
defineExpose({
    init: method.init,
})
</script>