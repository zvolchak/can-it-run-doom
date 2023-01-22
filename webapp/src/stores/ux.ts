import { ref } from 'vue'
import { defineStore } from 'pinia'


export const useUXStore = defineStore('ux', () => {
  const currentLocale = ref('en')
  const currentSearch: { [key: string]: any } = ref({})


  function setLocale(newLocale: string) {
    currentLocale.value = newLocale
  }


  function setCurrentSearch(fieldName: string, searchStr: string) {
    currentSearch.value[fieldName] = searchStr
  }

  return { currentLocale, currentSearch, setLocale, setCurrentSearch }
})
