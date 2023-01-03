<template lang="pug">
#ItemsDisplay
  .flex.justify-center.mb-6
    form.d-flex
      input.form-control.rounded-none.w-96(
        :value="modelValue"
        type="search"
        placeholder="Filter by title, author, hashtag or date..."
        arial-label="Search"
        contenteditable="true"
        @input="onSearch"
      )
  .grid.grid-cols-12.gap-0(
    class=""
    v-if="!hasError"
  )
    slot

  .flex(v-else).justify-center.doom-color-danger
    p.text-lg.font-bold Critical damage taken. Couldn't reach the servers...

  Pagination(
    v-if="numberOfPages > 2"
    :numberOfPages="numberOfPages"
    :currentPage="+currentPage"
  )
</template>


<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { toRefs } from 'vue'
import { onBeforeRouteUpdate } from 'vue-router'
import { useRoute } from 'vue-router'
import { Pagination } from '@/components'

const props = defineProps<{
  numberOfPages: number,
  hasError?: boolean,
  modelValue?: string,
}>()

const emit = defineEmits(['search', 'update:modelValue'])

const { numberOfPages, hasError, } = toRefs(props)

const route = useRoute()

const currentPage = computed(() => route.query?.page || 1 )


function onSearch(e: any) {
  emit('update:modelValue', e.target.value)
}

</script>
