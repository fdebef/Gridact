import acceptEditedValue from './acceptEditedValue';
import fnFilterEditChar from './fnFiltedEditedChar';

const keyDn = ({
  e,
  setEditModeStateActive,
  editModeStateActive,
  setModalWarningActive,
  setModalWarningText,
  cellValue,
  col,
  row,
  y,
  cellRef,
  setInputEditValue,
  editable,
  LocalContext,
}) => {
  if (['Enter', 'Return'].includes(e.key) && !editModeStateActive) {
    e.preventDefault();
    // acceptEditedValue will recognize this row has onclick event and fires it
    if (LocalContext.colDefs[col].onCl)
      acceptEditedValue({
        editedValue: null,
        setEditModeStateActive,
        setModalWarningActive,
        setModalWarningText,
        cellValue,
        col,
        row,
        y,
        cellRef,
        setInputEditValue,
        editable,
        LocalContext,
      });
  }
  if (editModeStateActive) return;
  switch (true) {
    case ['F2', 'Enter', 'Return'].includes(e.key): // enter, F2
      if (editable(cellValue, row)) {
        e.preventDefault();
        setInputEditValue(cellValue || '');
        setEditModeStateActive(true);
      }
      break;
    // DIRECT EDIT - WITHOUT F2
    case Boolean(
      e.key.match(/[\d\D]/)[0] === e.key.match(/[\d\D]/).input &&
        fnFilterEditChar(e.key, cellValue, row, col, LocalContext.colDefs)
    ):
      if (editable(cellValue, row)) {
        e.preventDefault();
        setInputEditValue(e.key);
        setEditModeStateActive(true);
      }
      break;
    case ['Delete', 'Backspace'].includes(e.key) && !e.shiftKey:
      if (LocalContext.colDefs[col].editable(cellValue, row)) {
        e.preventDefault();
        setInputEditValue('');
        setEditModeStateActive(true);
      }
      break;
    case ['Escape'].includes(e.key):
      e.preventDefault();
      setEditModeStateActive(false);
      setModalWarningActive(false);
      setModalWarningText('');
      break;
    case [
      'ArrowRight',
      'ArrowLeft',
      'ArrowUp',
      'ArrowDown',
      'PageUp',
      'PageDown',
      'Home',
      'End',
      'Tab',
    ].includes(e.key): // arrow navigation
      e.preventDefault();
      LocalContext.fnNavigation(e.key); // navigation from reactGrid
      break;
    case e.key === 'Delete' && e.shiftKey: // delete
      removeRow();
      break;
    default:
  }
};

export default keyDn;
