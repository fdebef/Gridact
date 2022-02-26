const updatePageDataWithRow = (newRow, y, setPageData) => {
  setPageData((prev) => {
    prev.splice(y, 1, newRow);
    return prev;
  });
};

export default updatePageDataWithRow;
