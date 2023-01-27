<template lang="pug">
.item(
  :id="`item_${id}`"
)
  .title.doom-color-danger(v-if="title") {{title}}
  p.description.mb-2.text-slate-300(v-if="description") {{description}}

  slot(name="header")

  .flex.flex-row.gap-2.item-container
    .image-preview.hidden(class="sm:block")
      img.rounded-md(
        :src="imageUrl"
        onerror="this.style.display='none'"
      )
    .doom-card.flex.flex-col.gap-1.content-center.p-2(class="w-full")
      slot

  slot(name="footer")
</template>


<script setup lang="ts">
const props = defineProps<{
  id: string,
  description?: string,
  imageUrl: string,
  title?: string,
}>()

const emit = defineEmits(['tagClicked'])

function onTagClicked(tagName: string) {
  emit('tagClicked', tagName)
}
</script>


<style lang="scss" scoped>

</style>
