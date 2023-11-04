import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SearchView from '../views/SearchView.vue'
import ChannelsView from '../views/ChannelsView.vue'
import MessagesView from '../views/MessagesView.vue'
import ProfileView from '../views/ProfileView.vue'
import UploaderView from '../views/UploaderView.vue'
import SquealPutView from '../views/SquealPutView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/search',
      name: 'search',
      component: SearchView
    },
    {
      path: '/channels',
      name: 'channels',
      component: ChannelsView
    },
    {
      path: '/messages',
      name: 'messages',
      component: MessagesView
    },
    {
      path: '/profile/:id',
      name: 'profile',
      component: ProfileView,
      props: true
    },
    {
      path: '/uploader',
      name: 'uploader',
      component: UploaderView
    },
    {
      path: '/squealPut',
      name: 'squealPut',
      component: SquealPutView
    },
  ]
})

export default router
