const sortTableData = (
  data2,
  sortState,
  setTableData,
) => {
  console.log('UPDATING STATE!!!!!!!!!!!!!!!!!!!!!!!');
  if (sortState.current.dir === 'desc') {
    setTableData(
      data2.slice().sort((a, b) => {
        if ((a[sortState.current.col] || 0) < (b[sortState.current.col] || 0))
          return 1;
        if ((a[sortState.current.col] || 0) > (b[sortState.current.col] || 0))
          return -1;
        return 0;
      })
    );
  } else if (sortState.current.dir === 'asc') {
    setTableData(
      data2.slice().sort((a, b) => {
        if ((a[sortState.current.col] || 0) < (b[sortState.current.col] || 0))
          return -1;
        if ((a[sortState.current.col] || 0) > (b[sortState.current.col] || 0))
          return 1;
        return 0;
      })
    );
  } else {
    setTableData(data2.slice());
  }
};

export default sortTableData;
