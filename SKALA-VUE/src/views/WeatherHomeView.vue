<script setup>
import {ref,computed,watch,watchEffect, onMounted} from 'vue'
import BaseDashboardCard from '../components/weather/BaseDashboardCard.vue'
import SearchBar from '../components/weather/SearchBar.vue'
import WeatherCard from '../components/weather/WeatherCard.vue'
import { useConfigStore } from '../stores/configStore.js'
import { useRouter } from 'vue-router'


const router = useRouter()
const configStore = useConfigStore()

onMounted(() => {
    configStore.fetchAllWeather()
})

//selectedCard
const selectedCity = ref(0)
const isSelected = ref(false)

const SelectRegion = (i) => {
    selectedCity.value = i
    isSelected.value = true
}

const selectedCityInfo = computed(() => {
    if (!isSelected.value) return '지역을 선택해주세요.'
    const city = configStore.weatherList[selectedCity.value]
    return city ? `${city.name}을 선택했습니다.` : '지역을 선택해주세요.'
})

//searchQuery
const searchQuery = ref('')

const changeQuery = (query) =>{
  searchQuery.value = query
}

const filterWeatherList = computed(() => {
    if (!searchQuery.value) return configStore.weatherList
    return configStore.weatherList.filter(item => item.name.includes(searchQuery.value))
})

//detail
const showCityDetail = (city) => {
    router.push(`/weather/${city.id}`)
}

//watch
watch(selectedCityInfo, (newInfo, oldInfo) => {
    console.log(`상태바 변경... ${oldInfo} => ${newInfo}`);
})

watchEffect(() => {
    console.log(`검색어 입력 중: ${searchQuery.value}`)
})

</script>

<template>
    <div class="weather-parent">
        <BaseDashboardCard>
            <SearchBar
                :search-query="searchQuery"
                @update-query="changeQuery" />
        </BaseDashboardCard>
        <BaseDashboardCard>
            <div class="region_list">
                <h2>🏖️ 지역별 날씨 현황</h2>
                <WeatherCard
                    v-for="(city, index) in filterWeatherList"
                    :key="city.id"
                    :city="city"
                    @select-card="SelectRegion(index)"
                    @click-detail="showCityDetail" />
                <p v-if="filterWeatherList.length === 0">검색 결과가 없습니다.</p>
            </div>
            <div class="selectedCity">
                <p>{{ selectedCityInfo }}</p>
            </div>
        </BaseDashboardCard>
    </div>
</template>

<style scoped>
h2 {
    margin: 0 0 12px;
    font-size: 1.1rem;
    letter-spacing: -0.01em;
}

.region_list {
    margin-bottom: 16px;
}

.selectedCity {
    background-color: #dcfce7;
    color: #15803d;
    font-weight: 700;
    text-align: center;
    padding: 14px;
    border-radius: 12px;
    border: 1px solid #86efac;
}
</style>
