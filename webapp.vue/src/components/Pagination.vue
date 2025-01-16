<template lang="pug">
.flex.justify-center.gap-4
  .page-link(
    v-if="numberOfPages >= 2"
    @click="onChangePage(currentPage - 1)"
  ) {{$t('common.previous')}}

  .page-link(
    v-if="numberOfPages > 1"
    v-for="i in getRange()"
    :class="getPageClass(i)"
    @click="onChangePage(i)"
  ) {{i}}

  .page-link(
    v-if="numberOfPages >= 2"
    @click="onChangePage(currentPage + 1)"
  ) {{$t('common.next')}}
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { toRefs } from 'vue'

const props = defineProps<{
  numberOfPages: number,
  currentPage: number,
}>()


const { currentPage, numberOfPages } = toRefs(props)

const route = useRouter()


function onChangePage(page: number | string) {
  if (typeof(page) !== 'number')
    return

  if (page <= 1)
    page = 1
  if (page >= numberOfPages.value)
    page = numberOfPages.value
  window?.scrollTo(0, 0)
  route.push({ query: { page } })
}


// I'm not proud of this function.
function getRange() {
  let maxRange = 2
  if (currentPage.value > 2)
    maxRange = 1
  if (currentPage.value >= numberOfPages.value - 1)
    maxRange = 2

  let range: any[] = []

  for (let i = -maxRange; i <= maxRange; i++) {
    const page = currentPage.value + i
    if (page <= 1)
      continue
    if (page >= numberOfPages.value)
      continue

    range.push(page)
  }

  if (currentPage.value - maxRange > 2)
    range.splice(0, 0, '...')
  if (currentPage.value + maxRange < numberOfPages.value - 1)
    range.splice(range.length, 0, '...')

  return [1, ...range,  numberOfPages.value]
}


function getPageClass(page: string | number) {
  if (typeof(page) === 'string')
    return 'disabled'
  if (page === currentPage.value)
    return 'active'
  return ''
}

</script>


<style lang="scss" scoped>
@import '@/assets/styles/doom.scss';

.page-link {
  cursor: pointer;
  position: relative;
  text-shadow: $doomTextShadowDanger;
  color: $doomColorSecondary;
  transition: 0.1s linear;

  &.active, &:hover {
    color: $doomColorSecondary;
    font-weight: 700;
    text-shadow: none;
    color: $doomColorDanger;
  }

  &.active {
    cursor: default;
    color: $doomColorDanger;
    font-weight: 700;
  }

}
</style>
