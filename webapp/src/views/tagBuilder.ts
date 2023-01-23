import type { ITagProp } from '@/interfaces'
import { proxyToArray, extractTagsFromString } from '@/utils/itemsFilters'

/* Return an array of tag names from the items list sorted by most occurrences. */
export const getAllTagsFromItems = (items: Array<any>): Array<string> => {
  const tags: any = {}
  proxyToArray(items).forEach((i: any) => {
    i.tags.forEach((tag: string) => {
      if (!(tag in tags)) tags[tag] = 0
      tags[tag] += 1
    })
  })

  const result = Object.keys(tags).sort((key1: any, key2: any) => {
    const value1 = tags[key1]
    const value2 = tags[key2]
    return value1 < value2 ? key1 : key2;
  })

  return result
} // getAllTagsFromItems


/* Return a list of ITagProp from the given tags array and mark a tag "active" if
 * it shows up in the targetString.
 */
export const getTagsFromString = (tags: Array<any>, targetString: string): Array<ITagProp> => {
  const searched = extractTagsFromString(targetString)
  const result = tags.map((t: any) => {
    return {
      name: t,
      active: searched.indexOf(`#${t}`) >= 0
    }
  }) // map
  return result
} // getTagsFromString


/* tag toggle from the search string: remove tag name from the search when it
 * trying to add the same one.
 */
export const toggleTagFromString = (target: string, tagName: string) => {
  let result = target
  if (target.includes(`#${tagName}`))
    result = target.replace(`#${tagName}`, '').trim()
  else
    result = `${target} #${tagName}`.trim()

  return result
} // toggleTagFromString
