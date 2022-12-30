import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'


export const useDbStore = defineStore('db', () => {
  const items = ref([])

  const fetchAllData = async () => {
    const url = import.meta.env.VITE_DB_URL
    const { data } = await axios.get(url)
    // @ts-ignore
    items.value = { ...data.items }
  }

  return { items, fetchAllData }
})
