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
import { onMounted, computed, ref } from 'vue'
import dayjs from 'dayjs'
import { Item } from '@/components/Items'
import { TagsList } from '@/components'
import ItemDisplay from '@/layouts/ItemsDisplay.vue'

import { useDbStore } from '@/stores'
import { paginate } from '@/utils/pagination'
import { onSearch, proxyArrayToNormal } from '@/utils/itemsFilters'

const router = useRouter()
const hasError = ref(false)
const route = useRoute()
const numberOfItemsPerPage = ref(10)
const numberOfTagsPreview = ref(20)
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
  // tag toggle effect: remove tag name from the search when it trying to add the same one.
  if (searchingString.value.includes(`#${tagName}`))
    searchingString.value = searchingString.value.replace(`#${tagName}`, '').trim()
  else
    searchingString.value = `${searchingString.value } #${tagName}`.trim()
  searching(searchingString.value)
} // onTagClicked


function searching(target: string) {
  filtered.value = onSearch(target, proxyArrayToNormal(items.value))
  filteredBeforePagination.value = filtered.value
  filtered.value = paginate(filtered.value, +currentPage.value - 1, numberOfItemsPerPage.value)
  router.replace({ query: {} });
}

function getAllTags() {
  const tags: any = {}
  proxyArrayToNormal(filtered.value).forEach((i: any) => {
    i.tags.forEach((tag: string) => {
      if (!(tag in tags)) tags[tag] = 0
      tags[tag] += 1
    })
  })

  const result = Object.keys(tags).sort((key1: any, key2: any) => {
    const value1 = tags[key1]
    const value2 = tags[key2]
    return value1 < value2 ? key1 : key2;
  })
  return result.splice(0, numberOfTagsPreview.value)
}
</script>
