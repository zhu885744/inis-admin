<script setup>
import utils from '{src}/utils/utils'

const { ctx, proxy } = getCurrentInstance()
nextTick(() => {
    /* 鼠标样式 */
    const pointer = proxy.$refs['pointer']
    const width   = pointer.offsetWidth / 2

    // 获取当前滚动条高度
    const getScrollTop = () => {
        let result = 0
        if (document.documentElement && document.documentElement.scrollTop) {
            result = document.documentElement.scrollTop
        } else if (document.body) {
            result = document.body.scrollTop
        }
        return result
    }

    const setPosition = (x, y) => {
        pointer.style.transform = `translate(${x - width + 1}px, ${getScrollTop() + y - width + 1}px)`
    }

    const body = document.querySelector('body')
    body.addEventListener('mousemove', e => window.requestAnimationFrame(() => {
        setPosition(e.clientX, e.clientY)
    }))

    const loading = document.querySelector('#loading-box')
    // 移除开屏动画
    if (loading) setTimeout(() => loading.classList.add('loaded'), 500)

    const cover = proxy.$refs['cover']
    // 删除与背景图相关的过渡逻辑（若依赖state.cover）
    cover.style.setProperty('opacity', 0)
    cover.style.setProperty('transition', 'all 1.5s ease 0s')

    // 移动端去除鼠标样式
    if (Boolean(window.navigator.userAgent.match(/AppWebKit.*Mobile.*/))) {
        pointer.style.display = 'none'
    }

    // 监听滚动条（保持不变）
    window.onscroll = () => {
        let [defer, execute] = [null, true]
        let y = window.pageYOffset !== undefined ?  window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
        const goToTop = proxy.$refs['go-to-top']
        goToTop.style.setProperty('display', y > 300 ? 'block' : 'none', 'important')
        
        goToTop.addEventListener('click',() => {
            execute = true
            defer = setTimeout(() => {
                if (execute) utils.to.scroll(0)
            }, 150)
        })
        
        goToTop.addEventListener('dblclick',() => {
            clearTimeout(defer)
            execute = false
            utils.to.scroll(scrollButtom())
        })

        const scrollButtom = () => {
            let clientHeight = 0
            if (document.body.clientHeight && document.documentElement.clientHeight) {
                clientHeight = document.body.clientHeight < document.documentElement.clientHeight ? document.body.clientHeight : document.documentElement.clientHeight
            } else {
                clientHeight = document.body.clientHeight > document.documentElement.clientHeight ? document.body.clientHeight : document.documentElement.clientHeight
            }
            let scrollHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)
            return scrollHeight - clientHeight
        }
    }
})
</script>