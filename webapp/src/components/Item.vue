<template lang="pug">
.item
  .title.doom-color-danger {{title}}
  p.description.mb-2.text-slate-300 {{description}}
  .flex.flex-row.gap-2.item-container(
    class=""
  )
    .image-preview.hidden(class="sm:block")
      img.rounded-md(
        :src="imageUrl"
      )
    .doom-card.flex.flex-col.gap-1.content-center.p-2(class="w-full")
      MetadataField(
        :title="$t('item.header.author') + ':'"
      )
        a(
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
        a(
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
        a(
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

      .flex.flex-wrap.gap-1.mt-5
        p.tag.bg-gray-700(
          v-for="(tag) in props.tags" :key="tag"
          @click="onTagClicked(tag)"
        ) \#{{tag}}
</template>


<script setup lang="ts">
import MetadataField from './MetadataField.vue'

const props = defineProps<{
  authors: Array<any>,
  description?: string,
  authorUrl?: string,
  publishDate?: string,
  sourcesUrl: Array<string>,
  sourceCodeUrl?: Array<string>,
  imageUrl: string,
  title: string,
  tags: Array<string>,
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

.title {
  font-size: 24px;
  font-weight: 800;
  -webkit-text-stroke: 1.4px #410001;
}

.description {
  font-size: 16px;
  font-weight: 400;
  font-variant: normal;
}

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
