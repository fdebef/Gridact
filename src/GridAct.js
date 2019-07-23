import React, {
  useState, useRef, useEffect, useContext
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
import TransferContext from '../context/TransferContext';

//-----------------------------------------------------
// Subcomponents for main component

const PagingSelector = (props) => {
  const { pageLength, changePageLength, pagingOptions } = props;
  return (
    <>
      <span key="17" className="FFInputDesc">
        <FileDocumentBoxesOutlineIcon />
      </span>

      <select
        className="FFInputField paging-font"
        style={{ width: 'auto' }}
        value={pageLength}
        onChange={changePageLength}
      >
        {pagingOptions
          .sort((a, b) => a - b)
          .map(opt => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
      </select>
    </>
  );
};

const PageSelector = (props) => {
  const {
    changePage, tableDataLength, pageLength, pageActual
  } = props;
  return (
    <div key="18" className="display-inline align-right">
      <button
        key="1"
        type="button"
        className="forward paging-font"
        onClick={() => changePage('first')}
      >
        {1}
        <ChevronDoubleLeftIcon key="2" />
      </button>
      <button
        key="3"
        type="button"
        className="forward paging-font"
        onClick={() => changePage('-1')}
      >
        <ChevronLeftIcon key="4" />
      </button>
      <span key="5" className="paging-font">
        {pageActual}
      </span>
      <button
        key="6"
        type="button"
        className="forward paging-font"
        onClick={() => changePage('+1')}
      >
        <ChevronRightIcon key="7" />
      </button>
      <button
        key="8"
        type="button"
        className="forward paging-font"
        onClick={() => changePage('last')}
      >
        <ChevronDoubleRightIcon key="9" />
        {Math.ceil(tableDataLength / pageLength)}
      </button>
      <span className="paging-font">{` (${tableDataLength})`}</span>
    </div>
  );
};

const AddRemoveButtons = (props) => {
  const { addRow, removeRow } = props;
  return (
    <div key="19" className="display-inline align-center">
      <button
        key="20"
        type="button"
        title="Add new row..."
        onClick={addRow}
        className="add"
      >
        <TableRowAddBeforeIcon />
      </button>
      <button
        key="21"
        type="button"
        title="Remove row with cursor..."
        onClick={removeRow}
        className="ml-2 remove"
      >
        <TableRowRemoveIcon />
      </button>
    </div>
  );
};

// --------------------------------------------------------------------------
// Main GridAct component

const GridAct = (props) => {
  const {
    data,
    colDefs,
    tableClasses,
    pagingOptions,
    fnRowClass,
    serverSideEdit,
    primaryKey,
    wrapperDivClass,
    showFilter,
    addRemove,
    pageSelector,
    pagingSelector,
    searchPlaceHolder,
    onEnterMoveDown,
    tableCellClass,
    setFilteredData
  } = props;
  const [pageData, setPageData] = useState([]);
  const pageActual = useRef(1);
  const pageLength = useRef(pagingOptions[0] || 10);
  const tableFilterValue = useRef('');
  const sortState = useRef({ col: undefined, dir: undefined });

  // --------------------------------------------------------------------------
  // On first data load we create:
  // tableData: will be used for further operations (filtering, sorting)
  // so we still have the original data defined by user (e.g. original sorting)
  // pageData: data of actual page, set to first page on row data load
  // set actualPage to first (1)
  // ref to search field
  const inputFieldRef = useRef(null);
  const data2 = useRef(data.slice()); // copy of props, that can be manipulated.
  const tableData = useRef([]); // actual table data - filtered, sorted,...
  const activeCell = useRef([undefined, undefined]);
  // We could handle fnGetActiveCell() variable in Row separately,
  // but through this function we can have only one central

  const fnGetActiveCell = () => activeCell.current;
  const fnSetActiveCell = (newActiveCell) => {
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
  const fnGetRef = (x, y) => refStore.current[`${String(x)}-${String(y)}`].current;

  useEffect(() => {
    if (data) {
      if (data.length) {
        data2.current = data.slice();
        tableData.current = data.slice();
        tableFilterValue.current = '';
        sortState.current = { col: undefined, dir: undefined };
        pageActual.current = 1;
        // setPageLength not necessary, only to keep exhaustive-deps lint rule
        setPageData(tableData.current.slice(0, pageLength.current));
      }
    }
  }, [data]);

  useEffect(() => {
    if (
      activeCell.current[0] >= 0
      && activeCell.current[1] >= 0
      && activeCell.current[1] > pageData.length - 1
    ) {
      activeCell.current = [activeCell.current[0], pageData.length - 1];
      fnGetRef(activeCell.current[0], activeCell.current[1]).focus();
    } else if (activeCell.current[0] >= 0 && activeCell.current[1] >= 0) {
      fnGetRef(activeCell.current[0], activeCell.current[1]).focus();
    }
  });

  // --------------------------------------------------------------------------
  // On pageChange we first calculate new page (check if less then 1st and
  // more then all pages. Then calculate actual PageData
  const changePage = (dir) => {
    let newPage = 0; // for calculating new page
    switch (dir) {
      case '-1':
        newPage = pageActual.current - 1 < 1 ? 1 : pageActual.current - 1;
        break;
      case '+1':
        newPage = pageActual.current + 1
          > Math.ceil(tableData.current.length / pageLength.current)
          ? Math.ceil(tableData.current.length / pageLength.current)
          : pageActual.current + 1;
        break;
      case 'first':
        newPage = 1;
        break;
      case 'last':
        newPage = Math.ceil(tableData.current.length / pageLength.current);
        break;
      default:
        newPage = 1;
    }
    // const startIndex = (newPage - 1) * pageLength;
    // const endIndex = newPage * pageLength;
    // pageData = tableData.current.slice(startIndex, endIndex); // calculate pageData
    pageActual.current = newPage;
    setPageData(
      tableData.current.slice(
        (newPage - 1) * pageLength.current,
        newPage * pageLength.current
      )
    );
  };

  // --------------------------------------------------------------------------
  // Changing page length, setting new pageData and resetting actual page to 1st.
  const changePageLength = (e) => {
    // change page length
    pageActual.current = 1; // always go back to first page
    pageLength.current = parseInt(e.target.value, 0); // set new page length
    setPageData(tableData.current.slice(0, pageLength.current));
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
          const test = testGroups.map(g => String(row[col])
            .toLowerCase()
            .includes(g.toLowerCase()));
          return test.every(t => t);
        }
        return false;
      }));
    }
    tableData.current = newTableData;
    if (Object.prototype.toString.call(setFilteredData) === '[object Function]') {
      setFilteredData(newTableData);
    }
    pageActual.current = 1;
    tableFilterValue.current = e.target.value;
    setPageData(tableData.current.slice(0, pageLength.current));
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
    console.log('......................updating without render');
    setFilteredData((prev) => {
      const p = prev.slice()
      console.log('PREV FILT DATA', p)
      const idxOfPrevFilterData = p.map(rw => rw[primaryKey]).indexOf(newRow[primaryKey]);
      p.splice(idxOfPrevFilterData, 1, newRow);
      console.log('CHANGED FILT DATA: ', p)
      return p;
    });
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
      case sortState.current.col === col && sortState.current.dir === 'asc':
        sortedData = tableData.current.slice().sort((a, b) => {
          if (a[col] > b[col]) return -1;
          if (a[col] < b[col]) return 1;
          return 0;
        });
        tableData.current = sortedData;
        sortState.current = { col, dir: 'desc' };
        setPageData(
          tableData.current.slice(
            (pageActual.current - 1) * pageLength.current,
            pageActual.current * pageLength.current
          )
        );
        break;
      case sortState.current.col === col && sortState.current.dir === 'desc':
        sortedData = data2.current.slice();
        if (tableFilterValue.current.length) {
          // have to setup applied table filter
          const testGroups = String(tableFilterValue.current).match(/(\S+)/g);
          sortedData = data2.current.filter(row => Object.keys(row).some((c) => {
            if (row[c]) {
              const test = testGroups.map(g => String(row[c])
                .toLowerCase()
                .includes(g.toLowerCase())); // list of results false ,true
              return test.every(t => t);
            }
            return false;
          }));
        }
        tableData.current = sortedData;
        sortState.current = { col: undefined, dir: undefined };
        setPageData(
          tableData.current.slice(
            (pageActual.current - 1) * pageLength.current,
            pageActual.current * pageLength.current
          )
        );
        break;
      default:
        // first click => sort asc
        sortedData = tableData.current.slice().sort((a, b) => {
          if (a[col] < b[col]) return -1;
          if (a[col] > b[col]) return 1;
          return 0;
        });
        tableData.current = sortedData;
        sortState.current = { col, dir: 'asc' };
        setPageData(
          tableData.current.slice(
            (pageActual.current - 1) * pageLength.current,
            pageActual.current * pageLength.current
          )
        );
    }
  };

  const addRow = () => {
    tableData.current = data2.current;
    serverSideEdit({ operation: 'new' })
      .then((rs) => {
        let parsedRes;
        if (typeof rs === 'string') {
          try {
            // try to parse as JSON
            parsedRes = JSON.parse(rs);
          } catch (e) {
            throw Error(`Not a JSON string ${JSON.stringify(e)}`);
          }
        } else if (typeof rs === 'object') {
          try {
            // try to parse as JSON
            parsedRes = JSON.parse(JSON.stringify(rs));
          } catch (e) {
            throw Error(`Not a valid JSON ${JSON.stringify(e)}`);
          }
        } else throw Error('Not a valid JSON string nor JSON object');

        data2.current.unshift(parsedRes.data);
        tableData.current = data2.current.slice();
        // pageData.current.unshift(nR);
        activeCell.current = [0, 0];
        pageActual.current = 1;
        tableFilterValue.current = '';
        sortState.current = { col: undefined, dir: undefined };
        setPageData(tableData.current.slice(0, pageLength.current));
      })
      .catch((err) => {
        throw Error(err);
      });
  };

  const removeRow = () => {
    // prepare deleted data with primaryKey
    if (!(activeCell.current[0] >= 0) || !(activeCell.current[1] >= 0)) return null;
    const delData = {};
    delData[primaryKey] = pageData[activeCell.current[1]][primaryKey];
    serverSideEdit({ operation: 'delete', data: delData })
      .then((rs) => {
        console.log('RETURNED FROM SERVER: ', rs);
        let parsedRes;
        if (typeof rs === 'string') {
          try {
            // try to parse as JSON
            parsedRes = JSON.parse(rs);
          } catch (e) {
            throw Error(`Not a JSON string ${JSON.stringify(e)}`);
          }
        } else if (typeof rs === 'object') {
          try {
            // try to parse as JSON
            parsedRes = JSON.parse(JSON.stringify(rs));
          } catch (e) {
            throw Error(`Not a valid JSON ${JSON.stringify(e)}`);
          }
        } else throw Error('Not a valid JSON string nor JSON object');
        console.log('PARSED RES: ', parsedRes);
        if (!parsedRes.error) {
          if (parsedRes.data > 0) {
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
            console.log('new table data', tableData);
            // calculate new pageActual - you can delete last item on page
            const allPages = Math.ceil(
              tableData.current.length / pageLength.current
            );
            if (allPages < pageActual.current) {
              console.log('LAST ITEM OF LAST PAGE');
              // last item of last page was deleted => totalPages < pageActual
              // we have to set last page of new dataSet (shorter of delete line)
              // set new position for cursor focus
              activeCell.current = [
                activeCell.current[0],
                pageLength.current - 1
              ];
              console.log(
                'actualPage: ',
                pageActual.current,
                'allPages: ',
                allPages
              );
              console.log('ACTIVE CELL AFTER CHANGE: ', activeCell.current);
              pageActual.current = allPages;
              setPageData(
                tableData.current.slice(
                  (allPages - 1) * pageLength.current,
                  allPages * pageLength.current
                )
              );
            } else {
              console.log('NOT LAST ITEM ON PAGE');
              setPageData(
                tableData.current.slice(
                  (pageActual.current - 1) * pageLength.current,
                  pageActual.current * pageLength.current
                )
              );
            }
          } else {
            console.log('NO ROW REMOVED');
          }
        } else {
          console.log('ERROR ON DATA DELETE: ', parsedRes.error);
        }
      })
      .catch((err) => {
        throw Error(err);
      });
  };

  return (
    <div className="main-table-container">
      <div className="table-control">
        {showFilter && (
          <div className="search-control display-inline">
            <span className="FFInputDesc">
              <TableSearchIcon />
            </span>
            <input
              className="FFInputField paging-font"
              style={{ width: '200px' }}
              key="myinputfield"
              type="text"
              onFocus={e => fnSetActiveCell([undefined, undefined])}
              placeholder={searchPlaceHolder}
              value={tableFilterValue.current}
              onChange={fnChangeTableFilter}
              ref={inputFieldRef}
            />
          </div>
        )}
        {addRemove && (
          <div className="add-remove-control display-inline">
            <AddRemoveButtons
              addRow={addRow}
              removeRow={removeRow}
              addRemove={addRemove}
            />
          </div>
        )}
        <div className="paging-control display-inline">
          {pagingSelector && (
            <PagingSelector
              pageLength={pageLength.current}
              changePageLength={changePageLength}
              pagingOptions={pagingOptions}
              key="10"
            />
          )}
          {pageSelector && (
            <PageSelector
              changePage={changePage}
              tableDataLength={tableData.current.length}
              pageLength={pageLength.current}
              pageActual={pageActual.current}
              key="11"
            />
          )}
        </div>
      </div>

      <DataTable
        key="13"
        pageData={pageData}
        colDefs={colDefs}
        tableClasses={tableClasses}
        sortTable={fnSortTable}
        sortState={sortState.current}
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
        tableCellClass={tableCellClass}
        setPageData={setPageData}
      />
    </div>
  );
};

export default React.memo(GridAct);

//
