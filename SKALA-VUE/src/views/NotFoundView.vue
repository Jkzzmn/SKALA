<script setup>
</script>
<template>
    <div class="notFound">
        <h1 class="notFoundIcon">☀️⁇</h1>
        <h1>페이지를 찾을 수 없습니다.</h1>
        <p>요청하신 주소가 존재하지 않거나,</p>
        <p>아직 개발되지 않았습니다.</p>
        <RouterLink to="/" class="home">홈으로 돌아가기</RouterLink>
    </div>    
</template>

<style>
.notFoundIcon{
    font-size: 100px;
}
</style>