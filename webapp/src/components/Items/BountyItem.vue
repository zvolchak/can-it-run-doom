<template lang="pug">
Item.item-bounty(
  :id="id"
  :imageUrl="imageUrl"
  :title="title"
)
  p.description.text-xs.break-normal.text-justify(
    v-if="description"
  ) {{description}}

  MetadataField.mt-4(
    :title="$t('common.id')"
    :value="id"
  )

  MetadataField.mt-1(
    :title="$t('bounty.modelOrManufacturer')"
    :value="targetModel"
  )

  MetadataField.mt-1(
    v-if="requestors?.length > 0"
    :title="$t('item.header.requestor')"
  )
    a.relative(
        v-for="(author, index) in requestors"
        :href="author?.url"
        :key="author.name"
        target="_blank"
      ) {{requestors.length > 1 && index !== 0 ? ',' : '' }} {{author.name}}

  MetadataField.mt-1(
    v-if="requestors?.length > 0 && requestors[0]?.date"
    :title="$t('item.header.requestDate')"
    :value="requestors[0]?.date"
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

  .flex.justify-center.mt-2
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

  .flex.flex-wrap.gap-1.mt-7
    TagsList.self-end(
      :tags="props.tags"
      @click="onTagClicked"
    )
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { SimpleModal, ContactEmailLink, TagsList } from '@/components'
import Item from './Item.vue'
import MetadataField from './MetadataField.vue'
import type { ITagProp } from '@/interfaces'


const props = defineProps<{
  id: string,
  title?: string,
  description?: string,
  imageUrl?: string,
  tags?: Array<ITagProp>,
  claimedBy?: Array<any>,
  targetModel?: string,
  requestors?: Array<string>,
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


<style lang="scss">
@import '@/assets/styles/doom.scss';

.item-bounty {
  & > .title {
    color: $doomColorSecondary !important;
    text-shadow: $doomTextShadowDanger;
  }
}
</style>
