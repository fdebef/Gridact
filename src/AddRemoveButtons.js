import React from 'react';
import AddRow from '../../static/images/icons/addRow.svg';
import DeleteRow from '../../static/images/icons/deleteRow.svg';

const AddRemoveButtons = (props) => {
  const { addRow, removeRowFn } = props;
  return (
    <div key="19" className="display-inline align-center">
      <button
        key="20"
        type="button"
        title="Přidat nový řádek..."
        onClick={addRow}
        className="addBtn"
      >
        <AddRow
          className="hand"
          style={{
            fill: 'white',
            height: '22px',
            width: '22px',
            marginTop: '6px',
          }}
        />
      </button>
      <button
        key="21"
        type="button"
        title="Vymazat řádek, na kterém stojí kurzor"
        onClick={removeRowFn}
        className="removeBtn"
        onMouseDown={(e) => e.preventDefault()}
      >
        <DeleteRow
          className="hand"
          style={{
            fill: 'white',
            height: '22px',
            width: '22px',
            marginTop: '6px',
          }}
        />
      </button>
    </div>
  );
};

export default AddRemoveButtons;
