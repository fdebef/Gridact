const fnFilterEditChar = (char, curCellValue, curRow, col, colDefs) => {
  try {
    if (colDefs[col].filterEditChar) {
      switch (Object.prototype.toString.call(colDefs[col].filterEditChar)) {
        case '[object Function]':
          return colDefs[col].filterEditChar(char, curCellValue, curRow);
        case '[object RegExp]':
          return Boolean(char.match(colDefs[col].filterEditChar));
        case '[object Undefined]':
          return Boolean(
            char.match(/[ěščřžýáíéóúůďťňĎŇŤŠČŘŽÝÁÍÉÚŮa-zA-Z0-9 .,-]/)
          );
        default:
          throw Error(
            `Not valid filterEditValue. Must be Function, RegExp or Undefined. Is ${Object.prototype.toString.call(
              colDefs[col].filterEditChar
            )}`
          );
      }
    } else {
      return char;
    }
  } catch (e) {
    console.log(colDefs[col]);
    console.log('FN FILTER EDIT CHAR NOT WORKING: ', { col }, { colDefs });
  }
};
export default fnFilterEditChar;
