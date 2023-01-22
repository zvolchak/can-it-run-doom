<template lang="pug">
p.tag.bg-gray-700(
  v-for="(tag) in props.tags" :key="tag.name"
  :class="tag.active ? 'active' : ''"
  @click="onTagClicked(tag.name)"
) \#{{tag.name}}
</template>

<script setup lang="ts">
import type { ITagProp } from '@/interfaces'

const emit = defineEmits(['click'])

const props = defineProps<{
  tags: Array<ITagProp>,
}>()

function onTagClicked(tagName: string) {
  emit('click', tagName)
}

</script>
