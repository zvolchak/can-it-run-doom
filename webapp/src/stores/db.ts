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


const fetchDB = async (url: string, locale: string | null | undefined) => {

}


export const useDbStore = defineStore('db', () => {
  const items = ref([])
  const bounties = ref([])

  const fetchAllData = async (locale: string | null | undefined) => {
    const enUrl = import.meta.env.VITE_DB_URL.format('en')
    const { data } = await axios.get(enUrl)

    items.value = { ...data.items }
  }


  const fetchBountyData = async (locale: string | null | undefined) => {
    let url = import.meta.env.VITE_BOUNTY_DB_URL.format('en')
    const { data } = await axios.get(url)
    let langData
    if (locale && locale?.toLowerCase() !== 'en') {
      url = import.meta.env.VITE_BOUNTY_DB_URL.format(locale)
      try {
        // @ts-ignore
        langData = await axios.get(url)
      } catch(error) {
        console.error(`Couldn't fetch bounties for lang ${locale}`)
      }
      data.bounty = mergeById(data.bounty, langData?.data.bounty || {})
    } // if

    bounties.value = { ...data.bounty }
  }

  return { items, bounties, fetchAllData, fetchBountyData }
})
