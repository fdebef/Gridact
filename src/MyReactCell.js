import React, {
  useCallback, useEffect, useRef, useState
} from 'react';
import cellClassNames from './cellClassNames';
import CellModalWarning from './CellModalWarning';
import serverUpdate from './serverUpdate';

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
    fnUpdateRowData,
    serverSideEdit,
    primaryKey,
    removeRow,
    tableCellClass,
    setRowData
  } = props;

  // TODO: Try to put this into useRef

  const fnFilterEditedValue = (newValue, curCellValue, curRow) => {
    console.log(Object.prototype.toString.call(colDefs[col].filterEditValue));
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
  const [renderCount, forceRender] = useState(0);
  const editMode = useRef({ active: false, curValue: undefined });
  const [editModeState, setEditModeState] = useState({ active: false, prevValue: undefined });
  const [modalWarningActive, setModalWarningActive] = useState({
    active: false,
    text: undefined
  });
  // define ref to cell and store it to the store
  const cellRef = useRef(null);
  const divEditRef = useRef(null);
  fnUpdateRefStore(x, y, cellRef);

  // cell renderer based on colDefs
  const cellRenderer = useCallback((celVal, rw) => {
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
  }, [colDefs, col]);

  /* eslint-disable max-len */
  const setEndOfContenteditable = (contentEditableElement) => {
    const range = document.createRange(); // Create a range (a range is a like the selection but invisible)
    range.selectNodeContents(contentEditableElement); // Select the entire contents of the element with the range
    range.collapse(false); // collapse the range to the end point. false means collapse to end rather than the start
    const selection = window.getSelection(); // get the selection object (allows you to change selection)
    selection.removeAllRanges(); // remove any selections already made
    selection.addRange(range); // make the range you have just created the visible selection
  };

  const [origValue, setOrigValue] = useState(cellValue);

  useEffect(() => {
    if (editModeState.active) setEndOfContenteditable(divEditRef.current);
  }, [editModeState]);

  useEffect(() => {
    setValueState(cellRenderer(cellValue, row));
    setOrigValue(cellValue);
  }, [cellRenderer, cellValue, row]);

  useEffect(() => {}, [valueState]);


  // --------------------------------------------------------------------------
  // --------------------------------------------------------------------------
  // Space pressed must be held both in keyDown and keyPress - it is not fired
  // in keyPress, so we have to setup spacePressed variable to allow space
  // processing in keyDown
  const keyDn = (e) => {
    switch (editModeState.active) {
      case false: // non editing mode
        switch (true) {
          case [13, 113].includes(e.keyCode): // enter, F2
            if (colDefs[col].editable) {
              e.preventDefault();
              setEditModeState({ active: true, prevValue: origValue });
              // curValue is calculated from data - better then taken from innerText, that might be changed
              // editMode.current = { active: true, curValue: cellValue };
              // console.log('-------------', editMode.current.curValue);
              // setValueState(cellValue);
              // forceRender(p => p + 1);
            }
            break;
          case [27].includes(e.keyCode):
            e.preventDefault();
            setModalWarningActive({ active: false, text: false });
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
        switch (true) {
          case [9, 13].includes(e.keyCode): // ENTER + TAB - leave with save
            e.preventDefault();
            // eslint-disable-next-line no-case-declarations
            const sanitizedInnerText = fnFilterEditedValue(
              cellRef.current.innerText,
              valueState,
              row
            );
            console.log('SANITIZED: ', sanitizedInnerText);
            // only disable active
            setValueState(divEditRef.current.value);
            setEditModeState(prev => ({ ...prev, active: false }));
            // if value was changed (curValue before edit is not same as sanitized text
            if (editModeState.curValue !== sanitizedInnerText) {
              const operData = {};
              setValueState(cellRenderer(sanitizedInnerText));
              operData[col] = sanitizedInnerText;
              operData[primaryKey] = row[primaryKey]; // data for server must be in {line_id: 12932, some_col: 'new value'}
              const dataToSend = { operation: 'edit', data: operData };
              serverUpdate(dataToSend, colDefs, serverSideEdit)
                .then((updRow) => {
                  console.log('RETURNED ROW', updRow);
                  fnUpdateDataOnEditWithoutRender(updRow);
                  setValueState(cellRenderer(updRow[col]));
                  setRowData(updRow); // update whole current row Data
                  setModalWarningActive({ active: false, text: null });
                  setEditModeState({ active: false, curValue: undefined });
                  fnNavigation(913); // move cursor
                })
                .catch((err) => {
                  // curValue must be preserved as editMode is changed before promise gets resolved
                  setEditModeState((cv) => {
                    setValueState(cellRenderer(cv.curValue));
                    setModalWarningActive({ active: true, text: err });
                    return { active: false, curValue: undefined };
                  });
                });
            } else {
              setEditModeState((cv) => {
                setValueState(cellRenderer(cv.curValue));
                setModalWarningActive({ active: true, text: err });
                return { active: false, curValue: undefined };
              });
            }
            break;
          case e.keyCode === 27: // ESC - leaving without update database
            e.preventDefault();
            // eslint-disable-next-line no-case-declarations
            const { prevValue } = editModeState;
            console.log('THIS IS PREVIOUS VALUE: ', prevValue);
            Promise.resolve().then(() => {
              setValueState(cellRenderer(prevValue));
              setEditModeState({ active: false, prevValue: undefined });
              setModalWarningActive({ active: false, text: undefined });
              cellRef.current.focus();
            });
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
    console.log('CELL BLURED');
    if (editMode.current.active) {
      // leaving cell without Enter
      const cvBlr = editMode.current.curValue;
      Promise.resolve().then(() => {
        setValueState(cellRef.current.innerText);
        setValueState(cvBlr); // set original value
      });
      editMode.current = { active: false, curValue: undefined };
    }
    if (modalWarningActive.active) setModalWarningActive({ active: false, text: undefined });
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
      className={[cellClassNames(colDefs[col].fnCellClass, cellValue, row), tableCellClass].join(' ')}
      style={{ ...widthStyle(colDefs[col].width) }}
      role="gridcell"
      key={`${String(y)}-${String(x)}`}
      ref={cellRef}
      id={`${String(y)}-${String(x)}`}
      tabIndex={-1}
      // contentEditable={editMode.current.active}
      // suppressContentEditableWarning
      onKeyDown={keyDn}
      onFocus={onFoc}
      onBlur={onBlr}
      onKeyPress={keyPs}
    >
      {!editModeState.active && valueState}
      {editModeState.active && (
        <div
          style={{ outline: 'none' }}
          contentEditable
          suppressContentEditableWarning
          ref={divEditRef}
        >
          {cellValue}
        </div>
      )}
      {modalWarningActive.active && (
        <CellModalWarning cellRef={cellRef} show x={x} y={y}>{modalWarningActive.text}</CellModalWarning>
      )}
    </td>
  );
};
export default MyReactCell;
