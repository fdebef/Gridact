import React, { useEffect, useRef } from 'react';
import keyDnEdit from './keyDnEdit';
import acceptEditedValue from './acceptEditedValue';

const InputEdit = ({
  inputEditValue,
  setInputEditValue,
  setEditModeStateActive,
  setModalWarningActive,
  setModalWarningText,
  cellValue,
  setCellValue,
  col,
  row,
  y,
  cellRef,
  editable,
  LocalContext,
}) => {
  const inputRef = useRef(null);

  useEffect(() => inputRef.current.focus(), []);
  return (
    <input
      type="text"
      style={{
        position: 'relative',
        outline: 'none',
        caretColor: 'auto',
        fontSize: '1em',
        paddingLeft: 0,
        border: 0,
        width: '100%',
        background: 'rgba(0,0,0,0)',
      }}
      ref={inputRef}
      value={inputEditValue}
      onKeyDown={(e) => {
        keyDnEdit({
          e,
          inputEditValue,
          setEditModeStateActive,
          setModalWarningActive,
          setModalWarningText,
          cellValue,
          setCellValue,
          col,
          row,
          y,
          cellRef,
          editable,
          LocalContext,
        });
      }}
      onBlur={() => {
        acceptEditedValue({
          inputEditValue,
          setEditModeStateActive,
          setModalWarningActive,
          setModalWarningText,
          cellValue,
          setCellValue,
          col,
          row,
          cellRef,
          LocalContext,
        });
      }}
      onChange={(e) => setInputEditValue(e.target.value)}
    />
  );
};

export default InputEdit;
