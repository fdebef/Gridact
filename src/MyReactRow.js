import React, { useState, useEffect } from 'react';
import MyReactCell from './MyReactCell';

/* eslint-disable react/prop-types */

const MyReactRow = (props) => {
  const {
    row, y, fnUpdateRefStore,
    fnSetActiveCell, colDefs, fnNavigation,
    fnUpdateDataOnEditWithoutRender, fnRowClass,
    serverSideEdit, primaryKey, removeRow, tableCellClass
  } = props;

  const [rowData, setRowData] = useState({});
  // const [fupd, rowForceUpdate] = useState(0);

  useEffect(() => {
    setRowData(row);
  }, [row]);

  // if (!rowData.current.newRowBuffer) {
  //   // update rowData with row prop only if there is no buffered data from newRow
  //   rowData.current.rowData = row;
  // }

  // rowData.current.newRowBuffer = false; // clear buffer indicator for next render


  // const fnUpdateRowData = (newRowData) => {
  //   rowData.current.rowData = newRowData;
  //   // assign buffer value, so in next render it is not overwritten
  //   rowData.current.newRowBuffer = true;
  //   const x = new Date();
  //   rowData.current.bfrChange = `${x.getSeconds()}.${x.getMilliseconds()}`;
  //   console.log('ROWDATA: ', console.log(rowData.current))
  //   rowForceUpdate(p => p + 1);
  // };

  // --------------------------------------------------------------------------
  // Calculate rowClassNames, based on rowClass parameter
  // tightly controlled on data types
  const rowClassNames = (rwDt) => {
    if (!fnRowClass) return undefined;
    if (typeof fnRowClass === 'string') return fnRowClass;
    if (Array.isArray(fnRowClass)) return fnRowClass.join(' ');
    if (typeof fnRowClass === 'function') {
      const calcClass = fnRowClass(rwDt);
      if (!calcClass) return undefined;
      if (typeof calcClass === 'string') return calcClass;
      if (Array.isArray(calcClass)) return calcClass.join(' ');
    }
    return undefined;
  };

  return (
    <tr className={rowClassNames(rowData)} key={y}>
      {Object.keys(colDefs).filter(cD => !colDefs[cD].hidden).map((col, x) => (
        <MyReactCell
          role="gridcell"
          key={String(x) + String(y)}
          col={col}
          x={x}
          y={y}
          cellValue={rowData[col]}
          fnUpdateRefStore={fnUpdateRefStore}
          fnSetActiveCell={fnSetActiveCell}
          colDefs={colDefs}
          fnNavigation={fnNavigation}
          row={rowData}
          fnUpdateDataOnEditWithoutRender={fnUpdateDataOnEditWithoutRender}
          setRowData={setRowData}
          serverSideEdit={serverSideEdit}
          primaryKey={primaryKey}
          removeRow={removeRow}
          tableCellClass={tableCellClass}
        />
      ))
        }
    </tr>
  );
};
export default React.memo(MyReactRow);
