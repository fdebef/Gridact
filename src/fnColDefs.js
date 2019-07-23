const fnColDefs = (thClassVal, col) => {
  switch (Object.prototype.toString.call(thClassVal)) {
    case '[object Array]':
      return thClassVal.join(' ');
    case '[object String]':
      return thClassVal;
    case '[object Function]':
      return thClassVal(col); // function for thClass defined
    case '[object Undefined]':
      return undefined;
    default:
      return undefined;
  }
};

export default fnColDefs;
