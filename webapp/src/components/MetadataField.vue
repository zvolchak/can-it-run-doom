<template lang="pug">
.grid.grid-cols-12.gap-2
  .meta-col.col-span-5
    p.dsc.doom-text-shadow {{props.title}}
  .dsc-value.doom-color-secondary.doom-text-shadow.col-span-7.px-2.bg-gray-700
    template(v-if="!!$slots.default")
      slot
    template(v-else)
      p.no-text-shadow {{props.value}}
</template>


<script setup lang="ts">
const props = defineProps<{
  title: string,
  value?: string,
}>()
</script>

<style lang="scss" scoped>
.meta-col {
  text-align: right;
}

.dsc {
  text-shadow: none;
  background: #B5B5B5;
  background: linear-gradient(to top, #B5B5B5 40%, #818181 65%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(2px 2px #242424);
}
</style>
