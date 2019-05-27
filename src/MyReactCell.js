import React, {
  useEffect,
  useRef, useState
} from 'react';
import ReactDOM from 'react-dom';

/* eslint-disable react/prop-types */
const MyReactCell = (props) => {
  const {
    y, x, col, cellValue, colRowsCount,
    fnUpdateRefStore, fnSetActiveCell, colDefs, fnNavigation, row,
    fnUpdateDataOnEditWithoutRender, fnUpdateRowData, serverSideEdit,
    primaryKey, removeRow, rowForceUpdate
  } = props;

  // TODO: Try to put this into useRef

  const fnFilterEditedValue = (newValue, curCellValue, curRow) => {
    switch (Object.prototype.toString.call(colDefs[col].filterEditValue)) {
      case '[object Function]':
        return colDefs[col].filterEditValue(newValue, cellValue, curRow);
      case '[object RegExp]':
        return newValue.replace(colDefs[col].filterEditValue, '');
      case '[object Undefined]':
        return newValue.replace(/[{]|[}]|[<]|[>]|[\\]|[/]/g, '');
      default:
        throw Error(`Not valid filterEditValue. Must be Function, RegExp or Undefined. Is ${
          Object.prototype.toString.call(colDefs[col].filterEditValue)}`);
    }
  };

  const fnFilterEditChar = (char, curCellValue, curRow) => {
    switch (Object.prototype.toString.call(colDefs[col].filterEditChar)) {
      case '[object Function]':
        return colDefs[col].filterEditChar(char, curCellValue, curRow);
      case '[object RegExp]':
        return char.match(colDefs[col].filterEditValue);
      case '[object Undefined]':
        return true;
      default:
        throw Error(`Not valid filterEditValue. Must be Function, RegExp or Undefined. Is ${
          Object.prototype.toString.call(colDefs[col].filterEditChar)}`);
    }
  };

  const [valueState, setValueState] = useState(undefined);
  const [renderCount, forceRender] = useState(0);
  const editMode = useRef({active: false, curValue: undefined});
  const [modalWarningActive, setModalWarningActive] = useState({active: false, text: undefined});
  // define ref to cell and store it to the store
  const cellRef = useRef(null);
  fnUpdateRefStore(x, y, cellRef);

  useEffect(() => {
    setValueState(cellValue);
  }, [cellValue]);

  useEffect(() => {
  }, [valueState]);


  // cell renderer based on colDefs
  const cellRenderer = (celVal, rw) => {
    if (colDefs[col].cellRender === undefined) return celVal;
    if ((typeof colDefs[col].cellRender) === 'function') return (colDefs[col].cellRender(celVal, rw));
    return colDefs[col].cellRender;
  };

  /* eslint-disable max-len */
  const setEndOfContenteditable = (contentEditableElement) => {
    const range = document.createRange();// Create a range (a range is a like the selection but invisible)
    range.selectNodeContents(contentEditableElement);// Select the entire contents of the element with the range
    range.collapse(false);// collapse the range to the end point. false means collapse to end rather than the start
    const selection = window.getSelection();// get the selection object (allows you to change selection)
    selection.removeAllRanges();// remove any selections already made
    selection.addRange(range);// make the range you have just created the visible selection
  };

  const serverUpdate = (newCellValue) => {
    const operData = {};
    operData[col] = newCellValue;
    operData[primaryKey] = row[primaryKey]; // data for server must be in {line_id: 12932, some_col: 'new value'}
    const dataToSend = {operation: 'edit', data: operData};
    return new Promise((resolve, reject) => {
      serverSideEdit(dataToSend)
        .then((rs) => { // successfull return
          let parsedRes;
          if (typeof rs === 'string') {
            try { // try to parse as JSON
              parsedRes = JSON.parse(rs);
            } catch (e) {
              reject('Not a JSON string');
            }
          } else if (typeof rs === 'object') {
            try { // try to parse as JSON
              parsedRes = JSON.parse(JSON.stringify(rs));
            } catch (e) {
              reject('Not valid JSON');
            }
          } else reject('Not a valid JSON string nor JSON object');
          const redefRow = {}; // prepare redefined row
          if (!parsedRes.error) { // if in response is not {error: 'some error'
            const dataResp = parsedRes.data;
            Object.keys(colDefs).forEach((c) => { // iterate over colDefs
              redefRow[c] = dataResp[c]; // take only cols in colDefs
            });
            resolve(redefRow); // return redefined new Row
          }
          reject(parsedRes.error); // if error in response
        })
        .catch((err) => {
          reject(`API ERROR${JSON.stringify(err)}`);
        });
    });
  };

  // Space pressed must be held both in keyDown and keyPress - it is not fired
  // in keyPress, so we have to setup spacePressed variable to allow space
  // processing in keyDown
  const keyDn = (e) => {
    switch (editMode.current.active) {
      case false: // non editing mode
        switch (true) {
          case [13, 113].includes(e.keyCode): // enter, F2
            if (colDefs[col].editable) {
              e.preventDefault();
              // curValue is calculated from data - better then taken from innerText, that might be changed
              editMode.current = {active: true, curValue: cellRef.current.innerText};
              forceRender(p => p + 1);
              setEndOfContenteditable(cellRef.current);
            }
            break;
          case [27].includes(e.keyCode):
            e.preventDefault();
            setModalWarningActive({active: false, text: false});
            break;
          case [37, 38, 39, 40, 36, 35, 33, 34, 9].includes(e.keyCode): // arrow navigation
            e.preventDefault();
            fnNavigation(e.keyCode); // navigation from reactGrid
            break;
          case (e.keyCode === 46): // delete
            removeRow();
            break;

          default:
            void (0);
        }
        break;
      case true: // editing mode
        switch (true) {
          case [9, 13].includes(e.keyCode): // ENTER + TAB - leave with save
            e.preventDefault();
            const sanitizedInnerText = fnFilterEditedValue(cellRef.current.innerText, valueState, row);
            editMode.current = {active: false, curValue: editMode.current.curValue}; // only disable active
            forceRender(p => p + 1)
            if (!(editMode.current.curValue === sanitizedInnerText)) {
              serverUpdate(sanitizedInnerText)
                .then((updRow) => {
                  Promise.resolve().then(() => {
                    // change value must be done before row is updated, so React knows
                    // what is user - changed value
                    setValueState(cellRef.current.innerText);
                    setValueState(updRow[col]);
                    fnUpdateDataOnEditWithoutRender(updRow); // update data2 in Grid with new row
                    fnUpdateRowData(updRow); // update whole current row Data
                    setModalWarningActive({active: false, text: null});
                  });
                  editMode.current = {active: false, curValue: undefined};
                  fnNavigation(913);
                })
                .catch((err) => {
                  // curValue must be preserved as editMode is changed before promise gets resolved
                  const cv = editMode.current.curValue;
                  Promise.resolve().then(() => {
                    setValueState(cellRef.current.innerText);
                    setValueState(cv);
                    setModalWarningActive({active: true, text: err});
                  });
                  editMode.current = {active: false, curValue: undefined};
                });
            }
            break;
          case e.keyCode === 27: // ESC - leaving without update database
            e.preventDefault();
            // curValue must be preserved as editMode is changed before promise gets resolved
            const cv = editMode.current.curValue;
            Promise.resolve().then(() => {
              setValueState(`${cellRef.current.innerText}`);
              setValueState(cv);
            });
            editMode.current = {active: false, curValue: undefined};
            setModalWarningActive({active: false, text: undefined});
            break;
          default:
            break;
        }
        break;
      default:
        void (0);
    }
  };

  const keyPs = (e) => { // filter some characters to protext scripting
    if (editMode.current.active) {
      if (!fnFilterEditChar(e.key, cellValue, row)) { // protext against
        e.preventDefault();
      }
    }
  };

  const onBlr = (e) => {
    if (editMode.current.active) { // leaving cell without Enter
      const cvBlr = editMode.current.curValue;
      Promise.resolve().then(() => {
        setValueState(cellRef.current.innerText);
        setValueState(cvBlr); // set original value
        fnSetActiveCell([undefined, undefined]);
      });
      editMode.current = {active: false, curValue: undefined};
    }
    if (modalWarningActive.active) setModalWarningActive({active: false, text: undefined});
  };

  const onFoc = () => {
    fnSetActiveCell([x, y]);
  };


  const cellClassNames = (rwDt) => {
    const userClass = colDefs[col].cellClass;
    if (!userClass) return undefined;
    if (typeof userClass === 'string') return userClass;
    if (Array.isArray(userClass)) return userClass.join(' ');
    if (typeof userClass === 'function') {
      const calcClass = userClass(rwDt);
      if (!calcClass) return undefined;
      if (typeof calcClass === 'string') return calcClass;
      if (Array.isArray(calcClass)) return calcClass.join(' ');
    }
    return undefined;
  };


  const ModalWarning = ({show, children}) => {
    let modLeft = 0;
    let modTop = 0;

    if (!cellRef.current) return null;
    modLeft = cellRef.current.getBoundingClientRect().left + 10;
    modTop = cellRef.current.getBoundingClientRect().top + 25;
    const modalDiv = (
      <div
        key={`modaldiv-${String(y)}-${String(x)}`}
        className="moverlay d-flex flex-row justify-content-center align-items-center"
        style={{top: modTop, left: modLeft}}
      >
        {children}
      </div>
    );
    return show && ReactDOM.createPortal(modalDiv, document.getElementById('modalEl'));
  };

  return (
    <td
      className={cellClassNames(row)}
      role="gridcell"
      key={`${String(y)}-${String(x)}`}
      ref={cellRef}
      id={`${String(y)}-${String(x)}`}
      tabIndex={-1}
      contentEditable={editMode.current.active}
      suppressContentEditableWarning
      onKeyDown={keyDn}
      onFocus={onFoc}
      onBlur={onBlr}
      onKeyPress={keyPs}
    >
      {cellRenderer(valueState, row)}
      {modalWarningActive.active
      && (
        <ModalWarning show>
          {modalWarningActive.text}
        </ModalWarning>
      )}
    </td>


  );
};
export default MyReactCell;