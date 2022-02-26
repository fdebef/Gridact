import React, { useContext } from 'react';
import MyReactCell from './MyReactCell';
import GridContext from './GridContext/GridContext';

/* eslint-disable react/prop-types */

const MyReactRow = (props) => {
  const { row, y } = props;

  const LocalContext = useContext(GridContext);

  // --------------------------------------------------------------------------
  // Calculate rowClassNames, based on rowClass parameter
  // tightly controlled on data types

  const rowClassNames = (rwDt) => {
    switch (Object.prototype.toString.call(LocalContext.fnRowClass)) {
      case '[object Function]':
        return LocalContext.fnRowClass(rwDt);
      case '[object String]':
        return LocalContext.fnRowClass;
      case '[object Array]':
        return LocalContext.fnRowClass.join(' ');
      case '[object Undefined]':
        return undefined;
      default:
        return undefined;
    }
  };

  return (
    <tr className={rowClassNames(row)} key={y} tabIndex={0}>
      {Object.keys(LocalContext.colDefs)
        .filter(
          (cD) =>
            !LocalContext.colDefs[cD].hidden &&
            LocalContext.colDefs[cD].tableHead
        )
        .map((col, x) => (
          <MyReactCell
            role="gridcell"
            key={String(x) + String(y)}
            col={col}
            x={x}
            y={y}
            cellData={(() => {
              try {
                if (Object.keys(row).includes(col)) return row[col];
                return null;
              } catch (e) {
                console.log('ERROR: ', e);
                console.log('....', row, col);
              }
            })()}
            row={row}
          />
        ))}
    </tr>
  );
};

export default React.memo(MyReactRow);

/* export default React.memo(MyReactRow, (prev, act) => {
  if (
    propsAreEqual(prev.row, act.row) &&
    propsAreEqual(prev.colDefs, act.colDefs)
  ) {
    return true;
  }
  return propsAreEqual(prev, act);
}); */
