<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useConfigStore } from '../stores/configStore.js'


const configStore = useConfigStore()

const route = useRoute()
const router = useRouter()

const cityData = ref(null)

onMounted(() => {
  const id = route.params.id
  cityData.value = configStore.getCityById(id)
})

const goMain = () => {
    router.back()
}

</script>

<template>
    <div class="detailView">
        <h1>지역별 상세 기상 관측 정보</h1>
        <div class="deatailContent" v-if="cityData">
            <p>📍지정지역 : {{ cityData.name }}</p>
            <p v-if="!configStore.isFahrenheit"> 실시간 온도 : {{ cityData.temp }}°C</p>
            <p v-else>실시간 온도 : {{ configStore.toFahrenheit(cityData.temp) }}°F</p>
            <p>기상현황 : {{ cityData.status }}</p>
        </div>
        <div v-else>
            <p>해당 지역 정보가 없습니다.</p>
        </div>
        <button @click="goMain">메인으로 돌아가기</button>
    </div>
</template>