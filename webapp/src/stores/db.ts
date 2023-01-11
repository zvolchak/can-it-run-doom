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


export const useDbStore = defineStore('db', () => {
  const items = ref([])
  const bounties = ref([])

  const fetchAllData = async (locale: string | null = 'en') => {
    const enUrl = import.meta.env.VITE_DB_URL.format(locale || 'en')
    const { data } = await axios.get(enUrl)

    items.value = { ...data.items }
  }


  const fetchBountyData = async (locale: string | null = 'en') => {
    const enUrl = import.meta.env.VITE_BOUNTY_DB_URL.format(locale || 'en')
    const { data } = await axios.get(enUrl)

    bounties.value = { ...data.bounty }
  }

  return { items, bounties, fetchAllData, fetchBountyData }
})
