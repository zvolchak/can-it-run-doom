<template lang="pug">
Item(
  :id="id"
  :imageUrl="imageUrl"
  :title="title"
  :description="description"
)
  MetadataField(
    :title="$t('item.header.author') + ':'"
  )
    a.relative(
      v-for="(author, index) in props.authors"
      :href="author.url"
      :key="author.name"
      target="_blank"
    ) {{props.authors.length > 1 && index !== 0 ? ',' : '' }} {{author.name}}
      img.icon(src="@/assets/icons/doom-guy-look-left.png")

  MetadataField(
    :title="$t('item.header.publishedDate') + ':'"
    :value="props.publishDate"
  )

  MetadataField(
    :title="$t('item.header.sources') + ':'"
  )
    a.relative(
      v-if="props.sourcesUrl"
      v-for="(source) in props.sourcesUrl"
      :href="source.url" target="_blank"
      :key="source.url"
    ) {{source.name}}
      img.icon(src="@/assets/icons/doom-guy-grin.png")

    p.no-text-shadow(v-else) {{ $t('common.na') }}

  MetadataField(
    :title="$t('item.header.sourceCode') + ':'"
  )
    a.relative(
      v-if="props.sourceCodeUrl"
      v-for="source in props.sourceCodeUrl"
      :href="source.url" target="_blank"
      :key="source.url"
    ) {{source.name}}
      img.icon(src="@/assets/icons/doom-guy-scream.png")

    p.no-text-shadow(v-else) {{ $t('common.na') }}

  MetadataField(
    :title="$t('item.header.firstLevelComplete') + ':'"
    :value="props.isFirstLevelComplete ? $t('common.yes') : $t('common.no')"
  )

  MetadataField(
    :title="$t('common.id') + ':'"
    :value="props.id"
  )

  .flex.flex-wrap.gap-1.mt-7
    TagsList(
      :tags="props.tags"
      @click="onTagClicked"
    )
</template>


<script setup lang="ts">
import MetadataField from './MetadataField.vue'
import { TagsList } from '@/components'
import Item from './Item.vue'
import { extractTagsFromString } from '@/utils/itemsFilters'
import type { ITagProp } from '@/interfaces'


const props = defineProps<{
  id: string,
  authors: Array<any>,
  description?: string,
  authorUrl?: string,
  publishDate?: string,
  sourcesUrl: Array<string>,
  sourceCodeUrl?: Array<string>,
  imageUrl: string,
  title: string,
  tags: Array<ITagProp>,
  isFirstLevelComplete?: boolean,
}>()

const emit = defineEmits(['tagClicked'])


function getDomainFromUrl(url: string) {
  const domain = (new URL(url))
  const hostname = domain.hostname
  let trimmed = hostname.split('www.')
  let result = ''
  if (trimmed.length > 1)
    result = trimmed[1] // remove www
  trimmed = result.split('.')
  trimmed = trimmed.splice(0, trimmed.length - 1) // remove .com
  return trimmed.join('.')
}


function onTagClicked(tagName: string) {
  emit('tagClicked', tagName)
}
</script>


<style lang="scss" scoped>
@import '@/assets/styles/doom.scss';

a {
  transition: 0.1s linear;
}

a:hover {
  text-shadow: none;
  color: red;
  font-weight: 700;
  -webkit-text-stroke: 0.5px black;
}

a:hover > .icon {
  opacity: 1;
}
</style>
