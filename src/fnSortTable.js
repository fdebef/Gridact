// --------------------------------------------------------------------------
// Sort table sorts tableData (which might me already filtered)
// afterSorting we preserve actual page (as the number of records does not change).
// We use state sortState, so we now which col and what direction the table is
// currently sorted. We cycle no-sorting -> asc -> desc -> no-sorting.
// in no-sorting after desc (means going to original sorting) we set sortedData
// to original data, and have to apply current table filter again.

import sortData from './sortData';

const fnSortTable = (
  col,
  tableData,
  sortState,
  colDefs,
  pageLength,
  pageActual,
  data2,
  setTableData
) => {
  if (!colDefs[col].sortable) return;
  switch (true) {
    case sortState.current.col === col && sortState.current.dir === 'asc':
      sortState.current = { col, dir: 'desc' };
      break;
    case sortState.current.col === col && sortState.current.dir === 'desc':
      sortState.current = { col: 'gridactPrimaryKey', dir: undefined };
      break;
    default:
      // first click => sort asc
      sortState.current = { col, dir: 'asc' };
  }
  console.log('SORTSTATE: ', sortState.current);
  setTableData(sortData(tableData, sortState));
};

export default fnSortTable;
