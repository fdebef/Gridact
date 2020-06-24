import React from 'react';
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
    setPageData,
  } = props;

  // --------------------------------------------------------------------------
  // Calculate rowClassNames, based on rowClass parameter
  // tightly controlled on data types

  const rowClassNames = (rwDt) => {
    switch (Object.prototype.toString.call(fnRowClass)) {
      case '[object Function]':
        return fnRowClass(rwDt);
      case '[object String]':
        return fnRowClass;
      case '[object Array]':
        return fnRowClass.join(' ');
      case '[object Undefined]':
        return null;
      default:
        return null;
    }
  };

  return (
    <tr className={rowClassNames(row)} key={y} tabIndex={0}>
      {Object.keys(colDefs)
        .filter((cD) => !colDefs[cD].hidden && colDefs[cD].tableHead)
        .map((col, x) => (
          <MyReactCell
            role="gridcell"
            key={String(x) + String(y)}
            col={col}
            x={x}
            y={y}
            cellValue={(() => {
              if (Object.keys(row).includes(col)) return row[col];
              return null;
            })()}
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

export default React.memo(MyReactRow);
