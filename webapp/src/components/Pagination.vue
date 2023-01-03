<template lang="pug">
.flex.justify-center.gap-4
  .page-link(
    v-if="numberOfPages > 2"
    @click="onChangePage(currentPage - 1)"
  ) Previous

  .page-link(
    v-if="numberOfPages > 1"
    v-for="i in getRange()"
    :class="i === currentPage ? 'active' : ''"
    @click="onChangePage(i)"
  ) {{i}}

  .page-link(
    v-if="numberOfPages > 2"
    @click="onChangePage(currentPage + 1)"
  ) Next
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


function onChangePage(page: number) {
  if (page < 0)
    page = 0
  route.push({ query: { page } });
}


// I'm not proud of this function.
function getRange() {
  let range = [currentPage.value, currentPage.value, currentPage.value]

  if (range[0] <= 1)
    range[0] = 0
  if (range[0] - 1 > 1)
    range[0] = range[0] - 1

  if (range[1] <= 1 || range[1] == numberOfPages.value) range[1] = 0

  if (range[2] + 1 <= numberOfPages.value - 1)
    range[2] = range[2] + 1
  else
    range[2] = 0

  range = range.filter(i => i > 0)

  return new Set([1, ...range, numberOfPages.value])
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
    color: $doomColorDanger;
    font-weight: 700;
  }

}
</style>
