<template lang="pug">
nav.bg-gray-800
  .mx-auto.max-w-7xl.px-2(class="sm:px-6 lg:px-8")
    .relative.flex.h-16.items-center.justify-between
      .flex.flex-shrink-0.items-center
        img.block.h-16.w-auto(src="/favicon.ico" alt="can it run doom?")

      .flex.flex-1.items-center.justify-center(class="sm:items-stretch sm:justify-start")
        .flex.space-x-4.pl-10
          a.nav-btn.bg-gray-900e(
            v-for="r in routes"
            :key="`route_btn_${r.name}`"
            :href="r.path"
            :aria-current="$route?.name"
            :class="$route?.name?.toLowerCase() === r.name.toLowerCase() ? 'active' : ''"
          ) {{ $t(r.localeVar) }}

      .flex.justify-end
        .dropdown.nav-btn
          select.form-select(v-model="$i18n.locale")
            option(
              v-for="locale in $i18n.availableLocales"
              :key="`locale-${locale}`"
              :value="locale"
            ) {{locale.toUpperCase()}}
</template>


<script setup lang="ts">
const routes = [
  { localeVar: 'buttons.routes.home',  name: 'Home', path: '/' },
  { localeVar: 'buttons.routes.bounty',  name: 'Bounty', path: '/bounty' },
]
</script>


<style lang="scss" scoped>
@import '@/assets/styles/doom.scss';

.nav-btn {
  padding: 9px 12px 9px 12px;
  border-radius: 5px;
  text-shadow: $doomTextShadow;
  transition: 0.1s linear;

  &:hover, &.active {
    color: $doomColorSecondary;
    background-color: $doomColorAlt;
    text-shadow: none;
    font-weight: 700;
    letter-spacing: 3px;
  }
} // .nav-btn

.form-select {
  cursor: pointer;
  background-color: transparent;
  border: none;
  color: inherit;
  padding: 1px;

  & > option {
    padding: 10px;
    color: black;
  }

  &:focus {
    box-shadow: none;
  }
}
</style>
