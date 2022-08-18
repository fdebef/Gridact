import React, { useEffect, useRef } from 'react';
import keyDnEdit from './keyDnEdit';

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

  useEffect(() => {
    inputRef.current.focus();
    return () => {
      console.log('UNMOUNTING EDITING INPUT');
    };
  }, []);
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
        setEditModeStateActive(false);
      }}
      onChange={(e) => setInputEditValue(e.target.value)}
    />
  );
};

export default InputEdit;
