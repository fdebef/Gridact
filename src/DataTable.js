import React from 'react';
import UnfoldMoreHorizontalIcon from 'mdi-react/UnfoldMoreHorizontalIcon';
import ChevronUpIcon from 'mdi-react/ChevronUpIcon';
import ChevronDownIcon from 'mdi-react/ChevronDownIcon';
import MyReactRow from './MyReactRow';

/* eslint-disable react/prop-types */

const DataTable = (props) => {
  const {
    data, colDefs, tableClasses, sortTable, sortState, fnGetActiveCell, fnSetActiveCell,
    fnUpdateDataOnEditWithoutRender, rowClass, serverSideEdit, primaryKey,
    fnUpdateRefStore, fnGetRefStore, removeRow, superDivClass, onEnterMoveDown
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
        console.log('NOTHING');
        break;
    }
    fnSetActiveCell([calcX, calcY]);
    fnGetRefStore()[`${String(calcX)}-${String(calcY)}`].current.focus();
  };

  const SortArrows = (props) => {
    const { col } = props;
    if (colDefs[col].sortable) {
      switch (true) {
        case (sortState.col === col && sortState.dir === 'asc'):
          return (<span className="ml-auto"><ChevronUpIcon size="1em" /></span>);
        case (sortState.col === col && sortState.dir === 'desc'):
          return (<span className="ml-auto"><ChevronDownIcon size="1em" /></span>);
        default:
          return (<span className="ml-auto"><UnfoldMoreHorizontalIcon size="0.8em" /></span>);
      }
    }
    return null;
  };


  if (data.length) {
    return (
      <div className={superDivClass.join(' ')}>
        <table
          role="grid"
          className={[...tableClasses].join(' ')}
        >
          <thead>
            <tr>
              {Object.keys(colDefs).filter(cD => !colDefs[cD].hidden).map(col => (
                <td
                  className={colDefs[col].thClass}
                  key={col}
                  role="gridcell"
                  style={{ cursor: 'pointer' }}
                  onClick={() => { sortTable(col); }}
                >
                  <span className="d-flex flex-row justify-content-start align-items-center">
                    {colDefs[col].name}
                    <SortArrows col={col} />
                  </span>
                </td>
              ))}
            </tr>
          </thead>
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
                rowClass={rowClass}
                serverSideEdit={serverSideEdit}
                primaryKey={primaryKey}
                removeRow={removeRow}
              />
            ))
            }
          </tbody>
        </table>
      </div>
    );
  }
  return (<div>No data received</div>);
};

export default React.memo(DataTable);
