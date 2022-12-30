<template lang="pug">
#HomeView
  //- .flex.justify-start.gap-10.flex-col.bg-gray-700
  .grid.grid-cols-12.gap-5
    Item.col-start-4.col-span-7(
      class="ml-5"
      v-for="item in items"
      :title="item.title"
      :description="item.description"
      :authors="item.authors"
      :sourcesUrl="item.sourcesUrl"
      :sourceCodeUrl="item.sourceCodeUrl"
      :isFirstLevelComplete="item.isFirstLevelComplete"
      :publishDate="item.publishDate"
      :imageUrl="item.previewImgUrl"
      :tags="item.tags"
    )
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import Item from '@/components/Item.vue'
import { useDbStore } from '@/stores'


const dbStore = computed(() => useDbStore())

const items = computed(() => dbStore.value.$state.items)


onMounted(async () => {
  await dbStore.value.fetchAllData()
})
</script>
