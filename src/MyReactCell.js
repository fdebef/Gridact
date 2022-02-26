import React, { useEffect, useRef, useState, useContext } from 'react';
import cellClassNames from './cellClassNames';
import CellModalWarning from './CellModalWarning';
import serverUpdate from './serverUpdate';
import WhispererInput from '../tools/WhispererInput';
import acceptEditedValue from './acceptEditedValue';
import keyDnEdit from './keyDnEdit';
import keyDn from './keyDn';
import GridContext from './GridContext/GridContext';
import removeRow from './removeRow';
import InputEdit from './InputEdit';
import WhisperingEditingDiv from './WhisperingEditingDiv';
import SmallModal from '../tools/SmallModal';

/* eslint-disable react/prop-types */
const MyReactCell = function (props) {
  const { y, x, col, cellData, row } = props;

  const LocalContext = useContext(GridContext);

  const {
    data,
    setData,
    data2,
    setData2,
    pageData,
    setPageData,
    colDefs,
    tableClasses,
    sortState,
    fnRowClass,
    primaryKey,
    fnSetActiveCell,
    fnGetActiveCell,
    fnUpdateRefStore,
    fnGetRefStore,
    serverSideEdit,
    removeRow,
    wrapperDivClass,
    onEnterMoveDown,
    tableCellClass,
    pageLength,
    pageActual,
    fnNavigation,
  } = LocalContext;

  // TODO: Try to put this into useRef

  const [cellValue, setCellValue] = useState(cellData);

  useEffect(() => {
    setCellValue(cellData);
  }, [cellData]);

  const [inputEditValue, setInputEditValue] = useState('');
  const whisperEval = (w) => {
    if (Object.prototype.toString.call(w) === '[object Function]') {
      return w(row);
    }
    if (Object.prototype.toString.call(w) === '[object Boolean]') {
      return w;
    }
    return false;
  };

  const [editModeStateActive, setEditModeStateActive] = useState(false);
  // using only state in setTimeout caused wrong states
  // so editModeStateActive is stored in editStateRef
  const [modalWarningActive, setModalWarningActive] = useState(false);
  const [modalWarningText, setModalWarningText] = useState('');

  // define ref to cell and store it to the store
  const cellRef = useRef(null);
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

  const onBlrCell = () => {
    if (modalWarningActive) {
      setModalWarningActive(false);
      setModalWarningText('');
    }
    fnSetActiveCell([undefined, undefined, x, y]);
  };

  const onFoc = () => {
    fnSetActiveCell([x, y]);
  };

  const setWhisperedData = (wd) => {
    acceptEditedValue({
      inputEditValue: wd,
      setEditModeStateActive,
      setModalWarningActive,
      setModalWarningText,
      cellValue,
      setCellValue,
      col,
      row,
      cellRef,
      whisper: true,
      LocalContext,
    });
  };

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
        tableCellClass,
      ]
        .flat()
        .join(' ')}
      style={{
        width: colDefs[col].width,
        maxWidth: colDefs[col].maxWidth || colDefs[col].width,
        minWidth: colDefs[col].minWidth || colDefs[col].width,
      }}
      role="gridcell"
      key={`${String(y)}-${String(x)}`}
      ref={cellRef}
      id={`${String(y)}-${String(x)}`}
      tabIndex={-1}
      onBlur={onBlrCell}
      // contentEditable={editMode.current.active}
      // suppressContentEditableWarning
      onFocus={onFoc}
      onKeyDown={(e) => {
        keyDn({
          e,
          setEditModeStateActive,
          editModeStateActive,
          setModalWarningActive,
          setModalWarningText,
          cellValue,
          setCellValue,
          col,
          row,
          y,
          cellRef,
          setInputEditValue,
          editable,
          LocalContext,
        });
      }}
      onClick={() => {
        if (colDefs[col].onCl)
          acceptEditedValue({
            editedValue: null,
            setEditModeStateActive,
            setModalWarningActive,
            setModalWarningText,
            setCellValue,
            cellValue,
            col,
            row,
            y,
            cellRef,
            LocalContext,
          });
      }}
      title={titleRender(cellValue, row)}
    >
      {!editModeStateActive && cellRenderer(cellValue, row)}
      {/* If whispering is defined */}
      {editModeStateActive && whisperEval(colDefs[col].whisper) && (
        <WhisperingEditingDiv
          cellVal={cellValue}
          inputEditValue={inputEditValue}
          setInputEditValue={setInputEditValue}
          setWhisperedData={setWhisperedData}
          colDefs={colDefs}
          col={col}
          additionalWhisperData={row}
          keyDnEditWhisper={(e) => {
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
              LocalContext,
            });
          }}
          fnOnBlur={() => {
            setEditModeStateActive(false);
          }}
        />
      )}

      {editModeStateActive && !whisperEval(colDefs[col].whisper) && (
        <InputEdit
          inputEditValue={inputEditValue}
          setInputEditValue={setInputEditValue}
          setEditModeStateActive={setEditModeStateActive}
          setModalWarningActive={setModalWarningActive}
          setModalWarningText={setModalWarningText}
          cellValue={cellValue}
          setCellValue={setCellValue}
          col={col}
          row={row}
          y={y}
          cellRef={cellRef}
          editable={editable}
          LocalContext={LocalContext}
        />
      )}
      {modalWarningActive && (
        <SmallModal
          cellRef={cellRef}
          mLeft={cellRef.current.getBoundingClientRect().left}
          mTop={cellRef.current.getBoundingClientRect().top}
          setShowSelf={setModalWarningActive}
        >
          <div title={modalWarningText}>{modalWarningText.slice(0, 25)}</div>
        </SmallModal>
      )}
    </td>
  );
};

export default React.memo(MyReactCell);
