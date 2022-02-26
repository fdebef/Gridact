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
  console.log('SETTING EDIT MODE STATE FALSE');
  setEditModeStateActive(false);
  const cellPrevValue = cellValue;
  const operData = { operation: 'edit', newValue: {}, row: { ...row } };
  if (LocalContext.colDefs[col].onCl) {
    operData.operation = 'click';
    operData.newValue[col] = cellPrevValue;
  } else if (!whisper) {
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
    // whisper value - object, usually more keys
    operData.newValue = inputEditValue;
  }

  serverUpdate(operData, LocalContext.colDefs, LocalContext.serverSideEdit)
    .then((updRow) => {
      fnUpdateData2(
        updRow,
        row,
        LocalContext.data2,
        LocalContext.setData2,
        LocalContext.primaryKey
      );
      LocalContext.setTableDataAdv(LocalContext.data2.current);
      setModalWarningActive(false);
      setModalWarningText('');
      LocalContext.fnNavigation(913); // move cursor
    })
    .catch((err) => {
      setCellValue(cellPrevValue);
      setModalWarningActive(true);
      setModalWarningText(JSON.stringify(err));
      cellRef.current.focus();
    });
};

export default acceptEditedValue;
