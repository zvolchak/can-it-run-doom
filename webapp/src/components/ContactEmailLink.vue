<template lang="pug">
a.contact-email.doom-color-secondary(
  href="#"
  :data-name="name"
  :data-domain="domain"
  :data-tld="tld"
  @onclick="onEmailClick"
)
</template>

<script setup lang="ts">
import { ref } from 'vue'

const name = ref('info')
const domain = ref('gamehoundgames')
const tld = ref('com')

function onEmailClick() {
  window.location.href = `mailto: ${name.value}@${domain.value}.${tld.value}`;
  return false
}

</script>


<style lang="scss">
@import '@/assets/styles/doom.scss';

.contact-email {
  &:after {
    content: attr(data-name) "@" attr(data-domain) "." attr(data-tld);
  }
}
</style>
