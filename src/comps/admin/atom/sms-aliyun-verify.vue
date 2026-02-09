<template>
  <div v-loading="state.status.loading" class="card mb-3">
    <div class="card-body">
      <i-svg name="aliyun" color="rgb(var(--assist-color))" size="60px" class="position-absolute opacity-25" style="right: 1.5rem"></i-svg>
      <h6 class="text-muted text-uppercase mt-0">
        <el-tooltip placement="top">
          <template #content>
            ● 阿里云号码认证<br>
            ● 注册、登录、找回密码、通知等功能都需要依赖此服务<br>
            ● 号码认证：无需认证，无需资质，个人、企业都可以使用，接入简单，但只能使用阿里云自动分配的短信签名
          </template>
          <span class="d-inline-flex align-items-center">
            <i-svg name="hint" color="rgb(var(--icon-color))" size="14px"></i-svg>
            <span class="ms-1">阿里云号码认证</span>
          </span>
        </el-tooltip>
      </h6>
      <h2 class="m-b-20">
        <el-switch v-model="state.status.active" v-on:change="method.change" :disabled="!state.status.finish"
                   active-text="开启" inactive-text="关闭">
        </el-switch>
      </h2>
      <span class="badge bg-success font-white"> 蛮好用的 </span>
      <span class="text-muted">
        个人、企业都可以使用，<span v-on:click="method.show()" class="text-dark pointer">点我配置</span>
      </span>
    </div>
  </div>

  <el-dialog v-model="state.status.dialog" class="custom" draggable :close-on-click-modal="false">
    <template #header>
      <strong class="flex-center">配置阿里云号码验证服务</strong>
    </template>
    <template #default>
      <div class="row">
        <div class="col-md-6">
          <div class="form-group mb-3">
            <label class="form-label required">
              <el-tooltip content="阿里云 AccessKey ID" placement="top">
                <span>
                  <i-svg name="hint" size="14px"></i-svg>
                  <span class="ms-1">AccessKey ID：</span>
                </span>
              </el-tooltip>
            </label>
            <el-input v-model="state.struct.access_key_id" show-password></el-input>
          </div>
        </div>
        <div class="col-md-6">
          <div class="form-group mb-3">
            <label class="form-label required">
              <el-tooltip content="阿里云 AccessKey Secret" placement="top">
                <span>
                  <i-svg name="hint" size="14px"></i-svg>
                  <span class="ms-1">AccessKey Secret：</span>
                </span>
              </el-tooltip>
            </label>
            <el-input v-model="state.struct.access_key_secret" show-password></el-input>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-md-6">
          <div class="form-group mb-3">
            <label class="form-label required">
              <el-tooltip content="阿里云号码验证服务 endpoint" placement="top">
                <span>
                  <i-svg name="hint" size="14px"></i-svg>
                  <span class="ms-1">endpoint：</span>
                </span>
              </el-tooltip>
            </label>
            <el-input v-model="state.struct.endpoint"></el-input>
          </div>
        </div>
        <div class="col-md-6">
          <div class="form-group mb-3">
            <label class="form-label required">
              <el-tooltip content="短信签名，如：速通互联验证码" placement="top">
                <span>
                  <i-svg name="hint" size="14px"></i-svg>
                  <span class="ms-1">短信签名：</span>
                </span>
              </el-tooltip>
            </label>
            <el-input v-model="state.struct.sign_name"></el-input>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-md-6">
          <div class="form-group mb-3">
            <label class="form-label required">
              <el-tooltip content="号码验证模板ID，请填：100001" placement="top">
                <span>
                  <i-svg name="hint" size="14px"></i-svg>
                  <span class="ms-1">模板ID：</span>
                </span>
              </el-tooltip>
            </label>
            <el-input v-model="state.struct.template_code"></el-input>
          </div>
        </div>
        <div class="col-md-6">
          <div class="form-group mb-3">
            <label class="form-label">
              <el-tooltip content="用于测试接收验证信息的手机号" placement="top">
                <span>
                  <i-svg name="hint" size="14px"></i-svg>
                  <span class="ms-1">测试手机号：</span>
                </span>
              </el-tooltip>
            </label>
            <el-input v-model="state.struct.phone" v-on:keydown.enter="method.test()" class="custom" placeholder="请输入手机号">
              <template #append>
                <el-button v-on:click="method.test()" :loading="state.status.test">
                  <i-svg v-if="!state.status.test" name="phone" size="14px"></i-svg>
                  <span class="ms-1">测试验证服务</span>
                </el-button>
              </template>
            </el-input>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <el-button v-on:click="state.status.dialog = false">取 消</el-button>
      <el-button v-on:click="method.save()" :loading="state.status.wait" type="primary">保 存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import utils from '{src}/utils/utils.js'
import axios from '{src}/utils/request.js'

const { ctx, proxy } = getCurrentInstance()
const emit = defineEmits(['refresh'])
const state = reactive({
  struct: {
    access_key_id: null,
    access_key_secret: null,
    endpoint: null,
    sign_name: null,
    template_code: null,
    phone: null,
    drive: {
      sms: null,
      default: null,
    },
  },
  status: {
    finish: false,
    active: false,
    dialog: false,
    loading: true,
    wait: false,
    test: false,
  },
  backup: {}
})

onMounted(async () => {
  await method.init()
})

const method = {
  // 初始化配置
  init: async () => {
    state.status.finish = false
    state.status.loading = true

    const { code, data } = await axios.get('/api/toml/sms', {
      name: 'aliyun_number_verify'
    })

    state.status.loading = false

    if (code !== 200) return
    state.struct = data
    // 拷贝备份
    state.backup = JSON.parse(JSON.stringify(data))
    // 驱动状态同步
    state.status.active = data.drive.sms === 'aliyun_number_verify'

    state.status.finish = true
  },
  // 显示配置弹窗
  show() {
    if (!state.status.finish) return ElMessage.warning('号码验证配置获取失败，无法进行配置！')
    state.status.dialog = true
  },
  // 切换启用状态
  change: async value => {
    const { code, msg } = await axios.put('/api/toml/sms-drive', {
      sms: value ? 'aliyun_number_verify' : ''
    })

    if (code === 200) return emit('refresh', 'sms-aliyun', 'sms-tencent')

    state.status.active = !value
    ElMessage.error(msg)
  },
  // 保存配置
  save: async () => {
    let field = ['access_key_id', 'access_key_secret', 'endpoint', 'sign_name', 'template_code']
    // 关键配置校验
    for (let key of field) {
      if (utils.is.empty(state.struct[key])) {
        return ElMessage.warning(`${key} 不能为空！`)
      }
    }

    state.status.wait = true

    const { code, msg } = await axios.put('/api/toml/sms-aliyun-number-verify', state.struct)

    state.status.wait = false

    if (code !== 200) return ElMessage.error(`保存失败：${msg}`)

    ElMessage.success('保存成功')
    state.status.dialog = false
    // 刷新配置
    await method.init()
  },
  // 测试号码验证服务
  test: async () => {
    if (utils.is.empty(state.struct.phone)) {
      return ElMessage.warning('测试手机号不能为空！')
    }
    if (!utils.is.phone(state.struct.phone)) {
      return ElMessage.warning('手机号格式不正确！')
    }

    // 必传参数校验
    let checkField = ['access_key_id', 'access_key_secret', 'endpoint', 'sign_name', 'template_code']
    for (let key of checkField) {
      if (utils.is.empty(state.struct[key])) {
        return ElMessage.warning(`${key} 不能为空！`)
      }
    }

    state.status.test = true

    const { code, data, msg } = await axios.post('/api/toml/test-sms-aliyun-number-verify', state.struct)

    state.status.test = false

    if (code !== 200) return ElMessage.error(`测试失败：${msg || data}`)

    ElMessage.success(`测试成功！验证码：${data.verify_code || '已发送'}`)
  },
}

defineExpose({ init: method.init })

watch(() => state.struct, () => {
  // 仅允许字母、数字、特殊字符（沿用JWT配置的校验逻辑）
}, { deep: true })
</script>