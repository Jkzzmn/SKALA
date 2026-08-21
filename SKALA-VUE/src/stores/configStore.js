import {ref} from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

export const useConfigStore = defineStore('config', () => {
    const weatherList = ref([
        { id: 'city_01', name: '서울', q: 'Seoul,KR' },
        { id: 'city_02', name: '도쿄', q: 'Tokyo,JP' },
        { id: 'city_03', name: '뉴욕', q: 'New York,US' },
        { id: 'city_04', name: '런던', q: 'London,GB' },
        { id: 'city_05', name: '파리', q: 'Paris,FR' },
        { id: 'city_06', name: '시드니', q: 'Sydney,AU' },
        { id: 'city_07', name: '방콕', q: 'Bangkok,TH' },
        { id: 'city_08', name: '로마', q: 'Rome,IT' },
        { id: 'city_09', name: '토론토', q: 'Toronto,CA' },
        { id: 'city_10', name: '베를린', q: 'Berlin,DE' }
    ])
    async function fetchWeather(city){
        const API_KEY = '795a0c7930fa891649f8a7659475d2d6'
        const URL =`https://api.openweathermap.org/data/2.5/weather?q=${city.q}&appid=${API_KEY}&units=metric&lang=kr`

        const response = await axios.get(URL)
        city.temp = response.data.main.temp
        city.status = response.data.weather[0].description
    }
    function fetchAllWeather(){
        weatherList.value.forEach(city => fetchWeather(city))
    }

    const getCityById = (id) => {
        return weatherList.value.find((city) => city.id === id)    
    }
    const isFahrenheit = ref(false)
    const toggleUnit = () => {
        isFahrenheit.value = ! isFahrenheit.value
    }
    const toFahrenheit = (celsius) => {
        return Math.round((celsius * 9) / 5 + 32)
    }

    return {weatherList,getCityById,isFahrenheit,toggleUnit,toFahrenheit, fetchWeather, fetchAllWeather}
})