const fnFilterEditedValue = (newValue, curCellValue, curRow, col, colDefs) => {
  switch (Object.prototype.toString.call(colDefs[col].filterEditValue)) {
    case '[object Function]':
      return colDefs[col].filterEditValue(newValue, curCellValue, curRow);
    case '[object RegExp]':
      return newValue.replace(colDefs[col].filterEditValue, '');
    case '[object Undefined]':
      return newValue.replace(/[{]|[}]|[<]|[>]|[\\]|[/]/g, '');
    default:
      throw Error(
        `Not valid filterEditValue. Must be Function, RegExp or Undefined. Is ${Object.prototype.toString.call(
          colDefs[col].filterEditValue
        )}`
      );
  }
};

export default fnFilterEditedValue;
