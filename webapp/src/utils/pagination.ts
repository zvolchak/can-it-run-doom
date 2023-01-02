export const paginate = (target: Array<any>, currentPage: number, itemsPerPage: number): any => {
  const result = [ ...target ]
  if (currentPage < 0 ) currentPage = 0

  const start = (itemsPerPage * currentPage)
  return result.splice(start, itemsPerPage)
} // paginate
