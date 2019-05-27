import React, { useRef, useState } from 'react';
import MyReactCell from './MyReactCell';

/* eslint-disable react/prop-types */

const MyReactRow = (props) => {
  const {
    row, y, colRowsCount, fnUpdateRefStore,
    fnSetActiveCell, colDefs, fnNavigation,
    fnUpdateDataOnEditWithoutRender, rowClass,
    serverSideEdit, primaryKey, removeRow
  } = props;

  const rowData = useRef({ rowData: {}, newRowBuffer: false, bfrChange: undefined });
  const [fupd, rowForceUpdate] = useState(0);

  if (!rowData.current.newRowBuffer) {
    // update rowData with row prop only if there is no buffered data from newRow
    rowData.current.rowData = row;
  }

  rowData.current.newRowBuffer = false; // clear buffer indicator for next render
  const x = new Date();
  rowData.current.bfrChange = `${x.getSeconds()}.${x.getMilliseconds()}`;

  const fnUpdateRowData = (newRowData) => {
    rowData.current.rowData = newRowData;
    // assign buffer value, so in next render it is not overwritten
    rowData.current.newRowBuffer = true;
    const x = new Date();
    rowData.current.bfrChange = `${x.getSeconds()}.${x.getMilliseconds()}`;
    rowForceUpdate(p => p + 1);
  };

  // --------------------------------------------------------------------------
  // Calculate rowClassNames, based on rowClass parameter
  // tightly controlled on data types
  const rowClassNames = (rwDt) => {
    if (!rowClass) return undefined;
    if (typeof rowClass === 'string') return rowClass;
    if (Array.isArray(rowClass)) return rowClass.join(' ');
    if (typeof rowClass === 'function') {
      const calcClass = rowClass(rwDt);
      if (!calcClass) return undefined;
      if (typeof calcClass === 'string') return calcClass;
      if (Array.isArray(calcClass)) return calcClass.join(' ');
    }
    return undefined;
  };

  return (
    <tr className={rowClassNames(rowData.current.rowData)} key={y}>
      {Object.keys(colDefs).filter(cD => !colDefs[cD].hidden).map((col, x) => (
        <MyReactCell
          role="gridcell"
          key={String(x) + String(y)}
          col={col}
          x={x}
          y={y}
          cellValue={rowData.current.rowData[col]}
          colRowsCount={colRowsCount}
          fnUpdateRefStore={fnUpdateRefStore}
          fnSetActiveCell={fnSetActiveCell}
          colDefs={colDefs}
          fnNavigation={fnNavigation}
          row={rowData.current.rowData}
          fnUpdateDataOnEditWithoutRender={fnUpdateDataOnEditWithoutRender}
          fnUpdateRowData={fnUpdateRowData}
          serverSideEdit={serverSideEdit}
          primaryKey={primaryKey}
          removeRow={removeRow}
          rowForceUpdate={rowForceUpdate}
        />
      ))
        }
    </tr>
  );
};
export default MyReactRow;
