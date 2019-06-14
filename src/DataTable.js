import React from 'react';
import UnfoldMoreHorizontalIcon from 'mdi-react/UnfoldMoreHorizontalIcon';
import ChevronUpIcon from 'mdi-react/ChevronUpIcon';
import ChevronDownIcon from 'mdi-react/ChevronDownIcon';
import MyReactRow from './MyReactRow';
import TableHead from './TableHead';

/* eslint-disable react/prop-types */

const DataTable = (props) => {
  const {
    data, colDefs, tableClasses, sortTable, sortState, fnGetActiveCell, fnSetActiveCell,
    fnUpdateDataOnEditWithoutRender, fnRowClass, serverSideEdit, primaryKey,
    fnUpdateRefStore, fnGetRefStore, removeRow, wrapperDivClass, onEnterMoveDown,
    tableCellClass
  } = props;

  // --------------------------------------------------------------------------
  // activeCell is further used for navigation
  // fnSetActiveCell is further postponed to row and cell
  // so the cell itself can setup activeCell - e.g. onClick={cell.focus()}

  // --------------------------------------------------------------------------
  // number of cols and rows for navigation (not to go outside table
  let colRowsCount;
  if (data.length) {
    colRowsCount = [Object.keys(colDefs).filter(k => !k.hidden).length, data.length];
  }

  // --------------------------------------------------------------------------
  // fnNavigation calculates new coordinates
  // and sets focus to calculated cell - based on ref in store
  const fnNavigation = (keyCode) => {
    let [calcX, calcY] = fnGetActiveCell();
    const [xCount, yCount] = colRowsCount; // number of columns and rows
    if (keyCode === 913) {
      (onEnterMoveDown) ? keyCode = 40 : keyCode = 39;
    }
    switch (keyCode) {
      case 38: // up
        calcY = calcY - 1 > 0 ? calcY - 1 : 0;
        break;
      case 40: // down
        calcY = calcY + 1 < yCount - 1 ? calcY + 1 : yCount - 1;
        break;
      case 37: // left
        calcX = calcX - 1 > 0 ? calcX - 1 : 0;
        break;
      case 39: // right
        calcX = calcX + 1 < xCount - 1 ? calcX + 1 : xCount - 1;
        break;
      case 9: // right (TAB)
        calcX = calcX + 1 < xCount - 1 ? calcX + 1 : xCount - 1;
        break;
      case 33: // pgUp
        calcY = 0;
        break;
      case 34: // pgDn
        calcY = yCount - 1;
        break;
      case 36: // Home
        calcX = 0;
        break;
      case 35: // End
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
      return ({ width });
    }
  };


  if (data.length) {
    return (
      <div className={wrpClass(wrapperDivClass)}>
        <table
          role="grid"
          className={tblClass(tableClasses)}
        >

          <TableHead
            colDefs={colDefs}
            widthStyle={widthStyle}
            tableCellClass={tableCellClass}
            sortTable={sortTable}
            sortState={sortState}
          />
          <tbody>
            {data.map((row, y) => (
              <MyReactRow
                key={y}
                row={row}
                y={y}
                colRowsCount={[Object.keys(data[0]).length, data.length]}
                fnUpdateRefStore={fnUpdateRefStore}
                fnSetActiveCell={fnSetActiveCell}
                colDefs={colDefs}
                fnNavigation={fnNavigation}
                fnUpdateDataOnEditWithoutRender={fnUpdateDataOnEditWithoutRender}
                fnRowClass={fnRowClass}
                serverSideEdit={serverSideEdit}
                primaryKey={primaryKey}
                removeRow={removeRow}
                tableCellClass={tableCellClass}
              />
            ))
              }
          </tbody>
        </table>
      </div>
    );
  }
  return (<div className="d-flex flex-column justify-content-center align-items-center">No data received</div>);
};
export default React.memo(DataTable);
