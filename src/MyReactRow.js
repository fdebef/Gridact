import React, { useState, useEffect } from 'react';
import MyReactCell from './MyReactCell';
import propsAreEqual from './propsAreEqual';

/* eslint-disable react/prop-types */

const MyReactRow = (props) => {
  const {
    row,
    y,
    fnUpdateRefStore,
    fnSetActiveCell,
    colDefs,
    fnNavigation,
    fnUpdateDataOnEditWithoutRender,
    fnRowClass,
    serverSideEdit,
    primaryKey,
    removeRow,
    tableCellClass,
    setPageData
  } = props;

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
    <tr className={rowClassNames(row)} key={y}>
      {Object.keys(colDefs)
        .filter(cD => !colDefs[cD].hidden && colDefs[cD].tableHead)
        .map((col, x) => (
          <MyReactCell
            role="gridcell"
            key={String(x) + String(y)}
            col={col}
            x={x}
            y={y}
            cellValue={row[col]}
            fnUpdateRefStore={fnUpdateRefStore}
            fnSetActiveCell={fnSetActiveCell}
            colDefs={colDefs}
            fnNavigation={fnNavigation}
            row={row}
            fnUpdateDataOnEditWithoutRender={fnUpdateDataOnEditWithoutRender}
            setPageData={setPageData}
            serverSideEdit={serverSideEdit}
            primaryKey={primaryKey}
            removeRow={removeRow}
            tableCellClass={tableCellClass}
          />
        ))}
    </tr>
  );
};

export default React.memo(MyReactRow, propsAreEqual);
