import React, {
  useEffect, useRef, useState
} from 'react';
import cellClassNames from './cellClassNames';
import CellModalWarning from './CellModalWarning';
import serverUpdate from './serverUpdate';
import propsAreEqual from './propsAreEqual';

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
        return char.match(colDefs[col].filterEditValue);
      case '[object Undefined]':
        return char.match(
          /[a-zA-ZÅ¡ÄÅÅ¾Ã½Ã¡Ã­Ã©Ã³ÃºÅ¯ÄÅ¥ÅÄÅÅ¤Å ÄÅÅ½ÃÃÃÃÃÅ®0-9 ]/
        );
      default:
        throw Error(
          `Not valid filterEditValue. Must be Function, RegExp or Undefined. Is ${Object.prototype.toString.call(
            colDefs[col].filterEditChar
          )}`
        );
    }
  };

  const [valueState, setValueState] = useState(undefined);
  const editMode = useRef({ active: false, curValue: undefined });
  const [editModeStateActive, setEditModeStateActive] = useState(false);
  const [modalWarningActive, setModalWarningActive] = useState(false);
  const [modalWarningText, setModalWarningText] = useState(false);

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

  /* eslint-disable max-len */
  const setEndOfContenteditable = (contentEditableElement) => {
    const range = document.createRange(); // Create a range (a range is a like the selection but invisible)
    range.selectNodeContents(contentEditableElement); // Select the entire contents of the element with the range
    range.collapse(false); // collapse the range to the end point. false means collapse to end rather than the start
    const selection = window.getSelection(); // get the selection object (allows you to change selection)
    selection.removeAllRanges(); // remove any selections already made
    selection.addRange(range); // make the range you have just created the visible selection
  };

  useEffect(() => {
    if (editModeStateActive) setEndOfContenteditable(divEditRef.current);
  }, [editModeStateActive]);

  // --------------------------------------------------------------------------
  // --------------------------------------------------------------------------
  // Space pressed must be held both in keyDown and keyPress - it is not fired
  // in keyPress, so we have to setup spacePressed variable to allow space
  // processing in keyDown
  const keyDn = (e) => {
    switch (editModeStateActive) {
      case false: // non editing mode
        switch (true) {
          case [13, 113].includes(e.keyCode): // enter, F2
            if (colDefs[col].editable) {
              e.preventDefault();
              setEditModeStateActive(true);
              // curValue is calculated from data - better then taken from innerText, that might be changed
              // editMode.current = { active: true, curValue: cellValue };
              // console.log('-------------', editMode.current.curValue);
              // setValueState(cellValue);
              // forceRender(p => p + 1);
            }
            break;
          case [27].includes(e.keyCode):
            e.preventDefault();
            setModalWarningActive(false);
            setModalWarningText(undefined);
            break;
          case [37, 38, 39, 40, 36, 35, 33, 34, 9].includes(e.keyCode): // arrow navigation
            e.preventDefault();
            fnNavigation(e.keyCode); // navigation from reactGrid
            break;
          case e.keyCode === 46: // delete
            removeRow();
            break;

          default:
            void 0;
        }
        break;
      case true: // editing mode
        // eslint-disable-next-line no-case-declarations
        switch (true) {
          case [9, 13].includes(e.keyCode): // ENTER + TAB - leave with save
            e.preventDefault();
            // eslint-disable-next-line no-case-declarations
            const sanitizedInnerText = fnFilterEditedValue(
              divEditRef.current.innerText,
              cellValue,
              row
            );
            // eslint-disable-next-line no-case-declarations
            const cellPrevValue = cellValue;
            updatePageDataWithCell(sanitizedInnerText, col, y);
            setEditModeStateActive(false);
            // if value was changed (curValue before edit is not same as sanitized text
            if (cellValue !== sanitizedInnerText) {
              const operData = {};
              operData[col] = sanitizedInnerText;
              operData[primaryKey] = row[primaryKey]; // data for server must be in {line_id: 12932, some_col: 'new value'}
              const dataToSend = { operation: 'edit', data: operData };
              serverUpdate(dataToSend, colDefs, serverSideEdit)
                .then((updRow) => {
                  updatePageDataWithRow(updRow, y);
                  fnUpdateDataOnEditWithoutRender(updRow);
                  setModalWarningActive(false);
                  setModalWarningText(undefined);
                  fnNavigation(913); // move cursor
                })
                .catch((err) => {
                  updatePageDataWithCell(cellPrevValue, col, y);
                  setModalWarningActive(true);
                  setModalWarningText(err);
                  cellRef.current.focus();
                });
            } else {
              setEditModeStateActive(true);
              cellRef.current.focus();
            }
            break;
          case e.keyCode === 27: // ESC - leaving without update database
            e.preventDefault();
            // eslint-disable-next-line no-case-declarations
            setEditModeStateActive(false);
            setModalWarningActive(false);
            setModalWarningText(undefined);
            cellRef.current.focus();
            break;
          default:
            break;
        }
        break;
      default:
        void 0;
    }
  };

  const keyPs = (e) => {
    // filter some characters to protext scripting
    if (editMode.current.active) {
      if (!fnFilterEditChar(e.key, cellValue, row)) {
        // protext against
        e.preventDefault();
      }
    }
  };

  const onBlr = (e) => {
    setEditModeStateActive(false);
    setModalWarningActive(false);
    setModalWarningText(undefined);
  };

  const onBlrModal = () => {
    if (modalWarningActive) {
      setModalWarningActive(false);
      setModalWarningText(undefined);
    }
  };

  const onFoc = () => {
    fnSetActiveCell([x, y]);
  };

  const widthStyle = (width) => {
    if (width) {
      return { width };
    }
  };

  return (
    <td
      className={[
        cellClassNames(colDefs[col].fnCellClass, cellValue, row),
        tableCellClass
      ].join(' ')}
      style={{ ...widthStyle(colDefs[col].width) }}
      role="gridcell"
      key={`${String(y)}-${String(x)}`}
      ref={cellRef}
      id={`${String(y)}-${String(x)}`}
      tabIndex={-1}
      onBlur={onBlrModal}
      // contentEditable={editMode.current.active}
      // suppressContentEditableWarning
      onKeyDown={keyDn}
      onFocus={onFoc}
      onKeyPress={keyPs}
    >
      {!editModeStateActive && cellRenderer(cellValue)}
      {editModeStateActive && (
        <div
          style={{ outline: 'none' }}
          onBlur={onBlr}
          contentEditable
          suppressContentEditableWarning
          ref={divEditRef}
        >
          {cellValue}
        </div>
      )}
      {modalWarningActive && (
        <CellModalWarning cellRef={cellRef} show x={x} y={y}>
          {modalWarningText}
        </CellModalWarning>
      )}
    </td>
  );
};

export default React.memo(MyReactCell);
