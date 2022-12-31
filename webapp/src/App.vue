<template lang="pug">
#nav.doom-font
  nav.navbar.navbar-dark.bg-dark.mb-2.h-10
    .container-fluid
  router-view
  .footer.h-40.mt-5
</template>

<script setup lang="ts">
</script>

<style lang="scss">
@font-face {
  font-family: "editundo";
  src: local("editundo"),   url(./assets/fonts/editundo.ttf) format("truetype");
}
</style>
