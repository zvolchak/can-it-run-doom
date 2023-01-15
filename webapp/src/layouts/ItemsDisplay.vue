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
        @input="searching"
      )
  slot(name="afterSearch")

  Pagination.mt-5.mb-4(
    :numberOfPages="numberOfPages"
    :currentPage="+currentPage"
  )

  .flex(
    :class="alignItemsClass ? alignItemsClass.split(' ') : ['flex-col', 'justify-center', 'items-center']"
    v-if="!hasError"
  )
    slot

  .flex(v-else).justify-center.doom-color-danger
    p.text-lg.font-bold Critical damage taken. Couldn't reach the servers...

  Pagination(
    :numberOfPages="numberOfPages"
    :currentPage="+currentPage"
  )
</template>


<script setup lang="ts">
import { computed } from 'vue'
import { toRefs } from 'vue'
import { useRoute } from 'vue-router'
import { Pagination } from '@/components'


const props = defineProps<{
  hasError?: boolean,
  modelValue?: string,
  numberOfPages: number,
  alignItemsClass?: string,
}>()

const emit = defineEmits(['search', 'update:modelValue', 'update:items'])
const route = useRoute()

const currentPage = computed(() => route.query?.page || 1 )

function searching(e: any) {
  emit('update:modelValue', e.target.value)
  emit('search', e.target.value)
}
</script>
