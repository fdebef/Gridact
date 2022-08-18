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
    // CTRL+C, +V, +A
    case (e.ctrlKey || e.metaKey) &&
      ['C', 'c', 'V', 'v', 'A', 'a'].includes(e.key):
      break;
    // on edit pressing tab, enter, return means accepting
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
      // on edit arrows means moving cursor
      break;
    case !fnFilterEditChar(e.key, cellValue, row, col, LocalContext.colDefs):
      // if not allowed character, do nothing
      e.preventDefault();
      break;
    default:
      break;
  }
};

export default keyDnEdit;
