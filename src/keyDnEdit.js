import acceptEditedValue from './acceptEditedValue';
import fnFilterEditChar from './fnFiltedEditedChar';

const keyDnEdit = ({
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
  LocalContext,
}) => {
  switch (true) {
    case ['Tab', 'Enter', 'Return'].includes(e.key): // ENTER + TAB - leave with save
      e.preventDefault();
      acceptEditedValue({
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
        LocalContext,
      });
      break;
    case e.key === 'Escape': // ESC - leaving without update database
      e.preventDefault();
      setEditModeStateActive(false);
      setTimeout(() => {
        cellRef.current.focus();
      }, 100);
      break;
    case [
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Delete',
      'Backspace',
    ].includes(e.key):
      break;
    case !fnFilterEditChar(e.key, cellValue, row, col, LocalContext.colDefs):
      e.preventDefault();
      break;
    default:
      break;
  }
};

export default keyDnEdit;
