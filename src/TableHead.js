import React, { useContext } from 'react';
import SortArrows from './SortArrows';
import fnColDefs from './fnColDefs';
import GridContext from './GridContext/GridContext';

const TableHead = () => {

  const LocalContext = useContext(GridContext);

  const { colDefs } = LocalContext;

  return (
    <thead>
      <tr>
        {Object.keys(colDefs)
          .filter((cD) => !colDefs[cD].hidden)
          .map((col) => (
            <th
              className={[fnColDefs(colDefs[col].thClass, col)].join(' ')}
              key={col}
              title={colDefs[col].tableHeadTitle}
              role="gridcell"
              style={{ width: colDefs[col].width, cursor: 'pointer' }}
              onClick={() => {
                LocalContext.fnSortTable(col);
              }}
            >
              {colDefs[col].sortable && (
                <span className="table-head-cell-sort">
                  <span className="table-head-text">
                    {colDefs[col].tableHead}
                  </span>
                  <span className="sort-arrows">
                    <SortArrows
                      colDefs={colDefs}
                      col={col}
                      sortState={LocalContext.sortState}
                    />
                  </span>
                </span>
              )}
              {!colDefs[col].sortable && (
                <span className="table-head-cell-no-sort">
                  <span className="table-head-text">
                    {colDefs[col].tableHead}
                  </span>
                </span>
              )}
            </th>
          ))}
      </tr>
    </thead>
  );
};

export default TableHead;
