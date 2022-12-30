<template lang="pug">
.item
  .title.doom-color-danger {{title}}
  p.description.mb-2.text-slate-300 {{description}}
  //- .grid.grid-rows-2.grid-flow-col.gap-1
  .flex.flex-row.gap-2
    .image-preview
      img.rounded-md(
        :src="imageUrl"
      )
    .card.flex.flex-col.gap-1.content-center.p-2(class="w-full")
      MetadataField(
        title="Author:"
      )
        a(
          v-for="(author, index) in props.authors"
          :href="author.url"
          :key="author.name"
          target="_blank"
        ) {{props.authors.length > 1 && index !== 0 ? ',' : '' }} {{author.name}}
          img.icon(src="@/assets/icons/doom-guy-look-left.png")

      MetadataField(
        title="Published Date:"
        :value="props.publishDate"
      )

      MetadataField(
        title="Sources:"
      )
        a(
          v-if="props.sourcesUrl"
          v-for="(source) in props.sourcesUrl"
          :href="source.url" target="_blank"
          :key="source.url"
        ) {{source.name}}
          img.icon(src="@/assets/icons/doom-guy-grin.png")
        p.no-text-shadow(v-else) n/a

      MetadataField(
        title="Source Code:"
      )
        a.text-blue-400(
          v-if="props.sourceCodeUrl"
          v-for="source in props.sourceCodeUrl"
          :href="source.url" target="_blank"
          :key="source.url"
        ) {{source.name}}
          img.icon(src="@/assets/icons/doom-guy-scream.png")

        p.no-text-shadow(v-else) n/a

      MetadataField(
        title="First Level Complete:"
        :value="boolToText(props.isFirstLevelComplete)"
      )

      .flex.flex-wrap.gap-1.mt-5
        p.tag(v-for="(tag) in props.tags" :key="tag") \#{{tag}}
</template>


<script setup lang="ts">
import MetadataField from './MetadataField.vue'
import { defineProps } from "vue";

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


function boolToText(value: boolean | null | undefined): string {
  return value ? 'Yes' : 'No'
}


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
</script>

<style lang="scss" scoped>
.item {
  transition: all 0.2s ease-in-out;

  &:hover {
    box-shadow: 0px 5px 7px -5px rgb(173, 1, 1, 0.9);
  }
}

.card {
  background-color: #373737;
}

.image-preview {
  width: 21rem;
  max-height: 15rem;
  object-fit: fill;
}

.tag {
  font-size: 12px;
  border: 1px solid gray;
  border-radius: 2px;
  background: white;
  padding: 1px 4px 1px 4px;
  background-color: #656565;
}

.title {
  font-size: 21px;
  font-weight: 800;
  -webkit-text-stroke: 1.4px #410001;
}

.description {
  font-size: 14px;
  font-weight: 300;
  font-variant: normal;
}

a {
  transition: 0.1s linear;
}

a:hover {
  text-shadow: none;
  color: red;
  font-weight: 600;
  -webkit-text-stroke: 0.5px black;
}

.icon {
  // display: none;
  position: absolute;
  width: 24px;
  height: 28px;
  z-index: 10;
  right: -28px;
  top: -2px;
  opacity: 0;
  transition: opacity 0.2s ease-in, opacity 0.4s ease-out;
}

a:hover > .icon {
  opacity: 1;
}
</style>
