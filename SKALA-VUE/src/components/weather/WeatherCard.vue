<script setup>
import { useConfigStore } from '../../stores/configStore'
const configStore = useConfigStore()
const props = defineProps({
    city: { type: Object, required: true },
})

const emit = defineEmits(['select-card', 'click-detail'])

const selectCard = () => {
    emit('select-card', props.city)
}

const showDetail = () => {
    emit('click-detail', props.city)
}
</script>

<template>
    <div class="container" @click="selectCard">
        <div>
            <p>{{ city.name }}({{ city.status }})</p>
            <p v-if="city.temp === undefined || city.temp === ''">불러오는 중...</p>
            <p v-else-if="!configStore.isFahrenheit">현재기온 : {{ city.temp }}°C</p>
            <p v-else>현재기온 : {{ configStore.toFahrenheit(city.temp) }}°F</p>
            <div class="weather" v-if="city.temp >= 25" style="background-color: tomato;color: white; font-weight: bold;">🔥 더움 (25도 이상)</div>
            <div class="weather" v-else style="background-color: cornflowerblue;color: white; font-weight: bold;">😄 선선함 (25도 미만)</div>
        </div>
        <div>
            <button @click.stop="showDetail">상세보기</button>
        </div>
    </div>
</template>

<style scoped>
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ffffff;
  padding-left: 5%;
  padding-right: 5%;
  margin-bottom: 12px;
  padding-top: 12px;
  padding-bottom: 12px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
  cursor: pointer;
}

.container:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.1);
  border-color: #cbd5e1;
}

.container p {
  margin: 4px 0;
  color: #334155;
}

.container p:first-child {
  font-weight: 700;
  color: #0f172a;
  font-size: 1.05rem;
}

.weather {
    display: inline-block;
    padding: 3px 10px;
    margin-top: 4px;
    border-radius: 999px;
    font-size: 0.78rem;
    letter-spacing: 0.01em;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
    opacity: 0.9;
}

.container button {
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
    background-color: #334155;
    color: white;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.15s ease;
}

.container button:hover {
    background-color: #1e293b;
}
</style>
