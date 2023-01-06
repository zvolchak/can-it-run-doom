<template lang="pug">
.item-bounty(
  :class="isNoPreviewImage ? 'short' : ''"
  )
  .flex.flex-row.gap-2.item-container
    .image-preview.hidden(
      :class="isNoPreviewImage ? 'hidden' : 'sm:block'"
      v-if="previewImage"
    )
        img.rounded-md(
          :src="previewImage"
          :onerror="onPreviewImageError"
        )
    .doom-card.flex.flex-col.gap-1.content-center.p-2(class="w-full")
      p.doom-color-secondary.doom-text-shadow-danger.text-lg {{props.title}}

      p.description.text-xs.break-normal.text-justify(
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

      .flex.flex-wrap.gap-1.mt-5.bottom-5(
        class="lg:absolute"
        v-if="tags?.length > 0"
      )
        p.tag.bg-gray-700.self-end(
          v-for="(tag) in props.tags" :key="tag"
          @click="onTagClicked(tag)"
        ) \#{{tag}}

      ClaimBountyForm.mt-4.mb-3.description.text-xs.align-self-center
      //- p.mt-4.mb-3.description.text-xs.align-self-center
      //-   button.d-btn {{$t('buttons.claimBounty')}}
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { MetadataField } from '@/components'
import { ClaimBountyForm } from './'

const props = defineProps<{
  title?: string,
  description?: string,
  previewImage?: string,
  tags?: Array<string>,
  claimedBy?: Array<any>,
}>()


const emit = defineEmits(['tagClicked'])
const isNoPreviewImage = ref(false)


function onPreviewImageError() {
  isNoPreviewImage.value = true
}


function onTagClicked(tagName: string) {
  emit('tagClicked', tagName)
}


function flattenClaimedAuthors(target: Array<any>) {
  const result = target.map((i) => i.name).join(',')
  return result
}

</script>


<style lang="scss" scoped>


.item-bounty {
  max-width: 45rem;

  &.short {
    max-width: 33rem;
  }

  & > .item-container {
    height: 20rem;
  }

  @media (max-width: 1024px) {
    max-width: 100%;

    &.short {
      max-width: 100%;
    }

    & > .item-container {
      height: auto;
    }
  }
}

</style>
