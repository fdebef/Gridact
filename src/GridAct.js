import React, {
  useState, useRef, useEffect
} from 'react';
import ChevronLeftIcon from 'mdi-react/ChevronLeftIcon';
import ChevronDoubleLeftIcon from 'mdi-react/ChevronDoubleLeftIcon';
import ChevronDoubleRightIcon from 'mdi-react/ChevronDoubleRightIcon';
import ChevronRightIcon from 'mdi-react/ChevronRightIcon';
import TableSearchIcon from 'mdi-react/TableSearchIcon';
import TableRowAddBeforeIcon from 'mdi-react/TableRowAddBeforeIcon';
import TableRowRemoveIcon from 'mdi-react/TableRowRemoveIcon';
import FileDocumentBoxesOutlineIcon from 'mdi-react/FileDocumentBoxesOutlineIcon';
import './styling.css';
import DataTable from './DataTable';

const GridAct = (props) => {
  const {
    data, colDefs, tableClasses, pagingOptions, fnRowClass, serverSideEdit, primaryKey, wrapperDivClass,
    showFilter, addRemove, pageSelector, pagingSelector, searchPlaceHolder, onEnterMoveDown
  } = props;
  const [pageActual, setPageActual] = useState(1);
  const [pageLength, setPageLength] = useState(pagingOptions[0] || 10);
  const [tableFilterValue, setTableFilterValue] = useState('');
  const [sortState, setSortState] = useState({ col: undefined, dir: undefined });
  const [, forceRender] = useState(0);

  // --------------------------------------------------------------------------
  // On first data load we create:
  // tableData: will be used for further operations (filtering, sorting)
  // so we still have the original data defined by user (e.g. original sorting)
  // pageData: data of actual page, set to first page on row data load
  // set actualPage to first (1)

  // ref to search field
  const inputFieldRef = useRef(null);
  const data2 = useRef(data.slice()); // copy of props, that can be manipulated.
  const tableData = useRef(data2.current.slice()); // actual table data - filtered, sorted,...
  let pageData = [];
  if (tableData.current.length) {
    pageData = tableData.current.slice((pageActual - 1) * pageLength, pageActual * pageLength);
  }
  const activeCell = useRef([undefined, undefined]);
  // We could handle fnGetActiveCell() variable in Row separately,
  // but through this function we can have only one central

  const fnGetActiveCell = () => activeCell.current;
  const fnSetActiveCell = (newActiveCell) => {
    console.log('CELL STATE CHANGED', newActiveCell);
    activeCell.current = newActiveCell;
  };

  // --------------------------------------------------------------------------
  // refStore stores all refs to currently displayed cells.
  // It is promised-based, as when rendering individual cells, we do not need
  // to wait for this operation - rendering is cca 30% swifter.
  const refStore = useRef({});
  const fnUpdateRefStore = (x, y, cellRef) => new Promise((resolve) => {
    refStore.current[`${String(x)}-${String(y)}`] = cellRef;
    resolve('OK');
  });
  const fnGetRefStore = () => refStore.current;
  const fnGetRef = (x, y) => {
    console.log(x, y, refStore.current);
    return refStore.current[`${String(x)}-${String(y)}`].current;
  };

  useEffect(() => {
  }, []);

  useEffect(() => {
    if (data) {
      if (data.length) {
        data2.current = data.slice();
        tableData.current = data.slice();
      }
    }
  }, [data]);

  useEffect(() => {
    console.log('THIS IS ACTIVE CELL NOW!', fnGetActiveCell());
    if (fnGetActiveCell()[0] >= 0 && fnGetActiveCell()[1] >= 0 && fnGetActiveCell()[1] > pageData.length - 1) {
      activeCell.current = [activeCell.current[0], pageData.length - 1];
      fnGetRef(activeCell.current[0], activeCell.current[1]).focus();
    } else if (fnGetActiveCell()[0] >= 0 && fnGetActiveCell()[1] >= 0) {
      fnGetRef(activeCell.current[0], activeCell.current[1]).focus();
    }
  });


  // --------------------------------------------------------------------------
  // On pageChange we first calculate new page (check of less then 1st and
  // more then all pages. Then calculate actual PageData
  const changePage = (dir) => {
    let newPage = 0; // for calculating new page
    switch (dir) {
      case '-1':
        newPage = pageActual - 1 < 1 ? 1 : pageActual - 1;
        break;
      case '+1':
        newPage = pageActual + 1 > Math.ceil(tableData.current.length / pageLength)
          ? Math.ceil(tableData.current.length / pageLength) : pageActual + 1;
        break;
      case 'first':
        newPage = 1;
        break;
      case 'last':
        newPage = Math.ceil(tableData.current.length / pageLength);
        break;
      default:
        newPage = 1;
    }
    console.log('NEW PAGE = ', newPage, 'pageData: ', tableData);
    // const startIndex = (newPage - 1) * pageLength;
    // const endIndex = newPage * pageLength;
    // pageData = tableData.current.slice(startIndex, endIndex); // calculate pageData
    setPageActual(newPage);
  };

  // --------------------------------------------------------------------------
  // Changing page length, setting new pageData and resetting actual page to 1st.
  const changePageLength = (newPageLength) => { // change page length
    setPageActual(1); // always go back to first page
    setPageLength(newPageLength); // set new page length
  };

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
  // because true should be returned is any cell matches the filter procedure.
  // (Row should be displayed if any cell matches filter)
  // After filter we set new tableData, set pageData to first page and reset
  // pageActual. Setting tableFilterValue we init render.
  // tableFilterValue is also used to table filter.
  const fnChangeTableFilter = (e) => {
    let newTableData = data2.current.slice();
    if (e.target.value.length) {
      const testGroups = String(e.target.value).match(/(\S+)/g);
      newTableData = data2.current.filter(row => Object.keys(row).some((col) => {
        if (row[col]) {
          // list of results false ,true
          const test = testGroups.map(g => String(row[col]).toLowerCase().includes(g.toLowerCase()));
          return test.every(t => t);
        }
        return false;
      }));
    }
    tableData.current = newTableData;
    setPageActual(1);
    setTableFilterValue(e.target.value);
  };

  // --------------------------------------------------------------------------
  // Update data without re-rendering table
  // data in table are updated on row-base, so there is no need
  // re-render whole table.
  // But for further operations (paging, sorting, filtering)
  // must be the actual data prepared.
  const fnUpdateDataOnEditWithoutRender = (newRow) => {
    const idxOfUpdatedRowInData2 = data2.current
      .map(rw => rw[primaryKey])
      .indexOf(newRow[primaryKey]);
    data2.current.splice(idxOfUpdatedRowInData2, 1, newRow);
    const idxOfUpdatedRowInTableData = tableData.current
      .map(rw => rw[primaryKey])
      .indexOf(newRow[primaryKey]);
    tableData.current.splice(idxOfUpdatedRowInTableData, 1, newRow);
  };

  // --------------------------------------------------------------------------
  // Sort table sorts tableData (which might me already filtered)
  // afterSorting we preserve actual page (as the number of records does not change).
  // We use state sortState, so we now which col and what direction the table is
  // currently sorted. We cycle no-sorting -> asc -> desc -> no-sorting.
  // in no-sorting after desc (means going to original sorting) we set sortedData
  // to original data, and have to apply current table filter again.

  const fnSortTable = (col) => {
    if (!colDefs[col].sortable) return;
    let sortedData = [];
    switch (true) {
      case (sortState.col === col && sortState.dir === 'asc'):
        sortedData = tableData.current.slice().sort((a, b) => {
          if (a[col] > b[col]) return -1;
          if (a[col] < b[col]) return 1;
          return 0;
        });
        tableData.current = sortedData;
        setSortState({ col, dir: 'desc' });
        break;
      case (sortState.col === col && sortState.dir === 'desc'):
        sortedData = data2.current.slice();
        if (tableFilterValue.length) { // have to setup applied table filter
          const testGroups = String(tableFilterValue).match(/(\S+)/g);
          sortedData = data2.current.filter(row => Object.keys(row).some((c) => {
            if (row[c]) {
              const test = testGroups.map(g => String(row[c]).toLowerCase().includes(g.toLowerCase())); // list of results false ,true
              return test.every(t => t);
            }
            return false;
          }));
        }
        tableData.current = sortedData;
        setSortState({ col: undefined, dir: undefined });
        break;
      default: // first click => sort asc
        sortedData = tableData.current.slice().sort((a, b) => {
          if (a[col] < b[col]) return -1;
          if (a[col] > b[col]) return 1;
          return 0;
        });
        tableData.current = sortedData;
        setSortState({ col, dir: 'asc' });
    }
  };


  const addRow = () => {
    tableData.current = data2.current;
    serverSideEdit({ operation: 'new' })
      .then((n) => {
        const nR = JSON.parse(n).data;
        data2.current.unshift(nR);
        tableData.current = data2.current.slice();
        // pageData.current.unshift(nR);
        activeCell.current = [0, 0];
        setPageActual(1);
        setTableFilterValue('');
        setSortState({ col: undefined, dir: undefined });
      })
      .catch((err) => {
        throw Error(err);
      });
  };

  const removeRow = () => {
    // prepare deleted data with primaryKey
    if (!(activeCell.current[0] >= 0) || !(activeCell.current[1] >= 0)) return null;
    const delData = {};
    delData[primaryKey] = pageData[fnGetActiveCell()[1]][primaryKey];
    serverSideEdit({ operation: 'delete', data: delData })
      .then((res) => {
        if (!res.error) {
          if (JSON.parse(res).data > 0) {
            // Modify data2 - remove deletedRow
            const idxOfDeletedRow = data2.current
              .map(rw => rw[primaryKey])
              .indexOf(delData[primaryKey]);
            data2.current.splice(idxOfDeletedRow, 1);
            // Modify tableData - remove deletedRow
            const idxOfDeletedRowTableData = tableData.current
              .map(rw => rw[primaryKey])
              .indexOf(delData[primaryKey]);
            tableData.current.splice(idxOfDeletedRowTableData, 1);
            // calculate new pageActual - you can delete last item on page
            if (Math.ceil(data2.current.length / pageLength) < pageActual) {
              // last item of last page was deleted => totalPages < pageActual
              // we have to set last page of new dataSet (shorter of delete line)
              const allPages = Math.ceil(tableData.current.length / pageLength);
              // setPageData(tableData.current.slice((allPages - 1) * pageLength, allPages * pageLength));
              // set new position for cursor focus
              activeCell.current = [activeCell.current[0], pageLength - 1];
              console.log('ACTIVE CELL in fnRemove: ', activeCell, allPages);
              setPageActual(allPages);
            } else {
              // setPageData(tableData.current.slice((pageActual - 1) * pageLength, pageActual * pageLength));
              forceRender(p => p + 1);
            }
          } else {
            console.log('NO ROW REMOVED');
          }
        } else {
          console.log('ERROR ON DATA DELETE: ', res.error);
        }
      })
      .catch((err) => {
        throw Error(err);
      });
  };


  const PagingSelector = () => (
    <>
      <span className="FFInputDesc"><FileDocumentBoxesOutlineIcon /></span>

      <select
        className="FFInputField"
        style={{ width: 'auto' }}
        value={pageLength}
        onChange={(e) => {
          changePageLength(parseInt(e.target.value, 0));
        }}
      >
        {pagingOptions.sort((a, b) => (a - b))
          .map(opt => (<option key={opt} value={opt}>{opt}</option>))}
      </select>
    </>
  );

  const PageSelector = () => (
    <div className="d-flex flex-row align-items-center justify-content-center">
      <button key="1" type="button" className="forward" onClick={() => changePage('first')}>
        {1}
        <ChevronDoubleLeftIcon key="2" />
      </button>
      <button key="3" type="button" className="forward" onClick={() => changePage('-1')}>
        <ChevronLeftIcon key="4" />
      </button>
      <span key="5" className="text-primary">{pageActual}</span>
      <button key="6" type="button" className="forward" onClick={() => changePage('+1')}>
        <ChevronRightIcon key="7" />
      </button>
      <button key="8" type="button" className="forward" onClick={() => changePage('last')}>
        <ChevronDoubleRightIcon key="9" />
        {Math.ceil(tableData.current.length / pageLength)}
      </button>
      <span className="text-success">{` (${tableData.current.length})`}</span>
    </div>
  );

  const AddRemoveButtons = () => (
    <div className="d-flex flex-row">
      <button type="button" title="Add new row..." onClick={e => addRow()} className="add">
        <TableRowAddBeforeIcon />
      </button>
      <button type="button" title="Remove row with cursor..." onClick={removeRow} className="ml-2 remove">
        <TableRowRemoveIcon />
      </button>
    </div>
  );

  console.log('THIS IS PAGE DATA: ', pageData);

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-lg-4 d-flex flex-flow-row d-flex- flex-row
        justify-content-center
        justify-content-lg-start
        align-items-center"
        >
          {showFilter && (
            <div className="d-flex flex-row" key="16">
              <span className="FFInputDesc"><TableSearchIcon /></span>
              <input
                className="FFInputField mr-1"
                style={{ width: '200px' }}
                key="myinputfield"
                type="text"
                onFocus={e => fnSetActiveCell([undefined, undefined])}
                placeholder={searchPlaceHolder}
                value={tableFilterValue}
                onChange={fnChangeTableFilter}
                ref={inputFieldRef}
              />
            </div>
          )
          }
        </div>
        <div className="col-lg-4 d-flex flex-row mt-3 mt-lg-0
        align-items-center
        justify-content-center"
        >
          {addRemove && <AddRemoveButtons addRemove={addRemove} />}
        </div>
        <div className="col-lg-4 mt-3 mt-lg-0 d-flex flex-row
        align-items-center
        justify-content-center
        justify-content-lg-end"
        >
          {pagingSelector && <PagingSelector key="10" />}
          {pageSelector && <PageSelector key="11" />}
        </div>
      </div>
      <div className="row mt-2">
        <DataTable
          key="13"
          data={pageData}
          colDefs={colDefs}
          tableClasses={tableClasses}
          sortTable={fnSortTable}
          sortState={sortState}
          fnUpdateDataOnEditWithoutRender={fnUpdateDataOnEditWithoutRender}
          fnRowClass={fnRowClass}
          serverSideEdit={serverSideEdit}
          primaryKey={primaryKey}
          fnSetActiveCell={fnSetActiveCell}
          fnGetActiveCell={fnGetActiveCell}
          fnUpdateRefStore={fnUpdateRefStore}
          fnGetRefStore={fnGetRefStore}
          removeRow={removeRow}
          wrapperDivClass={wrapperDivClass}
          onEnterMoveDown={onEnterMoveDown}
        />
      </div>
    </div>
  );
};


export default React.memo(GridAct);

//
