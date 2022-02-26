import React, { useEffect, useRef, useContext } from 'react';
import GridContext from './GridContext/GridContext';
import MyReactRow from './MyReactRow';
import TableHead from './TableHead';

/* eslint-disable react/prop-types */

const DataTable = () => {
  const LocalContext = useContext(GridContext);

  // --------------------------------------------------------------------------
  // activeCell is further used for navigation
  // fnSetActiveCell is further postponed to row and cell
  // so the cell itself can setup activeCell - e.g. onClick={cell.focus()}

  const wrpClass = (wrpProp) => {
    switch (Object.prototype.toString.call(wrpProp)) {
      case '[object Array]':
        return wrpProp.join(' ');
      case '[object String]':
        return wrpProp;
      case '[object Undefined]':
        return 'defaultTableWrapper';
      default:
        return 'defaultTableWrapper';
    }
  };

  const tblClass = (tblClsProp) => {
    switch (Object.prototype.toString.call(tblClsProp)) {
      case '[object Array]':
        return tblClsProp.join(' ');
      case '[object String]':
        return tblClsProp;
      case '[object Undefined]':
        return 'defaultTableStyle';
      default:
        return 'defaultTableStyle';
    }
  };

  if (LocalContext.pageData.length) {
    return (
      <div className={wrpClass(LocalContext.wrapperDivClass)} style={{}}>
        <table
          role="grid"
          className={tblClass(LocalContext.tableClasses)}
          style={{ cursor: 'default', caretColor: 'transparent' }}
        >
          <TableHead />
          <tbody>
            {LocalContext.pageData.map((row, y) => (
              <MyReactRow key={row.gridactPrimaryKey} y={y} row={row} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return (
    <div className={wrpClass(LocalContext.wrapperDivClass)} style={{}}>
      <div
        className="display-inline align-center"
        style={{ marginTop: '20px' }}
      >
        Žádná data k zobrazení.
      </div>
    </div>
  );
};
export default React.memo(DataTable);
