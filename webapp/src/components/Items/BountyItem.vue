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
        :title="$t('common.id')"
        :value="id"
      )

      MetadataField.mt-1(
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

      .flex.justify-center.my-6
        SimpleModal(
          :title="$t('bounty.howToClaim.title')"
          :btnText="$t('buttons.claimBounty')"
        )
          p {{$t('bounty.howToClaim.description')}} <ContactEmailLink />
          ul.list-disc.ml-10.mt-4
            li.mb-2(
            ) {{$t('bounty.howToClaim.includeId', [id])}}

            li.mb-2(
              v-for="(value, index) in $tm('bounty.howToClaim.instructions')"
              :key="`instruction_${index}`"
            ) {{value}}
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { SimpleModal, ContactEmailLink } from '@/components'
import MetadataField from './MetadataField.vue'

const props = defineProps<{
  id: string,
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
