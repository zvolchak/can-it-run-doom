<template lang="pug">
#Bounty(class="lg:flex justify-center")
  ItemsDisplay(
    class="justify-center"
    :numberOfPages="numberOfPages"
    :hasError="hasError"
    @search="searching"
    v-model="searchingString"
    alignItemsClass="w-full flex-col justify-center\
                    lg:flex-row lg:flex-wrap lg:justify-left"
  )
    BountyItem.mb-5.px-2(
      v-for="item in filtered"
      :key="`item_${item.title}`"
      :id="item.id"
      :title="item.title"
      :description="item.description"
      :tags="item.tags"
      :claimedBy="item.claimedBy"
      :previewImage="item.previewImage"
      @tagClicked="onTagClicked"
    )
    template(v-slot:afterSearch)
      .flex.justify-center.mb-6
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
import { SimpleModal } from '@/components'
import ItemsDisplay from '@/layouts/ItemsDisplay.vue'
import { onSearch, proxyArrayToNormal } from '@/utils/itemsFilters'
import { paginate } from '@/utils/pagination'
import { ContactEmailLink } from '@/components'

const hasError = ref(false)
const route = useRoute()
const router = useRouter()
const numberOfItemsPerPage = ref(5)
const searchingString = ref('')
const filtered = ref([])
const filteredBeforePagination = ref([])
const i18n = useI18n()

const dbStore = computed(() => useDbStore())
const uxStore = computed(() => useUXStore())

const items = computed(() => dbStore.value.$state.bounties)
const currentPage = computed(() => route.query?.page || 1 )
const numberOfPages = computed(() =>
  Math.round(filteredBeforePagination.value.length / numberOfItemsPerPage.value)
)
const bountyDbLink = computed(() =>
  `https://github.com/zvolchak/can-it-run-doom/blob/main/storage/db/${i18n.locale}/bounty.db`
  )
const currentLocale = computed(() => uxStore.value.currentLocale)


onMounted(async () => {
  await fetchItems()
}) // onMounted


onBeforeRouteUpdate(async (to) => {
  const page = +(to.query?.page || 1)
  filtered.value =  paginate(
                      filteredBeforePagination.value,
                      page - 1,
                      numberOfItemsPerPage.value
                    )
})


watch(currentLocale, async () => {
  console.debug('Locale changed')
  await fetchItems()
})


async function fetchItems() {
  hasError.value = false
  await dbStore.value.fetchBountyData(currentLocale.value)
  filtered.value = Object.values(JSON.parse(JSON.stringify(items.value)))

  filtered.value = proxyArrayToNormal(items.value)
  filteredBeforePagination.value = [ ...filtered.value ]

  filtered.value = paginate(filtered.value, +currentPage.value - 1, numberOfItemsPerPage.value)
}


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


<style lang="scss">
</style>
