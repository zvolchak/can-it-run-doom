<template lang="pug">
nav.bg-gray-800
  .mx-auto.max-w-7xl.px-2(class="sm:px-6 lg:px-8")
    .relative.flex.h-16.items-center.justify-between
      .flex.flex-shrink-0.items-center
        img.block.h-16.w-auto(src="/favicon.ico" alt="can it run doom?")

      .flex.flex-3.items-center.justify-center(class="sm:items-stretch sm:justify-start")
        .flex.space-x-4.pl-10
          router-link.nav-btn.bg-gray-900e(
            v-for="r in routes"
            :to="r.path"
            :key="`route_btn_${r.name}`"
            :href="r.path"
            :aria-current="$route?.name"
            :class="$route?.name?.toLowerCase() === r.name.toLowerCase() ? 'active' : ''"
          ) {{ $t(r.localeVar) }}

      .flex.justify-end.items-center.pr-5
        select.form-select.dropdown.nav-btn(v-model="$i18n.locale")
          option(
            v-for="locale in $i18n.availableLocales"
            :key="`locale-${locale}`"
            :value="locale"
            @click="setLocale(locale)"
          ) {{locale.toUpperCase()}}

        .w-12.nav-icon
          img.block.h-6.w-auto.rounded-full(
            class="sm:ml-4"
            src="@/assets/icons/github-mark-white.png"
            alt="source code?"
            @click="onSourceCodeClick"
          )

        .w-12.nav-icon
          img.block.h-6.w-auto.rounded-full(
            class="sm:ml-4"
            src="@/assets/icons/discord-48.png"
            alt="discord server"
            @click="onJoinDiscordClick"
          )

</template>


<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from "vue-i18n"
import { useUXStore } from '@/stores'
import { useCookies } from "vue3-cookies"

const { cookies } = useCookies()
const uxStore = computed(() => useUXStore())
const currentLocale = computed(() => uxStore.value.currentLocale)


const routes = [
  { localeVar: 'buttons.routes.home',  name: 'Home', path: '/' },
  // { localeVar: 'buttons.routes.bounty',  name: 'Bounty', path: '/bounty' },
]

const i18n = useI18n()

onMounted(() => {
  const sysLang = cookies.get('lang') || 'en'
  if (i18n.availableLocales.indexOf(sysLang) >= 0)
    uxStore.value.setLocale(sysLang)
  i18n.locale.value = sysLang
})

function setLocale(target: string) {
  uxStore.value.setLocale(target)
  i18n.locale.value = target
  cookies.set('lang', target)
}


function onSourceCodeClick() {
  // @ts-ignore
  const url = import.meta.env.VITE_SOURCE_CODE_URL
  window.open(url, '_blank')
}


function onJoinDiscordClick() {
  // @ts-ignore
  const url = import.meta.env.VITE_DISCORD_URL
  window.open(url, '_blank')
}

</script>


<style lang="scss" scoped>
@import '@/assets/styles/doom.scss';

.nav-btn {
  padding: 9px 12px 9px 12px;
  border-radius: 5px;
  text-shadow: $doomTextShadowDanger;
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
  padding: 5px;
  width: 55px;

  & > option {
    padding: 10px;
    color: black;
  }

  &:focus {
    box-shadow: none;
  }
}

.nav-icon {
  cursor: pointer;

  img {
    transition: 0.1s ease-in, 0.2s ease-out;
  }

  .text {
    opacity: 0;
  }

  &:hover > img {
    box-shadow: $doomBoxShadowDanger;
    height: 1.8rem;
  }
}
</style>
