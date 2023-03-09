import dayjs from 'dayjs'


export const findTag = (tags: Array<any>, wordToFind: string) => {
  if (!wordToFind.startsWith('#')) return undefined

  return tags?.find((tag: any) => {
    return tag?.replace('#', '').startsWith(wordToFind.replace('#', ''))
  })
} // findTag


export const findAuthor = (authors: Array<any>, wordToFind: string) => {
  return authors?.find((author: any) => {
    return author?.name.toLowerCase().startsWith(wordToFind.toLowerCase())
  })
} // findAuthor


export const findDate = (date: string, wordToFind: string) => {
  return dayjs(date).format('MMM D YYYY').split(' ').find((day: any) => {
    return day.toLowerCase() === (wordToFind.toLowerCase())
  })
} // findDate


export const findWordInTitle = (title: string, wordToFind: string) => {
  return title?.split(' ').find((word: string) => {
    return word.toLowerCase().startsWith(wordToFind.toLowerCase())
  })
} // findWordInTitle


export const onSearch = (searching: string, items: Array<any>): any => {
  let keywords = searching?.split(' ').filter(i => !!i)
  const isSearchByTag = searching.startsWith('#')
  if (isSearchByTag)
    keywords = extractTagsFromString(searching)

  if (keywords.length === 0) {
    return items
  }

  items = items.filter((item: any) => {
    if (isSearchByTag) {
      const foundTags = item.tags.filter((i: any) => keywords.includes(`#${i}`))
      return foundTags.length === keywords.length
    }

    return keywords.find((word: string) => {
      const foundTag = findTag(item.tags, word)
      if (foundTag) {
        return foundTag
      }

      const foundAuthor = findAuthor(item.authors, word)
      if (foundAuthor) return foundAuthor

      const foundTitleWord = findWordInTitle(item.title, word)
      if (foundTitleWord) return foundTitleWord

      const foundId = `${item.id}`.startsWith(word)
      if (foundId) return word

      return findDate(item.publishDate, word)
    }) // keywords
  }) as any // items

  return items
} // onSearch


export const proxyToArray = (target: any): any => {
  // idk WTF this is and why. Cause Proxy... but still.
  const values = Object.values(JSON.parse(JSON.stringify(target)))
  // @ts-ignore
  return values.sort((a: any, b: any) =>
    dayjs(a.publishDate).isAfter(dayjs(b.publishDate))
  )
} // proxyToArray


export const proxyToObject = (target: any): any => {
  return JSON.parse(JSON.stringify(target))
}


export const extractTagsFromString = (target: string) => {
  return target.split('#').filter(i => i.trim()).map(i => `#${i}`.trim())
}
