import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'


export const useDbStore = defineStore('db', () => {
  const items = ref([])
  const bounties = ref([])

  const fetchAllData = async () => {
    const url = import.meta.env.VITE_DB_URL
    const { data } = await axios.get(url)

    items.value = { ...data.items }
  }


  const fetchBountyData = async () => {
    const url = import.meta.env.VITE_BOUNTY_DB_URL
    const { data } = await axios.get(url)

    bounties.value = { ...data.bounty }
  }

  return { items, bounties, fetchAllData, fetchBountyData }
})
