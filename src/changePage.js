// --------------------------------------------------------------------------
// On pageChange we first calculate new page (check if less then 1st and
// more then all pages. Then calculate actual PageData

const changePage = (dir, pageActual, tableData, pageLength, setPageData) => {
  let newPage = 0; // for calculating new page
  switch (dir) {
    case '-1':
      newPage = pageActual.current - 1 < 1 ? 1 : pageActual.current - 1;
      break;
    case '+1':
      newPage =
        pageActual.current + 1 >
        Math.ceil(tableData.length / pageLength.current)
          ? Math.ceil(tableData.length / pageLength.current)
          : pageActual.current + 1;
      break;
    case 'first':
      newPage = 1;
      break;
    case 'last':
      newPage = Math.ceil(tableData.length / pageLength.current);
      break;
    default:
      newPage = 1;
  }
  // const startIndex = (newPage - 1) * pageLength;
  // const endIndex = newPage * pageLength;
  // pageData = tableData.current.slice(startIndex, endIndex); // calculate pageData
  pageActual.current = newPage;
  setPageData(
    tableData.slice(
      (newPage - 1) * pageLength.current,
      newPage * pageLength.current
    )
  );
};

export default changePage;
