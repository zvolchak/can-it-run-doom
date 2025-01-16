<template lang="pug">
#nav.doom-font
  Navbar.mb-4
  router-view
  .footer.h-40.mt-5
</template>

<script setup lang="ts">
import Navbar from '@/components/Navbar.vue'
</script>

<style lang="scss">
@font-face {
  font-family: "editundo";
  src: local("editundo"),   url(./assets/fonts/editundo.ttf) format("truetype");
}
</style>
