import {createRouter, createWebHistory} from 'vue-router'
import WeatherHomeView from '../views/WeatherHomeView.vue'

const routes = [
        {
            path:'/',
            name:'home',
            component : WeatherHomeView,
        },
        {
            path : '/about',
            name : 'about',
            component: () => import('../views/WeatherAboutView.vue'),
        },
        {
            path:'/weather/:id',
            name: 'datail',
            component: () => import('../views/WeatherDetailView.vue')
        },
        {
            path:'/:pathMatch(.*)',
            name:'notfound',
            component: () => import('../views/NotFoundView.vue')
        },
    ]

const router = createRouter({
    history : createWebHistory(),
    routes,
})

export default router