import dayjs from 'dayjs'

export const findTag = (tags: Array<any>, wordToFind: string) => {
  return tags?.find((tag: any) => {
    return tag?.replace('#', '').startsWith(wordToFind.replace('#', ''))
  })
} // findTag


export const findAuthor = (authors: Array<any>, wordToFind: string) => {
  return authors.find((author: any) => {
    return author?.name.toLowerCase().startsWith(wordToFind.toLowerCase())
  })
} // findAuthor


export const findDate = (date: string, wordToFind: string) => {
  return dayjs(date).format('MMM D YYYY').split(' ').find((day: any) => {
    return day.toLowerCase() === (wordToFind.toLowerCase())
  })
} // findDate


export const findWordInTitle = (title: string, wordToFind: string) => {
  return title.split(' ').find((word: string) => {
    return word.toLowerCase().startsWith(wordToFind.toLowerCase())
  })
} // findWordInTitle
