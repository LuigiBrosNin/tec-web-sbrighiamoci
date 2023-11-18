import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SearchView from '../views/SearchView.vue'
import ChannelsView from '../views/ChannelsView.vue'
import MessagesView from '../views/MessagesView.vue'
import ProfileView from '../views/ProfileView.vue'
import ProfileSettingsView from '../views/ProfileSettingsView.vue'
import SquealPutView from '../views/SquealPutView.vue'
import SquealInfoView from '../views/SquealInfoView.vue'
import SearchChannelsView from '../views/SearchChannelsView.vue'
import SearchProfilesView from '../views/SearchProfilesView.vue'

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
      component: SearchChannelsView,
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
      path: '/squeal/:id',
      name: 'squeal',
      component: SquealInfoView,
      props: true
    },
    {
      path: '/profile/:id/settings',
      name: 'settings',
      component: ProfileSettingsView
    },
    {
      path: '/squealPut',
      name: 'squealPut',
      component: SquealPutView
    },
    {
      path: '/search/profiles',
      name: 'searchProfiles',
      component: SearchProfilesView
    },
  ]
})

export default router
