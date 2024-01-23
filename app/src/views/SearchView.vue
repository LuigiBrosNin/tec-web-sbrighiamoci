<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import SearchChannelsView from "@/views/SearchChannelsView.vue";
import SearchProfilesView from "@/views/SearchProfilesView.vue";
import SearchSquealsView from "@/views/SearchSquealsView.vue";

let activeTab = ref('channels'); // Default to 'channels'
const route = useRoute();

onMounted(() => {
  const tabIndex = route.query.tab_index;
  if (tabIndex) activeTab.value = tabIndex;
});
</script>

<template>
    <ul class="nav nav-pills mb-3 flex-column flex-sm-row" id="pills-tab-search" role="tablist">
        <li class="nav-item flex-sm-fill text-sm-center" role="presentation">
            <button class="nav-link" :class="{ active: activeTab === 'channels' }" id="pills-channels-tab"
                @click="activeTab = 'channels'" type="button" role="tab" aria-controls="search-channels"
                aria-selected="activeTab === 'channels'">
                Channels
            </button>
        </li>
        <li class="nav-item flex-sm-fill text-sm-center" role="presentation">
            <button class="nav-link" :class="{ active: activeTab === 'profiles' }" id="pills-profiles-tab"
                @click="activeTab = 'profiles'" type="button" role="tab" aria-controls="search-profiles"
                aria-selected="activeTab === 'profiles'">
                Profiles
            </button>
        </li>
        <li class="nav-item flex-sm-fill text-sm-center" role="presentation">
            <button class="nav-link" :class="{ active: activeTab === 'squeals' }" id="pills-squeals-tab"
                @click="activeTab = 'squeals'" type="button" role="tab" aria-controls="search-squeals"
                aria-selected="activeTab === 'squeals'">
                Squeals
            </button>
        </li>
    </ul>

    <div class="tab-content" id="pills-tabContent">
        <div class="tab-pane fade" :class="{ 'show active': activeTab === 'channels' }" id="search-channels" role="tabpanel" aria-label="pills-channels-tab">
            <SearchChannelsView></SearchChannelsView>
        </div>
        <div class="tab-pane fade" :class="{ 'show active': activeTab === 'profiles' }" id="search-profiles" role="tabpanel" aria-label="pills-profiles-tab">
            <SearchProfilesView></SearchProfilesView>
        </div>
        <div class="tab-pane fade" :class="{ 'show active': activeTab === 'squeals' }" id="search-squeals" role="tabpanel" aria-label="pills-squeals-tab">
            <SearchSquealsView></SearchSquealsView>
        </div>
    </div>
</template>

<style scoped>.nav-link {
    margin: auto;
}</style>