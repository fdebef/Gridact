const checkPageLength = (pageActual, tableData, pageLength) => {

  if (
    pageActual.current > 1 &&
    Math.ceil(tableData.length / pageLength.current) <
      pageActual.current
  ) {
    pageActual.current = Math.ceil(
      tableData.length / pageLength.current
    );
  }
};

export default checkPageLength;
