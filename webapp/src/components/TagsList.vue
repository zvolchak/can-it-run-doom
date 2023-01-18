<template lang="pug">
p.tag.bg-gray-700(
  v-for="(tag) in props.tags" :key="tag"
  @click="onTagClicked(tag)"
) \#{{tag}}
</template>

<script setup lang="ts">
const emit = defineEmits(['click'])

const props = defineProps<{
  tags: Array<string>,
}>()

function onTagClicked(tagName: string) {
  emit('click', tagName)
}

</script>
