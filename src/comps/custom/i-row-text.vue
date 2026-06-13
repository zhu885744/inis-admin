<template>
    <div class="row-text" style="margin-top: 12px; margin-bottom: 12px">
        <div :class="'col-' + props.row[0]">
            <slot name="title">
                <span style="font-size: 14px">{{ props.title }}</span>
            </slot>
        </div>
        <div :class="'value-col col-' + props.row[1]">
            <slot name="value">
                <span style="font-size: 14px">{{ props.value || '无' }}</span>
            </slot>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    row: {
        type: Array,
        default: [2, 10],
    },
    title: {
        type: String,
        default: '',
    },
    value: {
        type: String,
        default: '',
    },
})
</script>

<style lang="css" scoped>
.row-text {
    display: flex;
    margin: 0.75rem 0;
}
.row-text > div {
    display: flex;
    align-items: center;
}
.value-col {
    display: flex;
    align-items: center;
}
.font-14 {
    font-size: 14px;
}
.my-3 {
    margin-top: 0.75rem;
    margin-bottom: 0.75rem;
}
</style>