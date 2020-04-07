import React from 'react';
import MyReactRow from './MyReactRow';
import TableHead from './TableHead';

/* eslint-disable react/prop-types */

const DataTable = (props) => {
  const {
    pageData,
    colDefs,
    tableClasses,
    sortTable,
    sortState,
    fnGetActiveCell,
    fnSetActiveCell,
    fnUpdateDataOnEditWithoutRender,
    fnRowClass,
    serverSideEdit,
    primaryKey,
    fnUpdateRefStore,
    fnGetRefStore,
    removeRow,
    wrapperDivClass,
    onEnterMoveDown,
    tableCellClass,
    setPageData
  } = props;

  // --------------------------------------------------------------------------
  // activeCell is further used for navigation
  // fnSetActiveCell is further postponed to row and cell
  // so the cell itself can setup activeCell - e.g. onClick={cell.focus()}

  // --------------------------------------------------------------------------
  // number of cols and rows for navigation (not to go outside table
  let colRowsCount;
  if (pageData.length) {
    colRowsCount = [
      Object.keys(colDefs).filter(k => !k.hidden).length,
      pageData.length
    ];
  }

  // --------------------------------------------------------------------------
  // fnNavigation calculates new coordinates
  // and sets focus to calculated cell - based on ref in store
  const fnNavigation = (keyCode) => {
    let [calcX, calcY] = fnGetActiveCell();
    const [xCount, yCount] = colRowsCount; // number of columns and rows
    if (keyCode === 'move_next') {
      onEnterMoveDown ? (keyCode = 'ArrowDown') : (keyCode = 'ArrowRight');
    }
    switch (keyCode) {
      case 'ArrowUp': // up
        calcY = calcY - 1 > 0 ? calcY - 1 : 0;
        break;
      case 'ArrowDown': // down
        calcY = calcY + 1 < yCount - 1 ? calcY + 1 : yCount - 1;
        break;
      case 'ArrowLeft': // left
        calcX = calcX - 1 > 0 ? calcX - 1 : 0;
        break;
      case 'ArrowRight': // right
        calcX = calcX + 1 < xCount - 1 ? calcX + 1 : xCount - 1;
        break;
      case 'Tab': // right (TAB)
        calcX = calcX + 1 < xCount - 1 ? calcX + 1 : xCount - 1;
        break;
      case 'PageUp': // pgUp
        calcY = 0;
        break;
      case 'PageDown': // pgDn
        calcY = yCount - 1;
        break;
      case 'Home': // Home
        calcX = 0;
        break;
      case 'End': // End
        calcX = xCount - 1;
        break;
      default:
        break;
    }
    fnSetActiveCell([calcX, calcY]);
    fnGetRefStore()[`${String(calcX)}-${String(calcY)}`].current.focus();
  };

  const wrpClass = (wrpProp) => {
    switch (Object.prototype.toString.call(wrpProp)) {
      case '[object Array]':
        return wrpProp.join(' ');
      case '[object String]':
        return wrpProp;
      case '[object Undefined]':
        return undefined;
      default:
        return undefined;
    }
  };

  const tblClass = (tblClsProp) => {
    switch (Object.prototype.toString.call(tblClsProp)) {
      case '[object Array]':
        return tblClsProp.join(' ');
      case '[object String]':
        return tblClsProp;
      case '[object Undefined]':
        return undefined;
      default:
        return undefined;
    }
  };

  const widthStyle = (width) => {
    if (width) {
      return { width };
    }
  };

  if (pageData.length) {
    return (
      <div className={wrpClass(wrapperDivClass)} style={{ display: 'inline-block', height: '100%',overflow: 'auto' }}>
        <table
          role="grid"
          className={tblClass(tableClasses)}
          style={{ cursor: 'default' }}
        >
          <TableHead
            colDefs={colDefs}
            widthStyle={widthStyle}
            sortTable={sortTable}
            sortState={sortState}
          />
          <tbody>
            {pageData.map((row, y) => (
              <MyReactRow
                key={y}
                row={row}
                y={y}
                fnUpdateRefStore={fnUpdateRefStore}
                fnSetActiveCell={fnSetActiveCell}
                colDefs={colDefs}
                fnNavigation={fnNavigation}
                setPageData={setPageData}
                fnRowClass={fnRowClass}
                serverSideEdit={serverSideEdit}
                primaryKey={primaryKey}
                removeRow={removeRow}
                tableCellClass={tableCellClass}
                fnUpdateDataOnEditWithoutRender={
                  fnUpdateDataOnEditWithoutRender
                }
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return <div className="display-inline align-center" style={{ marginTop: '20px' }}>Žádná data k zobrazení.</div>;
};
export default React.memo(DataTable);
