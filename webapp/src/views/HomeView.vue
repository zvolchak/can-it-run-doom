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
  .grid.grid-cols-12.gap-0(v-if="!hasError")
    Item.col-start-4.col-span-7.mb-5(
      class="ml-5"
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
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import Item from '@/components/Item.vue'
import { useDbStore } from '@/stores'
import dayjs from 'dayjs'


const hasError = ref(false)
const searchingString = ref('')
const filtered = ref([])

const dbStore = computed(() => useDbStore())

const items = computed(() =>  dbStore.value.$state.items)


onMounted(async () => {
  hasError.value = false
  await dbStore.value.fetchAllData().catch((error) => {
    console.error(error.message)
    hasError.value = true
  })
  filtered.value = proxyArrayToNormal(items.value)
}) // onMounted


function onTagClicked(tagName: string) {
  searchingString.value += ` ${tagName}`
  onSearch()
} // onTagClicked


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
} // onSearch


function findTag(tags: Array<any>, wordToFind: string) {
  return tags?.find((tag: any) => {
    return tag?.replace('#', '').startsWith(wordToFind.replace('#', ''))
  })
} // findTag


function findAuthor(authors: Array<any>, wordToFind: string) {
  return authors.find((author: any) => {
    return author?.name.toLowerCase().startsWith(wordToFind.toLowerCase())
  })
} // findAuthor


function findDate(date: string, wordToFind: string) {
  return dayjs(date).format('MMM D YYYY').split(' ').find((day: any) => {
    return day.toLowerCase() === (wordToFind.toLowerCase())
  })
} // findDate


function findWordInTitle(title: string, wordToFind: string) {
  return title.split(' ').find((word: string) => {
    return word.toLowerCase().startsWith(wordToFind.toLowerCase())
  })
} // findWordInTitle


function proxyArrayToNormal(target: any): any {
  // idk WTF this is and why.
  const values = Object.values(JSON.parse(JSON.stringify(target)))
  // @ts-ignore
  return values.sort((a, b) => dayjs(a.publishDate).isAfter(dayjs(b.publishDate)))
}
</script>
