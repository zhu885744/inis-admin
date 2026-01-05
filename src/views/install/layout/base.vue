<template>

    <i-index></i-index>

</template>

<script setup>
import '{src}/assets/css/app.min.css'
import '{src}/assets/css/media.min.css'
import '{src}/assets/css/theme.min.css'
import iIndex from '{src}/views/install/pages/index.vue'

nextTick(()=>{
    const theme = 'white'
    const body  = document.querySelector('body')
    body.setAttribute('data-layout', 'topnav')
    body.setAttribute('inis-theme', theme)
    body.classList.add('user-select-none')
    // 给 app 添加一个 class
    const app = document.querySelector('#app')
    app.classList.add('install')
})
</script>