import React from 'react';
import PlayEndLeft from '../../static/images/icons/playEndLeft.svg';
import PlayLeft from '../../static/images/icons/playLeft.svg';
import PlayRight from '../../static/images/icons/playRight.svg';
import PlayEndRight from '../../static/images/icons/playEndRight.svg';

const PageSelector = (props) => {
  const { changePage, tableDataLength, pageLength, pageActual } = props;
  return (
    <div key="18" className="display-inline align-right">
      <button
        key="1"
        type="button"
        className="forward paging-font"
        onClick={() => changePage('first')}
      >
        <span style={{ marginRight: '5px' }}>{1}</span>
        <PlayEndLeft
          className="hand"
          style={{ fill: 'dodgerblue', height: '20px', width: '20px' }}
        />
      </button>
      <button
        key="3"
        type="button"
        className="forward paging-font"
        onClick={() => changePage('-1')}
      >
        <PlayLeft
          className="hand"
          style={{ fill: 'dodgerblue', height: '20px', width: '20px' }}
        />
      </button>
      <span key="5" className="paging-font">
        {pageActual}
      </span>
      <button
        key="6"
        type="button"
        className="forward paging-font"
        onClick={() => changePage('+1')}
      >
        <PlayRight
          className="hand"
          style={{ fill: 'dodgerblue', height: '20px', width: '20px' }}
        />
      </button>
      <button
        key="8"
        type="button"
        className="forward paging-font"
        onClick={() => changePage('last')}
      >
        <PlayEndRight
          className="hand"
          style={{ fill: 'dodgerblue', height: '20px', width: '20px' }}
        />
        <span style={{ marginLeft: '5px' }}>
          {Math.ceil(tableDataLength / pageLength)}
        </span>
      </button>
      <span className="paging-font">{` (${tableDataLength})`}</span>
    </div>
  );
};

export default PageSelector;
