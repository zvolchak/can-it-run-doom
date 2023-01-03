<template lang="pug">
.item-bounty
  .flex.flex-row.gap-2.item-container
    .image-preview.hidden(
      v-if="imageUrl"
      class="sm:block"
    )
        img.rounded-md(
          :src="imageUrl"
          onerror="this.style.display='none'"
        )
    .doom-card.flex.flex-col.gap-1.content-center.p-2(class="w-full")
      p.doom-color-secondary.doom-text-shadow-danger.text-lg {{props.title}}

      p.description.text-xs(
        v-if="props.description"
      ) {{props.description}}

      MetadataField.mt-4(
        v-if="claimedBy?.length > 0"
        :title="$t('item.header.claimedBy')"
        :value="flattenClaimedAuthors(claimedBy)"
      )

      MetadataField.mt-1(
        v-if="claimedBy?.length > 0 && claimedBy[0]?.date"
        :title="$t('item.header.date')"
        :value="claimedBy[0]?.date"
      )

      .flex.flex-wrap.gap-1.mt-5(
        v-if="tags?.length > 0"
      )
        p.tag.bg-gray-700(
          v-for="(tag) in props.tags" :key="tag"
          @click="onTagClicked(tag)"
        ) \#{{tag}}

      p.mt-4.mb-3.description.text-xs.align-self-center
        button.d-btn {{$t('buttons.claimBounty')}}
</template>

<script setup lang="ts">
import { MetadataField } from '@/components'

const props = defineProps<{
  title?: string,
  description?: string,
  imageUrl?: string,
  tags?: Array<string>,
  claimedBy?: Array<any>,
}>()


const emit = defineEmits(['tagClicked'])


function onTagClicked(tagName: string) {
  emit('tagClicked', tagName)
}


function flattenClaimedAuthors(target: Array<any>) {
  const result = target.map((i) => i.name).join(',')
  return result
}

</script>


<style lang="scss" scoped>
</style>
