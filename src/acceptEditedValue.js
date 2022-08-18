import serverUpdate from './serverUpdate';
import setEndOfContentEditable from '../tools/setEndOfContentEditable';
import fnUpdateData2 from './fnUpdateData2';
import fnFilterEditedValue from './fnFilterEditedValue';

const acceptEditedValue = ({
  inputEditValue,
  setEditModeStateActive,
  setModalWarningActive,
  setModalWarningText,
  cellValue,
  setCellValue,
  col,
  row,
  cellRef,
  whisper,
  LocalContext,
}) => {
  // inputEditValue - value from user

  // disable editing mode
  setEditModeStateActive(false);

  // storing current value before edit
  const cellPrevValue = cellValue;

  // prepare operation data
  const operData = { operation: 'edit', newValue: {}, row: { ...row } };

  //
  // prepare newValue for further processing
  //
  // click action
  if (LocalContext.colDefs[col].onCl) {
    operData.operation = 'click';
    operData.newValue[col] = cellPrevValue;
  } else if (!whisper) {
    // common text edit (not whispering)
    const sanitizedInnerText = fnFilterEditedValue(
      inputEditValue,
      cellValue,
      row,
      col,
      LocalContext.colDefs
    );
    // if value was changed (curValue before edit is not same as sanitized text
    if (cellValue !== sanitizedInnerText) {
      operData.newValue[col] = sanitizedInnerText;
      setCellValue(sanitizedInnerText);
    } else {
      setEditModeStateActive(false);
      cellRef.current.focus();
      return;
    }
  } else {
    // whispering input
    // whisper value - object, usually more keys
    operData.newValue = inputEditValue;
  }

  // after setting new value, process data on server
  // running serverUpdate function, that returns whole updated row
  // here we solve only editing, not adding/deleting rows
  serverUpdate(operData, LocalContext.colDefs, LocalContext.serverSideEdit)
    .then((updRow) => {
      // updRow is response from server
      // processed and sanitized from errors
      console.log('THIS IS UPDROW: ', updRow);
      fnUpdateData2(
        updRow,
        row,
        LocalContext.data2,
        LocalContext.setData2,
        LocalContext.primaryKey
      );
      // update displayed table data
      LocalContext.setTableDataAdv(LocalContext.data2.current);
      setModalWarningActive(false);
      setModalWarningText('');
      cellRef.current.focus();
      LocalContext.fnNavigation('move_next'); // move cursor
    })
    .catch((err) => {
      console.log('SOME ERROR HAPPENED: ', err);
      setCellValue(cellPrevValue);
      setModalWarningActive(true);
      setModalWarningText(JSON.stringify(err.toString()));
      cellRef.current.focus();
    });
};

export default acceptEditedValue;
