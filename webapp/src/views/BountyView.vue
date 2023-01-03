<template lang="pug">
#Bounty
  ItemsDisplay(
    :numberOfPages="22"
    :hasError="hasError"
  )
    BountyItem.col-start-0.col-span-3.mb-5.px-2(
      v-for="item in items"
      :key="`item_${item.title}`"
      :title="item.title"
      :description="item.description"
      :tags="item.tags"
      :claimedBy="item.claimedBy"
    )
  //- .flex.mt-5.justify-center
  //-   div No Content Yet.
</template>


<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useDbStore } from '@/stores'
import { BountyItem } from '@/components/Items'
import ItemsDisplay from '@/layouts/ItemsDisplay.vue'

const hasError = ref(false)

const dbStore = computed(() => useDbStore())
const items = computed(() => dbStore.value.$state.bounties)


onMounted(async () => {
  hasError.value = false
  await dbStore.value.fetchBountyData().catch((error) => {
    console.error(error.message)
    hasError.value = true
  })
}) // onMounted

</script>


<style lang="scss">
</style>
