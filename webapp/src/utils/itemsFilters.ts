import dayjs from 'dayjs'

export const findTag = (tags: Array<any>, wordToFind: string) => {
  if (!wordToFind.startsWith('#')) return undefined

  return tags?.find((tag: any) => {
    // console.debug(`word: [${wordToFind.replace('#', '')}] -> tag: [${tag?.replace('#', '')}]`)
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
  if (searching.indexOf('#') >= 0)
    keywords = searching.split('#').filter(i => i.trim()).map(i => `#${i}`.trim())

  if (keywords.length === 0) {
    return items
  }

  items = items.filter((item: any) => {
    return keywords.find((word: string) => {
      const foundTag = findTag(item.tags, word)
      if (foundTag) {
        return foundTag
      }

      const foundAuthor = findAuthor(item.authors, word)
      if (foundAuthor) return foundAuthor

      const foundTitleWord = findWordInTitle(item.title, word)
      if (foundTitleWord) return foundTitleWord

      return findDate(item.publishDate, word)
    }) // keywords
  }) as any // items

  return items
} // onSearch


export const proxyArrayToNormal = (target: any): any => {
  // idk WTF this is and why. Cause Proxy... but still.
  const values = Object.values(JSON.parse(JSON.stringify(target)))
  // @ts-ignore
  return values.sort((a: any, b: any) =>
    dayjs(a.publishDate).isAfter(dayjs(b.publishDate))
  )
} // proxyArrayToNormal
