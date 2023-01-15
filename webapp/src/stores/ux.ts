import { ref } from 'vue'
import { defineStore } from 'pinia'


export const useUXStore = defineStore('ux', () => {
  const currentLocale = ref('en')

  function setLocale(newLocale: string) {
    currentLocale.value = newLocale
  }

  return { currentLocale, setLocale }
})
