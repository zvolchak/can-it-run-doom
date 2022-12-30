import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'


export interface IDBState {
  items: Array<any>
}


const state = {
    items: [],
} // state


const store = () => {
  const items = ref([])

  const fetchAllData = async () => {
    const { data } = await axios.get('http://localhost:5173/db.json')
    // @ts-ignore
    this.items = { ...data.items }
  }

  return { items, fetchAllData }
}


export const useDbStore = defineStore('db', () => {
  const items = ref([])

  const fetchAllData = async () => {
    const { data } = await axios.get('http://localhost:5173/db.json')
    // @ts-ignore
    items.value = { ...data.items }
  }

  return { items, fetchAllData }
})
