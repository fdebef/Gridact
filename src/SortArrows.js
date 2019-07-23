import ChevronUpIcon from 'mdi-react/ChevronUpIcon';
import ChevronDownIcon from 'mdi-react/ChevronDownIcon';
import UnfoldMoreHorizontalIcon from 'mdi-react/UnfoldMoreHorizontalIcon';
import React from 'react';

const SortArrows = (prop) => {
  const { colDefs, col, sortState } = prop;
  if (colDefs[col].sortable) {
    switch (true) {
      case (sortState.col === col && sortState.dir === 'asc'):
        return (<span style={{ width: '15px' }}><ChevronUpIcon size="1em" /></span>);
      case (sortState.col === col && sortState.dir === 'desc'):
        return (<span style={{ width: '15px' }}><ChevronDownIcon size="1em" /></span>);
      default:
        return (<span style={{ width: '15px' }}><UnfoldMoreHorizontalIcon size="0.8em" /></span>);
    }
  }
  return null;
};

export default SortArrows;
