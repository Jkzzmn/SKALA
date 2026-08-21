<script setup>
import {ref,computed,watch,watchEffect} from 'vue'
import BaseDashboardCard from './BaseDashboardCard.vue'
import SearchBar from './SearchBar.vue'
import WeatherCard from './WeatherCard.vue'

const weatherList = ref([
    {id : 'city_01', name : '서울', temp : '28',status : '맑음'},
    {id : 'city_02', name : '부산', temp : '26', status : '구름많음'},
    {id : 'city_03', name : '인천', temp : '27', status : '맑음'},
    {id : 'city_04', name : '대구', temp : '30', status : '폭염'},
    {id : 'city_05', name : '광주', temp : '29', status : '흐림'},
    {id : 'city_06', name : '대전', temp : '28', status : '비'},
    {id : 'city_07', name : '울산', temp : '25', status : '바람'},
    {id : 'city_08', name : '제주', temp : '24', status : '소나기'},
    {id : 'city_09', name : '강릉', temp : '22', status : '안개'},
    {id : 'city_10', name : '전주', temp : '27', status : '맑음'}
])


//selectedCard
const selectedCity = ref(0)
const isSelected = ref(false)

const SelectRegion = (i) => {
    selectedCity.value = i
    isSelected.value = true
}

const selectedCityInfo = computed(() => {
    if (!isSelected.value) return '지역을 선택해주세요.'
    const city = weatherList.value[selectedCity.value]
    return city ? `${city.name}을 선택했습니다.` : '지역을 선택해주세요.'
})
//searchQuery
const searchQuery = ref('')

const changeQuery = (query) =>{
  searchQuery.value = query
}

const filterWeatherList = computed(() => {
    if (!searchQuery.value) return weatherList.value
    return weatherList.value.filter(item => item.name.includes(searchQuery.value))
})

//detail
const showCityDetail = (city) => {
    window.alert(`${city.name}의 현재 날씨는 [${city.status}] 상태입니다.`)
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
