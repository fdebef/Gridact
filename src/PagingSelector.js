import React from 'react';
import MultiPages from '../static/images/icons/paging.svg';

const PagingSelector = (props) => {
  const { pageLength, changePageLength, pagingOptions } = props;
  return (
    <>
      <span key="17" className="FFInputDesc">
        <MultiPages
          style={{
            fill: 'var(--crxblue)',
            height: '25px',
            width: '25px',
            marginTop: '2px',
          }}
        />
      </span>

      <select
        className="FFInputField paging-font"
        style={{ width: 'auto' }}
        value={pageLength}
        onChange={changePageLength}
      >
        {pagingOptions
          .sort((a, b) => a - b)
          .map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
      </select>
    </>
  );
};

export default PagingSelector;
