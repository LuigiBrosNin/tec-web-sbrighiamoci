<script setup>
    import SearchChannelsView from "@/views/SearchChannelsView.vue";
    import SearchProfilesView from "@/views/SearchProfilesView.vue";
    import SearchSquealsView from "@/views/SearchSquealsView.vue";
</script>

<template>
    <ul class="nav nav-pills mb-3 flex-column flex-sm-row" id="pills-tab" role="tablist">
        <li class="nav-item flex-sm-fill" role="presentation">
            <button class="nav-link active" id="pills-channels-tab" data-bs-toggle="pill" data-bs-target="#pills-channels"
                type="button" role="tab" aria-controls="pills-channels" aria-selected="true">
                Channels
            </button>
        </li>
        <li class="nav-item flex-sm-fill text-sm-center" role="presentation">
            <button class="nav-link" id="pills-profiles-tab" data-bs-toggle="pill" data-bs-target="#pills-profiles"
                type="button" role="tab" aria-controls="pills-profiles" aria-selected="false">
                Profiles
            </button>
        </li>
        <li class="nav-item flex-sm-fill text-sm-center" role="presentation">
            <button class="nav-link" id="pills-squeals-tab" data-bs-toggle="pill" data-bs-target="#pills-squeals"
                type="button" role="tab" aria-controls="pills-squeals" aria-selected="false">
                Squeals
            </button>
        </li>
    </ul>

    <div class="tab-content" id="pills-tabContent">
        <div class="tab-pane fade show active" id="pills-channels" role="tabpanel" aria-labelledby="pills-channels-tab">
            <SearchChannelsView></SearchChannelsView>
        </div>
        <div class="tab-pane fade" id="pills-profiles" role="tabpanel" aria-labelledby="pills-profiles-tab">
            <SearchProfilesView></SearchProfilesView>
        </div>
        <div class="tab-pane fade" id="pills-squeals" role="tabpanel" aria-labelledby="pills-squeals-tab">
            <SearchSquealsView></SearchSquealsView>
        </div>
    </div>
</template>