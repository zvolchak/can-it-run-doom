<template lang="pug">
#HomeView
  ItemDisplay(
    :numberOfPages="numberOfPages"
    :hasError="hasError"
    @search="searching"
    v-model="searchingString"
  )
    ItemDb.col-start-0.col-span-12.mb-5.px-2(
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
      :tags="getItemTags(item.tags)"
      @tagClicked="onTagClicked"
    )

    template(v-slot:afterSearch)
      .flex.justify-center
        .flex.flex-wrap.gap-1(
          class="w-full sm:w-3/4 xl:w-5/12"
        )
          TagsList(
            :tags="getAllTags()"
            @click="onTagClicked"
          )
</template>


<script setup lang="ts">
import { onBeforeRouteUpdate } from 'vue-router'
import { useRoute, useRouter } from 'vue-router'
import {
  onMounted,
  computed,
  ref,
  watch
} from 'vue'
import dayjs from 'dayjs'
import { ItemDb } from '@/components/Items'
import { TagsList } from '@/components'
import ItemDisplay from '@/layouts/ItemsDisplay.vue'
import type { ITagProp } from '@/interfaces'
import { useDbStore, useUXStore } from '@/stores'
import { paginate } from '@/utils/pagination'
import {
  onSearch,
  proxyToArray,
  extractTagsFromString,
  proxyToObject,
} from '@/utils/itemsFilters'
import { getAllTagsFromItems, getTagsFromString } from './tagBuilder'


const router = useRouter()
const hasError = ref(false)
const route = useRoute()
const numberOfItemsPerPage = ref(10)
const numberOfTagsPreview = ref(20)
const searchingString = ref('')
const filtered = ref([])
const filteredBeforePagination = ref([])

const uxStore = computed(() => useUXStore())
const dbStore = computed(() => useDbStore())
const items = computed(() => dbStore.value.$state.items)
const currentPage = computed(() => route.query?.page || 1 )
const currentLocale = computed(() => uxStore.value.currentLocale)
const currentSearch = computed(() => uxStore.value.currentSearch['dbSearch'] || '')
const numberOfPages = computed(() =>  Math.ceil(filteredBeforePagination.value.length / numberOfItemsPerPage.value))


onBeforeRouteUpdate(async (to) => {
  const page = +(to.query?.page || 1)
  filtered.value =  paginate(
    filteredBeforePagination.value,
    page - 1,
    numberOfItemsPerPage.value
  )
})


onMounted(async () => {
  const ids = typeof route.query.id === 'string' ? [route.query.id] : route.query.id
  if (ids) {
    uxStore.value.setCurrentSearch('dbSearch', ids.join(' '))
  }

  searchingString.value = currentSearch.value
  await fetchItems()
  searching(searchingString.value)
})


watch(currentLocale, async () => {
  await fetchItems()
})


async function fetchItems() {
  hasError.value = false
  await dbStore.value.fetchItemsData(currentLocale.value)
  filtered.value = Object.values(JSON.parse(JSON.stringify(items.value)))

  filtered.value = proxyToArray(items.value)
  filteredBeforePagination.value = [ ...filtered.value ]

  filtered.value = paginate(filtered.value, +currentPage.value - 1, numberOfItemsPerPage.value)
}


function onTagClicked(tagName: string) {
  // tag toggle effect: remove tag name from the search when it trying to add the same one.
  if (searchingString.value.includes(`#${tagName}`))
    searchingString.value = searchingString.value.replace(`#${tagName}`, '').trim()
  else
    searchingString.value = `${searchingString.value } #${tagName}`.trim()
  searching(searchingString.value)
} // onTagClicked


function searching(target: string) {
  filtered.value = onSearch(target, proxyToArray(items.value))
  filteredBeforePagination.value = filtered.value
  filtered.value = paginate(filtered.value, +currentPage.value - 1, numberOfItemsPerPage.value)
  router.replace({ query: {} });
  uxStore.value.setCurrentSearch('dbSearch', target)
}


function getAllTags(): Array<ITagProp> {
  // FIXME: When switching pages, tags change according to current page items.
  // This solution is dumb. Won't work for filtered items with more than 1 page.
  // But good enough for now.
  const target = currentSearch.value ? filtered.value : items.value
  const tags = getAllTagsFromItems(target).splice(0, numberOfTagsPreview.value)
  return getTagsFromString(tags, currentSearch.value)
} // getAllTags


function getItemTags(tags: any): Array<ITagProp> {
  return getTagsFromString(tags, currentSearch.value)
}

</script>
