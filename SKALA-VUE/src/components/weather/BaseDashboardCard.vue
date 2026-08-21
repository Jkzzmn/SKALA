<template>
    <div class="base-dashboard-card">
        <slot>
        </slot>
    </div>
</template>

<style scoped>
.base-dashboard-card {
    padding: 20px;
    margin-bottom: 16px;
    background-color: #f8fafc;
    border-radius: 14px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 2px 8px rgba(15, 23, 42, 0.05);
}
</style>