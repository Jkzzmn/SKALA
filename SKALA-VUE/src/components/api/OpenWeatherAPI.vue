<script setup>
import {ref} from 'vue'
import axios from 'axios'

const weatherData = ref(null)
const isLoading = ref(false)

const handlerFetchWeather = async () => {
    isLoading.value = true

    const API_KEY = '795a0c7930fa891649f8a7659475d2d6'
    const URL = `https://api.openweathermap.org/data/2.5/weather?lat=35.158582&lon=126.804975&appid=${API_KEY}&units=metric&lang=kr`

    try{
        const response = await axios.get(URL)
        weatherData.value = response.data
    }catch(error){
        alert('응답 실패')
    } finally{
        isLoading.value = true
    }
}
</script>

<template>
    <div class="axios검증">
        <h2>axios 통신 검증</h2>
        <button @click="handlerFetchWeather" :disabled="isLoading">
            {{ isLoading ? '데이터 로딩중 ... ' : '실시간 날씨 데이터 당겨오기'}}
        </button>
        <div v-if="weatherData" class="weatherResult">
            <p>위치 : {{ weatherData.name }}</p>
            <p>현재 기온 : {{ weatherData.main.temp }}</p>
            <p>날씨 : {{ weatherData.weather[0].description }}</p>
            <p>습도 : {{ weatherData.main.humidity }}%</p>
        </div>
        <div v-else>
            <p>아직 가져온 데이터가 없습니다.</p>
        </div>
    </div>
</template>