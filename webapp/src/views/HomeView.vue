<template lang="pug">
#HomeView
  ItemDisplay(
    :numberOfPages="numberOfPages"
    :hasError="hasError"
    @search="searching"
    v-model="searchingString"
  )
    Item.col-start-0.col-span-12.mb-5.px-2(
      class="sm:col-start-2 sm:col-span-10 \
        md:col-start-3 md:col-span-8 \
        2xl:col-start-4 2xl:col-span-6"
      v-for="item in filtered"
      :id="item.id"
      :title="item.title"
      :description="item.description"
      :authors="item.authors"
      :sourcesUrl="item.sourcesUrl"
      :sourceCodeUrl="item.sourceCodeUrl"
      :isFirstLevelComplete="item.isFirstLevelComplete"
      :publishDate="item.publishDate"
      :imageUrl="item.previewImgUrl"
      :tags="item.tags"
      @tagClicked="onTagClicked"
    )
</template>

<script setup lang="ts">
import { onBeforeRouteUpdate } from 'vue-router'
import { useRoute, useRouter } from 'vue-router'
import { onMounted, computed, ref } from 'vue'
import dayjs from 'dayjs'
import { Item } from '@/components/'
import ItemDisplay from '@/layouts/ItemsDisplay.vue'

import { useDbStore } from '@/stores'
import { paginate } from '@/utils/pagination'
import { onSearch, proxyArrayToNormal } from '@/utils/itemsFilters'

const router = useRouter()
const hasError = ref(false)
const route = useRoute()
const numberOfItemsPerPage = ref(10)
const searchingString = ref('')
const filtered = ref([])
const filteredBeforePagination = ref([])

const dbStore = computed(() => useDbStore())

const items = computed(() => dbStore.value.$state.items)

const currentPage = computed(() => route.query?.page || 1 )

const numberOfPages = computed(() =>
  Math.round(filteredBeforePagination.value.length / numberOfItemsPerPage.value)
)


onBeforeRouteUpdate(async (to) => {
  const page = +(to.query?.page || 1)
  filtered.value =  paginate(
                      filteredBeforePagination.value,
                      page - 1,
                      numberOfItemsPerPage.value
                    )
})


onMounted(async () => {
  hasError.value = false
  await dbStore.value.fetchItemsData()
  filtered.value = Object.values(JSON.parse(JSON.stringify(items.value)))

  filtered.value = proxyArrayToNormal(items.value)
  filteredBeforePagination.value = [ ...filtered.value ]

  filtered.value = paginate(filtered.value, +currentPage.value - 1, numberOfItemsPerPage.value)
}) // onMounted


function onTagClicked(tagName: string) {
  searchingString.value = `${searchingString.value} #${tagName}`
  searching(searchingString.value)
} // onTagClicked


function searching(target: any) {
  filtered.value = onSearch(target, proxyArrayToNormal(items.value))
  filteredBeforePagination.value = filtered.value
  filtered.value = paginate(filtered.value, +currentPage.value - 1, numberOfItemsPerPage.value)
  router.replace({ query: {} });
}
</script>
