export const paginate = (target: Array<any>, currentPage: number, itemsPerPage: number): any => {
  const result = [ ...target ]
  if (currentPage < 0 ) currentPage = 0

  const start = (itemsPerPage * currentPage)
  // if (currentPage !== 0) start = start + 1
  console.log(`${target.length} : ${currentPage} -> ${start} : ${itemsPerPage}`)
  return result.splice(start, itemsPerPage)
} // paginate
