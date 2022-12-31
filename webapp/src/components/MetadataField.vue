<template lang="pug">
.grid.grid-cols-12.gap-2
  .meta-col.col-span-5
    p.dsc {{props.title}}
  .dsc-value.doom-color-secondary.col-span-7.bg-gray-700
    template(v-if="!!$slots.default")
      slot
    template(v-else)
      p.no-text-shadow {{props.value}}
</template>


<script setup lang="ts">

import { defineProps, computed } from "vue";

const props = defineProps<{
  title: string,
  value?: string,
}>()
</script>

<style lang="scss" scoped>
.meta-col {
  text-align: right;
}

.dsc, .dsc-value {
  text-shadow: 3px 3px 0px rgba(61,1,6,255);
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
