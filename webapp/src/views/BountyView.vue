<template lang="pug">
#Bounty
  ItemsDisplay(
    :numberOfPages="numberOfPages"
    :hasError="hasError"
    @search="searching"
    v-model="searchingString"
  )
    BountyItem.col-start-0.col-span-12.mb-5.px-2(
      class="sm:col-start-2 sm:col-span-10 \
        md:col-start-3 md:col-span-8 \
        2xl:col-start-4 2xl:col-span-6"
      v-for="item in filtered"
      :key="`item_${item.title}`"
      :id="item.id"
      :title="item.title"
      :description="item.description"
      :tags="getItemTags(item.tags)"
      :claimedBy="item.claimedBy"
      :imageUrl="item.previewImage"
      :targetModel="item.model"
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

      .flex.justify-center.mt-12.mb-6
        SimpleModal(
          :title="$t('bounty.howToAddItem.title')"
          :btnText="$t('buttons.howToAddBounty')"
        )
          p {{$t('bounty.howToAddItem.description')}} <ContactEmailLink />
          ul.list-disc.ml-10.mt-4
            li.mb-2(
              v-for="(value, index) in $tm('bounty.howToAddItem.instructions')"
              :key="`instruction_${index}`"
            ) {{value}}
          p.mt-4(v-html="$t('bounty.howToAddItem.orGithub', [bountyDbLink])")

</template>


<script setup lang="ts">
import { onMounted, computed, ref, watch  } from 'vue'
import { onBeforeRouteUpdate } from 'vue-router'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useDbStore, useUXStore } from '@/stores'
import { BountyItem } from '@/components/Items'
import { SimpleModal, TagsList } from '@/components'
import ItemsDisplay from '@/layouts/ItemsDisplay.vue'
import { onSearch, proxyToArray } from '@/utils/itemsFilters'
import { paginate } from '@/utils/pagination'
import { ContactEmailLink } from '@/components'
import {
  getAllTagsFromItems,
  getTagsFromString,
  toggleTagFromString,
} from './tagBuilder'
import type { ITagProp } from '@/interfaces'

const hasError = ref(false)
const route = useRoute()
const router = useRouter()
const numberOfItemsPerPage = ref(5)
const numberOfTagsPreview = ref(20)
const searchingString = ref('')
const filtered = ref([])
const filteredBeforePagination = ref([])
const i18n = useI18n()

const dbStore = computed(() => useDbStore())
const uxStore = computed(() => useUXStore())

const items = computed(() => dbStore.value.$state.bounties)
const currentPage = computed(() => route.query?.page || 1 )
const currentSearch = computed(() => uxStore.value.currentSearch['bountySearch'] || '')
const numberOfPages = computed(() =>
  Math.round(filteredBeforePagination.value.length / numberOfItemsPerPage.value)
)
const bountyDbLink = computed(() =>
  `https://github.com/zvolchak/can-it-run-doom/blob/main/storage/db/${i18n.locale}/bounty.db`
  )
const currentLocale = computed(() => uxStore.value.currentLocale)


onMounted(async () => {
  searchingString.value = currentSearch.value
  await fetchItems()
  searching(searchingString.value)
})


onBeforeRouteUpdate(async (to) => {
  const page = +(to.query?.page || 1)
  filtered.value =  paginate(
                      filteredBeforePagination.value,
                      page - 1,
                      numberOfItemsPerPage.value
                    )
})


watch(currentLocale, async () => {
  await fetchItems()
})


async function fetchItems() {
  hasError.value = false
  await dbStore.value.fetchBountyData(currentLocale.value)
  filtered.value = Object.values(JSON.parse(JSON.stringify(items.value)))

  filtered.value = proxyToArray(items.value)
  filteredBeforePagination.value = [ ...filtered.value ]

  filtered.value = paginate(filtered.value, +currentPage.value - 1, numberOfItemsPerPage.value)
}


function onTagClicked(tagName: string) {
  searchingString.value = toggleTagFromString(searchingString.value, tagName)
  searching(searchingString.value)
} // onTagClicked


function searching(target: any) {
  filtered.value = onSearch(target, proxyToArray(items.value))
  filteredBeforePagination.value = filtered.value
  filtered.value = paginate(filtered.value, +currentPage.value - 1, numberOfItemsPerPage.value)
  router.replace({ query: {} });
  uxStore.value.setCurrentSearch('bountySearch', target)
}


function getAllTags(): Array<ITagProp> {
  const tags = getAllTagsFromItems(filtered.value).splice(0, numberOfTagsPreview.value)
  return getTagsFromString(tags, currentSearch.value)
} // getAllTags


function getItemTags(tags: any): Array<ITagProp> {
  return getTagsFromString(tags, currentSearch.value)
}
</script>


<style lang="scss">
</style>
