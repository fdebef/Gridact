import React, { useEffect, useRef, useState } from 'react';
import cellClassNames from './cellClassNames';
import CellModalWarning from './CellModalWarning';
import serverUpdate from './serverUpdate';
import setEndOfContentEditable from './tools/setEndOfContentEditable';
import WhispererInput from './tools/WhispererInput';

/* eslint-disable react/prop-types */
const MyReactCell = (props) => {
  const {
    y,
    x,
    col,
    cellValue,
    fnUpdateRefStore,
    fnSetActiveCell,
    colDefs,
    fnNavigation,
    row,
    fnUpdateDataOnEditWithoutRender,
    serverSideEdit,
    primaryKey,
    removeRow,
    tableCellClass,
    setPageData
  } = props;

  // TODO: Try to put this into useRef

  const fnFilterEditedValue = (newValue, curCellValue, curRow) => {
    switch (Object.prototype.toString.call(colDefs[col].filterEditValue)) {
      case '[object Function]':
        return colDefs[col].filterEditValue(newValue, curCellValue, curRow);
      case '[object RegExp]':
        return newValue.replace(colDefs[col].filterEditValue, '');
      case '[object Undefined]':
        return newValue.replace(/[{]|[}]|[<]|[>]|[\\]|[/]/g, '');
      default:
        throw Error(
          `Not valid filterEditValue. Must be Function, RegExp or Undefined. Is ${Object.prototype.toString.call(
            colDefs[col].filterEditValue
          )}`
        );
    }
  };

  const updatePageDataWithRow = (newRow, y) => {
    setPageData(prev => [...prev.slice(0, y), newRow, ...prev.slice(y + 1)]);
  };

  const updatePageDataWithCell = (newCell, col, y) => {
    setPageData(prev => [
      ...prev.slice(0, y),
      { ...prev[y], [col]: newCell },
      ...prev.slice(y + 1)
    ]);
  };

  const fnFilterEditChar = (char, curCellValue, curRow) => {
    switch (Object.prototype.toString.call(colDefs[col].filterEditChar)) {
      case '[object Function]':
        return colDefs[col].filterEditChar(char, curCellValue, curRow);
      case '[object RegExp]':
        return char.match(colDefs[col].filterEditChar);
      case '[object Undefined]':
        return char.match(
          /[ěščřžýáíéóúůďťňĎŇŤŠČŘŽÝÁÍÉÚŮa-zA-z0-9 .,-]/
        );
      default:
        throw Error(
          `Not valid filterEditValue. Must be Function, RegExp or Undefined. Is ${Object.prototype.toString.call(
            colDefs[col].filterEditChar
          )}`
        );
    }
  };

  const whisperActive = useRef(false);
  const setWhisperActive = (st) => {
    whisperActive.current = st;
  };


  const [editModeStateActive, setEditModeStateActive] = useState(false);
  const [cellValueEdit, setCellValueEdit] = useState('');
  const [modalWarningActive, setModalWarningActive] = useState(false);
  const [modalWarningText, setModalWarningText] = useState('');

  // define ref to cell and store it to the store
  const cellRef = useRef(null);
  const divEditRef = useRef(null);
  fnUpdateRefStore(x, y, cellRef);

  // cell renderer based on colDefs
  const cellRenderer = (celVal, rw) => {
    switch (Object.prototype.toString.call(colDefs[col].cellRender)) {
      case '[object Function]':
        return colDefs[col].cellRender(celVal, rw);
      case '[object String]':
        return colDefs[col].cellRender;
      case '[object Undefined]':
        return celVal;
      default:
        return celVal;
    }
  };

  const editable = (v, r) => {
    switch (Object.prototype.toString.call(colDefs[col].editable)) {
      case '[object Function]':
        return colDefs[col].editable(v, r);
      default:
        return Boolean(colDefs[col].editable);
    }
  };


  useEffect(() => {
    if (editModeStateActive) setEndOfContentEditable(divEditRef.current);
  }, [editModeStateActive]);


  const acceptEditedValue = (editedValue) => {
    console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%% ACCEPT EDITED VALUE');
    setEditModeStateActive(false);
    const cellPrevValue = cellValue;
    const operData = {};
    const dataToSend = {};
    dataToSend.operation = 'edit';
    operData[primaryKey] = row[primaryKey]; // data for server must be in {line_id: 12932, some_col: 'new value'}
    if (colDefs[col].onCl) {
      dataToSend.operation = 'click';
      operData[col] = cellValue;
    } else {
      const sanitizedInnerText = fnFilterEditedValue(
        editedValue,
        cellValue,
        row
      );
      // if value was changed (curValue before edit is not same as sanitized text
      if (cellValue !== sanitizedInnerText) {
        updatePageDataWithCell(sanitizedInnerText, col, y);
        operData[col] = sanitizedInnerText;
      } else {
        setEditModeStateActive(false);
        cellRef.current.focus();
        return;
      }
    }
    dataToSend.data = operData;
    serverUpdate(dataToSend, colDefs, serverSideEdit)
      .then((updRow) => {
        console.log('-.----------------------', updRow);
        updatePageDataWithRow(updRow, y);
        fnUpdateDataOnEditWithoutRender(updRow);
        setModalWarningActive(false);
        setModalWarningText('');
        fnNavigation(913); // move cursor
      })
      .catch((err) => {
        console.log('ERROR IN SERVER UPDATE: ', err);
        updatePageDataWithCell(cellPrevValue, col, y);
        setModalWarningActive(true);
        setModalWarningText(JSON.stringify(err));
        cellRef.current.focus();
        setEndOfContentEditable(cellRef.current);
      });
  };


  const onBlrCell = () => {
    console.log('THIS IS ON BLURr CELL');
    if (modalWarningActive) {
      setModalWarningActive(false);
      setModalWarningText('');
    }
  };

  const onFoc = () => {
    fnSetActiveCell([x, y]);
  };

  const keyDn = (e) => {
    console.log('THIS IS e.key', e.key, 'FILTER EDIT CHAR: ', fnFilterEditChar(e.key, cellValue, row))
    if (['Enter', 'Return'].includes(e.key) && !editModeStateActive) {
      e.preventDefault();
      // acceptEditedValue will recognize this row has onclick event and fires it
      if (colDefs[col].onCl) acceptEditedValue();
    }
    if (editModeStateActive) return;
    switch (true) {
      case ['F2', 'Enter', 'Return'].includes(e.key): // enter, F2
        if (editable(cellValue, row)) {
          e.preventDefault();
          setCellValueEdit(cellValue);
          setEditModeStateActive(true);
        }
        break;
      case (e.key.match(/[\d\D]/)[0] === e.key.match(/[\d\D]/).input && fnFilterEditChar(e.key, cellValue, row)):
        if (editable(cellValue, row)) {
          e.preventDefault();
          setCellValueEdit(e.key);
          setEditModeStateActive(true);
        }
        break;
      case ['Delete', 'Backspace'].includes(e.key) && !e.shiftKey:
        if (editable(cellValue, row)) {
          e.preventDefault();
          setCellValueEdit('');
          setEditModeStateActive(true);
        }
        break;
      case ['Escape'].includes(e.key):
        e.preventDefault();
        setEditModeStateActive(false);
        setModalWarningActive(false);
        setModalWarningText('');
        break;
      case ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', 'Tab'].includes(e.key): // arrow navigation
        e.preventDefault();
        fnNavigation(e.key); // navigation from reactGrid
        break;
      case e.key === 'Delete' && e.shiftKey: // delete
        removeRow();
        break;
      default:
    }
  };

  const keyDnEdit = (e) => {
    console.log(e.key);
    switch (true) {
      case ['Tab', 'Enter', 'Return'].includes(e.key): // ENTER + TAB - leave with save
        console.log('THIS IS ENTER');
        e.preventDefault();
        acceptEditedValue(divEditRef.current.innerText);
        break;
      case e.key === 'Escape': // ESC - leaving without update database
        e.preventDefault();
        console.log('Escape pressed');
        setEditModeStateActive(false);
        setTimeout(() => {
          console.log('NOW FOCUSED');
          cellRef.current.focus();
        }, 100);
        break;
      case ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Delete', 'Backspace'].includes(e.key):
        console.log('SHOULD DO NOTHING');
        break;
      case (!fnFilterEditChar(e.key, cellValue, row)):
        e.preventDefault();
        break;
      default:
        break;
    }
  };

  const setWhisperedData = (wd) => {
    setEditModeStateActive(false);
    const cellPrevValue = cellValue;
    const operData = {};
    console.log('WD: ', wd);
    operData.pdk = wd.pdk;
    operData.name_pdk = wd.name;
    operData.name_original = wd.name;
    operData[primaryKey] = row[primaryKey]; // data for server must be in {line_id: 12932, some_col: 'new value'}
    console.log('OPER DATA: ', operData);
    const dataToSend = { operation: 'edit', data: operData };
    serverUpdate(dataToSend, colDefs, serverSideEdit)
      .then((updRow) => {
        console.log('-.----------------------', updRow);
        updatePageDataWithRow(updRow, y);
        fnUpdateDataOnEditWithoutRender(updRow);
        setModalWarningActive(false);
        setModalWarningText('');
        fnNavigation('move_next'); // move cursor
      })
      .catch((err) => {
        updatePageDataWithCell(cellPrevValue, col, y);
        setModalWarningActive(true);
        setModalWarningText(err);
        cellRef.current.focus();
      });
  };

  const EditingDiv = () => (
    <div
      style={{ position: 'relative', outline: 'none' }}
      role="textbox"
      tabIndex="0"
      // onBlur={onBlr}
      contentEditable
      suppressContentEditableWarning
      ref={divEditRef}
      onKeyDown={keyDnEdit}
      onBlur={() => {
        console.log('EDITING DIV BLURED', divEditRef.current.innerText);
        acceptEditedValue(divEditRef.current.innerText);
      }}
    >
      {cellValueEdit}
    </div>
  );

  const WhisperingEditingDiv = () => (
    <WhispererInput
      setWhisperActive={setWhisperActive}
      keyTimeOut="1000"
      setFinalData={setWhisperedData}
      whisperApi={colDefs[col].whisperApi}
      whisperTextKey="name"

    >
      <div
        style={{ outline: 'none' }}
        role="textbox"
        tabIndex="0"
        // onBlur={onBlr}
        contentEditable
        suppressContentEditableWarning
        ref={divEditRef}
        onKeyDown={keyDnEdit}
        onBlur={() => {
          console.log('WHISPERING EDITING DIV BLURED');
          setTimeout(() => acceptEditedValue(divEditRef.current.innerText), 1000);
        }}
      >
        {cellValueEdit}
      </div>
    </WhispererInput>
  );

  const titleRender = (v, r) => {
    switch (Object.prototype.toString.call(colDefs[col].title)) {
      case '[object Function]':
        return colDefs[col].title(v, r);
      case '[object String]':
        return colDefs[col].title;
      case '[object Boolean]':
        if (colDefs[col].title) {
          return cellRenderer(v, r);
        }
        return undefined;
      default:
        return undefined;
    }
  };


  return (
    <td
      className={[
        cellClassNames(colDefs[col].fnCellClass, cellValue, row),
        tableCellClass
      ].join(' ')}
      style={colDefs[col].width ? { width: `${colDefs[col].width}` } : {}}
      role="gridcell"
      key={`${String(y)}-${String(x)}`}
      ref={cellRef}
      id={`${String(y)}-${String(x)}`}
      tabIndex={-1}
      onBlur={onBlrCell}
      // contentEditable={editMode.current.active}
      // suppressContentEditableWarning
      onFocus={onFoc}
      onKeyDown={keyDn}
      onClick={() => {
        if (colDefs[col].onCl) acceptEditedValue();
      }}
      title={titleRender(cellValue, row)}
    >
      {!editModeStateActive && cellRenderer(cellValue, row)}
      {(editModeStateActive && colDefs[col].whisper) && <WhisperingEditingDiv />}
      {(editModeStateActive && !colDefs[col].whisper) && <EditingDiv />}
      {modalWarningActive && (
        <CellModalWarning cellRef={cellRef} show x={x} y={y}>
          <div title={modalWarningText}>{modalWarningText.slice(0, 25)}</div>
        </CellModalWarning>
      )}
    </td>
  );
};

export default React.memo(MyReactCell);
