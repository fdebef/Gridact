import React from 'react';
import SortNone from '../static/images/icons/sortNoneEmpty.svg';
import SortUp from '../static/images/icons/sortUp.svg';

const SortArrows = (prop) => {
  const { colDefs, col, sortState } = prop;
  if (colDefs[col].sortable) {
    switch (true) {
      case sortState.current.col === col && sortState.current.dir === 'asc':
        return <SortUp width="15px" height="15px" style={{ color: 'black' }} />;
      case sortState.current.col === col && sortState.current.dir === 'desc':
        return (
          <SortUp
            width="15px"
            height="15px"
            style={{ color: 'black', transform: 'rotate(180deg)' }}
          />
        );
      default:
        return (
          <SortNone width="15px" height="15px" style={{ color: 'gray' }} />
        );
    }
  }
  return null;
};

export default SortArrows;
