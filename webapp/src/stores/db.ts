import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

// @ts-ignore
String.prototype.format = function () {
  // eslint-disable-next-line prefer-rest-params
  const args = arguments
  // use replace to iterate over the string
  // select the match and check if the related argument is present
  // if yes, replace the match with the argument
  return this.replace(/{([0-9]+)}/g, function (match, index) {
    // check if the argument is present
    return typeof args[index] == 'undefined' ? match : args[index]
  })
}


const mergeById = (orig: Array<any>, toMerge: Array<any>) => {
  if (!toMerge) return orig

  for(const key in toMerge) {
    const target = toMerge[key]
    const index = orig.findIndex((i) => i?.id === target?.id)
    if (index < 0) continue

    orig[index] = { ...target }
  } // for
  return orig
} // mergeById


const fetchDB = async (url: string, localeUrl?: string | null) => {
  const { data } = await axios.get(url)
  const keyName = Object.keys(data)[0]
  let langData
  if (localeUrl) {
    try {
      langData = await axios.get(localeUrl)
    } catch(error) {
      console.error(`Couldn't fetch ${url}`)
    }
    data[keyName] = mergeById(data[keyName], langData?.data[keyName] || {})
  } // if
  return data
}


export const useDbStore = defineStore('db', () => {
  const items = ref([])
  const bounties = ref([])

  const fetchItemsData = async (locale?: string | null | undefined) => {
    const url = import.meta.env.VITE_DB_URL.format('en')
    const localeUrl = locale !== 'en' ? import.meta.env.VITE_DB_URL.format(locale) : null
    const data = await fetchDB(url, localeUrl)
    items.value = { ...data.items }
  }


  const fetchBountyData = async (locale: string | null | undefined) => {
    const url = import.meta.env.VITE_BOUNTY_DB_URL.format('en')
    const localeUrl = locale !== 'en' ? import.meta.env.VITE_BOUNTY_DB_URL.format(locale) : null
    const data = await fetchDB(url, localeUrl)

    bounties.value = { ...data.bounty }
  }

  return { items, bounties, fetchItemsData, fetchBountyData }
})
