<template lang="pug">
#Bounty(class="lg:flex justify-center")
  ItemsDisplay(
    class="lg:basis-4/6"
    :numberOfPages="numberOfPages"
    :hasError="hasError"
    @search="searching"
    v-model="searchingString"
    alignItemsClass="w-full flex-col \
                    lg:flex-row lg:flex-wrap lg:justify-left"
  )
    BountyItem.col-start-1.col-span-12.mb-5.px-2(
      v-for="item in filtered"
      :key="`item_${item.title}`"
      :title="item.title"
      :description="item.description"
      :tags="item.tags"
      :claimedBy="item.claimedBy"
      :previewImage="item.previewImage"
      @tagClicked="onTagClicked"
    )
</template>


<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { onBeforeRouteUpdate } from 'vue-router'
import { useRoute, useRouter } from 'vue-router'
import { useDbStore } from '@/stores'
import { BountyItem } from '@/components/Items'
import ItemsDisplay from '@/layouts/ItemsDisplay.vue'
import { onSearch, proxyArrayToNormal } from '@/utils/itemsFilters'
import { paginate } from '@/utils/pagination'

const hasError = ref(false)
const route = useRoute()
const router = useRouter()
const numberOfItemsPerPage = ref(5)
const searchingString = ref('')
const filtered = ref([])
const filteredBeforePagination = ref([])

const dbStore = computed(() => useDbStore())
const items = computed(() => dbStore.value.$state.bounties)
const currentPage = computed(() => route.query?.page || 1 )
const numberOfPages = computed(() =>
  Math.round(filteredBeforePagination.value.length / numberOfItemsPerPage.value)
)


onMounted(async () => {
  hasError.value = false
  await dbStore.value.fetchBountyData().catch((error) => {
    console.error(error.message)
    hasError.value = true
  })
}) // onMounted


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
  router.push({ query: {} });
}
</script>


<style lang="scss">
</style>
