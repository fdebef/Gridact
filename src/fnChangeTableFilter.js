// --------------------------------------------------------------------------
// This function is called on input field change (onChange).
// Changing table filter -> calculate new tableData from data
// We filter to match all words in filter field to match cell value
// E.g. "blue car" filter will match cell "this car is blue"
// First we split with regex filter value into groups and then filter
// every row and col in data.
// From every cell we return [true, false, true,...] => test result for
// each of filter words.
// with Array.prototype.every we return true/false if all test passed.
// Result of all cells in row is then tested with Array.prototype.some
// because true should be returned if any cell matches the filter procedure.
// (Row should be displayed if any cell matches filter)
// After filter we set new tableData, set pageData to first page and reset
// pageActual.

const fnChangeTableFilter = (
  value,
  data2,
  tableData,
  setFilteredData,
  setTableData
) => {
  let newTableData = data2.current.slice();
  if (value.length) {
    const testGroups = String(value).match(/(\S+)/g);
    newTableData = newTableData.filter((row) =>
      Object.keys(row).some((col) => {
        if (row[col]) {
          // list of results false ,true
          const test = testGroups.map((g) =>
            String(row[col]).toLowerCase().includes(g.toLowerCase())
          );
          return test.every((t) => t);
        }
        return false;
      })
    );
  }
  setTableData(newTableData);
};

export default fnChangeTableFilter;
