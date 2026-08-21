<script setup>
//import WeatherParent from './components/weather/weatherParent.vue';
import UnitToggler from './components/weather/UnitToggler.vue'
</script>

<template>
  <!--weatherparent>
  <div>
    <h1>🌅 Weather Report</h1>
    <hr>
  </div>
  <br>
  <WeatherParent />
  <br>
  <weatherparent-->
  <div class="using-route">
    <h1>🌅 Weather Report</h1>
    <hr>
    <nav class="dashboard">
      <RouterLink to="/" class="home">홈</RouterLink>
      <span class="divide"> | </span>
      <RouterLink to="/about" class="home">소개</RouterLink>
    </nav>
    <UnitToggler />
    <main>
      <RouterView />
    </main>
  </div>
</template>
  
<style>
hr{
  color: whitesmoke;
}
h1{
  text-align: center;
  font-weight: bold;
  }
</style>