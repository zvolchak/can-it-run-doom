<template lang="pug">
#HomeView
  .grid.grid-cols-12.gap-5(v-if="!hasError")
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
  .flex(v-else).justify-center.doom-color-danger
    p.text-lg.font-bold Critical damage taken. Couldn't reach the servers...
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import Item from '@/components/Item.vue'
import { useDbStore } from '@/stores'

const hasError = ref(false)

const dbStore = computed(() => useDbStore())

const items = computed(() => dbStore.value.$state.items)


onMounted(async () => {
  hasError.value = false
  await dbStore.value.fetchAllData().catch((error) => {
    console.error(error.message)
    hasError.value = true
  })
})
</script>
