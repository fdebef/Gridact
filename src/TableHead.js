import React from 'react';
import SortArrows from './SortArrows';
import fnColDefs from './fnColDefs';

const TableHead = (props) => {
  const { colDefs, widthStyle, sortTable, sortState } = props;

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
              style={{ ...widthStyle(colDefs[col].width), cursor: 'pointer' }}
              onClick={() => {
                sortTable(col);
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
                      sortState={sortState}
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
