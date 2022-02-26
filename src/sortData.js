const valueEval = (val) => {
  if (Number.isNaN(parseInt(val))) {
    return val.toLowerCase();
  }
  return val;
};

const sortData = (data, sortState) => {
  if (sortState.current.dir === 'desc') {
    return data.slice().sort((a, b) => {
      if (a[sortState.current.col] === null || a[sortState.current.col] === '')
        return 1;
      if (b[sortState.current.col] === null || b[sortState.current.col] === '')
        return -1;
      if (
        (valueEval(a[sortState.current.col]) || 0) <
        (valueEval(b[sortState.current.col]) || 0)
      )
        return 1;
      if (
        (valueEval(a[sortState.current.col]) || 0) >
        (valueEval(b[sortState.current.col]) || 0)
      )
        return -1;
    });
  }
  if (
    sortState.current.dir === 'asc' ||
    sortState.current.col === 'gridactPrimaryKey'
  ) {
    return data.slice().sort((a, b) => {
      if (a[sortState.current.col] === null || a[sortState.current.col] === '')
        return 1;
      if (b[sortState.current.col] === null || b[sortState.current.col] === '')
        return -1;
      if (
        (valueEval(a[sortState.current.col]) || 0) <
        (valueEval(b[sortState.current.col]) || 0)
      )
        return -1;
      if (
        (valueEval(a[sortState.current.col]) || 0) >
        (valueEval(b[sortState.current.col]) || 0)
      )
        return 1;
      return 0;
    });
  }
  return data.slice();
};

export default sortData;
