<script setup>
import { useConfigStore } from '../../stores/configStore';

const configStore = useConfigStore()
</script>

<template>
    <span>날씨단위 : </span><span v-if="configStore.isFahrenheit">°F (화씨)</span><span v-else>°C (섭씨)</span>
    <button @click="configStore.toggleUnit">단위변경</button>
</template>