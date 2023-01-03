<template lang="pug">
#Bounty
  ItemsDisplay(
    :numberOfPages="22"
    :hasError="hasError"
  )
    p {{items}}
  //- .flex.mt-5.justify-center
  //-   div No Content Yet.
</template>


<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useDbStore } from '@/stores'
import Item from '@/components/Item.vue'
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
