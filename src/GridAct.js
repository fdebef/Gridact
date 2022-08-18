import React, { useEffect, useRef, useState, useCallback } from 'react';
import SearchIcon from '../../static/images/icons/searchIcon.svg';
import './styling.css';
import './tableStyling.css';
import DataTable from './DataTable';
import CellModalWarning from './CellModalWarning';
import checkPageLength from './checkPageLength';
import changePage from './changePage';
import PageSelector from './pageSelector';
import fnChangeTableFilter from './fnChangeTableFilter';
import removeRow from './removeRow';
import PagingSelector from './PagingSelector';
import addRow from './addRow';
import AddRemoveButtons from './AddRemoveButtons';
import GridContext from './GridContext/GridContext';
import navigation from './fnNavigation';
import fnSortTable from './fnSortTable';
import sortData from './sortData';

// --------------------------------------------------------------------------
// Main GridAct component

const primaryKey = 'gridactPrimaryKey';

const useFilter = (filter = '', updateFn) => {
  const [state, setState] = useState(filter);

  const changeFilter = useCallback((newValue) => {
    setState(newValue);
    updateFn(newValue);
  }, []);

  return [state, changeFilter];
};

const GridAct = (props) => {
  const {
    data,
    setData,
    colDefs,
    tableClasses,
    pagingOptions,
    fnRowClass,
    serverSideEdit,
    wrapperDivClass,
    showFilter,
    addRemove,
    pageSelector,
    pagingSelector,
    searchPlaceHolder,
    onEnterMoveDown,
    tableCellClass,
    setFilteredData,
    initSort,
    mainTableContainerClass,
    filterValue,
  } = props;
  // hook 1
  const [pageData, setPageData] = useState([]);
  // hook 2
  const pageActual = useRef(1);
  // hook 3
  const pageLength = useRef(pagingOptions[0] || 10);
  // hook 4
  const sortState = useRef(initSort || { col: undefined, dir: undefined });
  // hook 5
  const [modalWarning, setModalWarning] = useState('');
  // hook 6
  const buttonsRef = useRef();

  // --------------------------------------------------------------------------
  // On first data load we create:
  // tableData: will be used for further operations (filtering, sorting)
  // so we still have the original data defined by user (e.g. original sorting)
  // pageData: data of actual page, set to first page on row data load
  // set actualPage to first (1)
  // ref to search field
  // hook 7
  const inputFieldRef = useRef(null);
  // hook 8
  const data2 = useRef(
    data.map((r, idx) => ({ ...r, gridactPrimaryKey: idx }))
  ); // copy of props, that can be manipulated.
  const setData2 = (newRef) => {
    if (Object.prototype.toString.call(newRef) === '[object Function]') {
      data2.current = newRef(data2.current.slice());
    } else data2.current = newRef.slice();
  };
  // hook 9
  const [tableData, setTableData] = useState([]); // actual table data - filtered, sorted,...
  const setTableDataAdv = (newData) => {
    checkPageLength(pageActual, newData, pageLength);
    const sortedNewData = sortData(newData, sortState);
    // const unRefData = [...sortedNewData]; (originally .map pattern)
    // for new sorted data instance
    setTableData([...sortedNewData]);
  };
  // hook 10
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
  // hook 11
  const refStore = useRef({});
  const fnUpdateRefStore = (x, y, cellRef) =>
    new Promise((resolve) => {
      refStore.current[`${String(x)}-${String(y)}`] = cellRef;
      resolve('OK');
    });
  const fnGetRefStore = () => refStore.current;
  const fnGetRef = (x, y) => refStore.current[`${String(x)}-${String(y)}`];

  // hook 12
  const [filter, setFilter] = useFilter('', (f) => {
    fnChangeTableFilter(f, data2, tableData, setFilteredData, setTableData);
  });

  // hook 13
  useEffect(() => {
    setFilter('');
    setData2(data.map((r, idx) => ({ ...r, gridactPrimaryKey: idx })));
    setTableDataAdv(data2.current);
  }, [data, setFilter]);

  // hook 14
  useEffect(() => {
    if (tableData.length) {
      checkPageLength(pageActual, tableData, pageLength);
      setPageData(
        tableData.slice(
          (pageActual.current - 1) * pageLength.current,
          pageActual.current * pageLength.current
        )
      );
      if (
        Object.prototype.toString.call(setFilteredData) ===
          '[object Function]' &&
        tableData.length
      ) {
        setFilteredData(tableData);
      }
    } else {
      setPageData([]);
      activeCell.current = [undefined, undefined];
    }
  }, [setFilteredData, tableData]);

  // hook 15
  useEffect(() => {
    if (
      activeCell.current[0] >= 0 &&
      activeCell.current[1] >= 0 &&
      activeCell.current[1] > pageData.length - 1
    ) {
      activeCell.current = [activeCell.current[0], pageData.length - 1];
      refStore.current[
        `${activeCell.current[0]}-${activeCell.current[1]}`
      ].current.focus();
    } else if (activeCell.current[0] >= 0 && activeCell.current[1] >= 0) {
      refStore.current[
        `${activeCell.current[0]}-${activeCell.current[1]}`
      ].current.focus();
    }
  }, [pageData]);
  // hook 16
  useEffect(() => {
    if (
      ['[object String]', '[object Number]'].includes(
        Object.prototype.toString.call(filterValue)
      )
    ) {
      setFilter(filterValue);
    }
  }, [filterValue, setFilter]);

  // --------------------------------------------------------------------------
  // Changing page length, setting new pageData
  const changePageLength = (e) => {
    // change page length
    pageLength.current = parseInt(e.target.value, 0); // set new page length
    checkPageLength(pageActual, tableData, pageLength);
    setPageData(
      tableData.slice(
        (pageActual.current - 1) * pageLength.current,
        pageActual.current * pageLength.current
      )
    );
  };

  const mainTableContainerStyle = () => {
    if (showFilter || addRemove || pagingSelector || pageSelector)
      return { height: '100%' };
    return {
      height: '100%',
      gridTemplateRows: '1fr',
    };
  };

  return (
    <GridContext.Provider
      value={{
        data,
        setData,
        data2,
        setData2,
        tableData,
        setTableData,
        setTableDataAdv,
        pageData,
        setPageData,
        colDefs,
        tableClasses,
        sortState,
        fnRowClass,
        primaryKey,
        activeCell,
        refStore,
        fnUpdateRefStore,
        serverSideEdit,
        removeRow,
        wrapperDivClass,
        onEnterMoveDown,
        tableCellClass,
        pageLength,
        pageActual,
        setFilter,
        fnNavigation: (keyCode) =>
          navigation(
            keyCode,
            activeCell,
            fnGetActiveCell,
            fnSetActiveCell,
            fnGetRef,
            onEnterMoveDown,
            pageData,
            colDefs
          ),
        fnSortTable: (col) =>
          fnSortTable(
            col,
            tableData,
            sortState,
            colDefs,
            pageLength,
            pageActual,
            data2,
            setTableData
          ),
      }}
    >
      <div
        className={mainTableContainerClass || 'defaultGridactContainer'}
        style={mainTableContainerStyle()}
      >
        {(showFilter || addRemove || pagingSelector || pageSelector) && (
          <div className="table-control">
            {showFilter && (
              <div className="display-inline">
                <span className="FFInputDesc">
                  <SearchIcon
                    style={{
                      fill: 'var(--crxblue)',
                      width: '25px',
                      height: '25px',
                    }}
                  />
                </span>
                <input
                  className="FFInputField paging-font"
                  style={{ width: '200px' }}
                  key="myinputfield"
                  type="text"
                  onFocus={(e) => fnSetActiveCell([undefined, undefined])}
                  placeholder={searchPlaceHolder}
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value);
                  }}
                  ref={inputFieldRef}
                />
              </div>
            )}
            <div className="display-inline" ref={buttonsRef}>
              {addRemove && (
                <AddRemoveButtons
                  addRow={() =>
                    addRow({
                      tableData,
                      setTableDataAdv,
                      serverSideEdit,
                      data2,
                      setData2,
                      setModalWarning,
                      activeCell,
                      setFilter,
                      sortState,
                      primaryKey,
                    })
                  }
                  removeRowFn={(e) =>
                    removeRow({
                      e,
                      activeCell,
                      addRemove,
                      pageData,
                      serverSideEdit,
                      data2,
                      setData2,
                      primaryKey,
                      tableData,
                      setTableDataAdv,
                      setPageData,
                      pageActual,
                      pageLength,
                      setModalWarning,
                    })
                  }
                  addRemove={addRemove}
                />
              )}
            </div>
            {(pagingSelector || pageSelector) && (
              <div className="display-inline" style={{ paddingRight: '10px' }}>
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
                    changePage={(dir) =>
                      changePage(
                        dir,
                        pageActual,
                        tableData,
                        pageLength,
                        setPageData
                      )
                    }
                    tableDataLength={tableData.length}
                    pageLength={pageLength.current}
                    pageActual={pageActual.current}
                    key="11"
                  />
                )}
              </div>
            )}
          </div>
        )}
        <DataTable />
      </div>
      {Boolean(modalWarning.length > 0) && (
        <CellModalWarning
          cellRef={buttonsRef}
          show
          x={250}
          y={30}
          setShow={setModalWarning}
        >
          <div title={modalWarning}>{modalWarning.slice(0, 50)}</div>
        </CellModalWarning>
      )}
    </GridContext.Provider>
  );
};

export default React.memo(GridAct);

// ;
