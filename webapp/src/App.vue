<template lang="pug">
#nav.doom-font
  nav.navbar.navbar-dark.bg-dark.mb-5
    .container-fluid
      form.d-flex
        input.form-control.rounded-none.w-96(
          type="search"
          placeholder="Search/Filter by hashtag (e.g. #doom) or keywords."
          arial-label="Search"
        )
        button.btn.btn-outline-secondary.rounded-none.ml-4(type="button") Search
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
