<template lang="pug">
#HomeView
  .flex.justify-center.mb-6
    form.d-flex
      input.form-control.rounded-none.w-96(
        v-model="searchingString"
        type="search"
        placeholder="Filter by title, author, hashtag or date..."
        arial-label="Search"
        @input="onSearch"
      )
  .grid.grid-cols-12.gap-0(
    class=""
    v-if="!hasError"
  )
    Item.col-start-0.col-span-12.mb-5.px-2(
      class="sm:col-start-2 sm:col-span-10 \
        md:col-start-3 md:col-span-8 \
        2xl:col-start-4 2xl:col-span-6"
      v-for="item in filtered"
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
  .flex(v-else).justify-center.doom-color-danger
    p.text-lg.font-bold Critical damage taken. Couldn't reach the servers...

  Pagination(
    v-if="numberOfPages > 2"
    :numberOfPages="numberOfPages"
    :currentPage="+currentPage"
  )
</template>

<script setup lang="ts">
import { onBeforeRouteUpdate } from 'vue-router'
import { useRoute } from 'vue-router'
import { onMounted, computed, ref, watch } from 'vue'
import dayjs from 'dayjs'
import Item from '@/components/Item.vue'
import Pagination from '@/components/Pagination.vue'
import { useDbStore } from '@/stores'
import { paginate } from '@/utils/pagination'
import {
  findTag,
  findAuthor,
  findDate,
  findWordInTitle
} from '@/utils/itemsFilters.ts'


const hasError = ref(false)
const searchingString = ref('')
const filtered = ref([])
const route = useRoute()
const numberOfItemsPerPage = ref(10)
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
  await dbStore.value.fetchAllData().catch((error) => {
    console.error(error.message)
    hasError.value = true
  })
  filtered.value = proxyArrayToNormal(items.value)
  filteredBeforePagination.value = [ ...filtered.value ]

  filtered.value = paginate(filtered.value, +currentPage.value - 1, numberOfItemsPerPage.value)
}) // onMounted


function onTagClicked(tagName: string) {
  searchingString.value += ` ${tagName}`
  onSearch()
} // onTagClicked


function proxyArrayToNormal(target: any): any {
  // idk WTF this is and why.
  const values = Object.values(JSON.parse(JSON.stringify(target)))
  // @ts-ignore
  return values.sort((a: any, b: any) =>
    dayjs(a.publishDate).isAfter(dayjs(b.publishDate))
  )
} // proxyArrayToNormal


function onSearch() {
  // @ts-ignore
  const target = proxyArrayToNormal(items.value)
  const keywords = searchingString.value.split(' ').filter(i => !!i)
  if (keywords.length === 0) {
    filtered.value = proxyArrayToNormal(items.value)
    return
  }

  filtered.value = target.filter((item: any) => {
    return keywords.find((word: string) => {
      const foundTag = findTag(item.tags, word)
      if (foundTag) return foundTag

      const foundAuthor = findAuthor(item.authors, word)
      if (foundAuthor) return foundAuthor

      const foundTitleWord = findWordInTitle(item.title, word)
      if (foundTitleWord) return foundTitleWord

      return findDate(item.publishDate, word)
    }) // keywords
  }) as any // filtered

  filteredBeforePagination.value = [ ...filtered.value ]
  filtered.value = paginate(filtered.value, +currentPage.value - 1, numberOfItemsPerPage.value)
} // onSearch

</script>
