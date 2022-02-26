import React, { useRef, useState, useEffect } from 'react';
import WhispererTable from './WhispererTable';
import './whisperStyle.css';
import SmallModal from './SmallModal';

const FUNCTION_KEYS = [
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Return',
  'Enter',
  'Escape',
  'Tab',
  'PageUp',
  'PageDown',
];

// WhispererInput takes child (usually input) and wraps it
// with whispering functionality.
// WhisperApi takes object with sstring key and awaits
// returning from server an object with data key
// that includes Array of Objects, that are displayed
// in whisper table.

const WhispererInput = function ({
  children,
  keyTimeOut,
  setFinalData,
  whisperApi,
  additionalWhisperData,
  onOpen,
  onClose,
  divStyle,
  parentRef,
}) {
  const [whisperData, setWhisperData] = useState([]);
  const selectedData = useRef({});
  const [activeRow, setActiveRow] = useState(null);
  const [noDataWarning, setNoDataWarning] = useState(false);
  const timeout = useRef();

  const getBoundingBox = (ref) => {
    if (ref.current) {
      return {
        x: ref.current.getBoundingClientRect().left,
        y: ref.current.getBoundingClientRect().top,
        h: ref.current.getBoundingClientRect().height,
      };
    }
  };

  const getWhisperData = async () => {
    if (children.ref.current) {
      if (children.ref.current.value.length > 2) {
        try {
          let wDataFromUser = await whisperApi({
            sstring: children.ref.current.value.replace(
              String.fromCharCode(160),
              ' '
            ),
            additionalWhisperData,
          });
          setActiveRow(null);
          if (
            Object.prototype.toString.call(wDataFromUser) !== '[object Object]'
          ) {
            wDataFromUser = JSON.parse(wDataFromUser);
          }
          if (wDataFromUser.data.length === 0) {
            setNoDataWarning(true);
          } else {
            setNoDataWarning(false);
          }
          setWhisperData(wDataFromUser.data);
        } catch (er) {
          console.log('THIS IS CHILDREN: ', children);
          console.log('ERROR GETTING WHISPER DATA: ', er);
        }
      } else {
        setWhisperData([]);
      }
    }
  };

  const handleInput = (e, origElemHandle) => {
    if (
      e.ctrlKey ||
      e.altKey ||
      e.metaKey ||
      e.key === 'Home' ||
      e.key === 'End' ||
      e.key === 'Shift'
    ) {
      return;
    }
    // whisper table visible, no data selected
    if (whisperData.length && activeRow === null) {
      switch (e.key) {
        case 'Tab':
          e.preventDefault();
          setActiveRow(0);
          break;
        case 'ArrowDown':
          setActiveRow(0);
          break;
        case 'Enter':
          e.preventDefault();
          setWhisperData([]);
          break;
        case 'Escape':
          e.preventDefault();
          setActiveRow(null);
          setWhisperData([]);
          break;
        case 'PageDown':
          e.preventDefault();
          break;
        case 'PageUp':
          e.preventDefault();
          break;
        default:
          break;
      }
      // whisper table visible, some row selected
    } else if (whisperData.length && activeRow !== null) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveRow((p) => {
            if (p + 1 > whisperData.length - 1) return p;
            return p + 1;
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveRow((p) => {
            if (p - 1 < 0) return null;
            return p - 1;
          });
          break;
        case 'PageDown':
          e.preventDefault();
          setActiveRow((p) => {
            if (p + 3 > whisperData.length - 1) return whisperData.length - 1;
            return p + 3;
          });
          break;
        case 'PageUp':
          e.preventDefault();
          setActiveRow((p) => {
            if (p - 3 < 0) return null;
            return p - 3;
          });
          break;
        case 'Enter':
          e.preventDefault();
          selectedData.current = whisperData[activeRow];
          // hide whisper table
          setWhisperData([]);
          setActiveRow(null);
          setFinalData(selectedData.current);
          break;
        case 'Esc':
          setActiveRow(null);
          e.preventDefault();
          setWhisperData([]);
          // children.ref.current.focus();
          break;
        case 'Tab':
          e.preventDefault();
          break;
        default:
          break;
      }
    } else if (
      !whisperData.length &&
      Object.keys(selectedData.current).length
    ) {
      if (e.key === 'Enter') {
        e.preventDefault();
        const sd = selectedData.current;
        setFinalData(sd);
        selectedData.current = {};
      }
    }
    // original Element Handle is children.props.onKeyDown
    // here we add it to special chain of functions
    if (
      !whisperData.length &&
      !Object.keys(selectedData.current).length &&
      origElemHandle
    ) {
      origElemHandle(e);
    }
    if (!FUNCTION_KEYS.includes(e.key)) {
      if (timeout.current) {
        clearTimeout(timeout.current);
        timeout.current = null;
      }
      timeout.current = setTimeout(getWhisperData, keyTimeOut);
    }
  };

  // Whispering child clones the child element and adds functionality
  // for handling input to this input.

  const whisperingChild = React.cloneElement(children, {
    ...children.props,
    onKeyDown: (e) => {
      // add special action to onKeyDown with handleInput fn
      handleInput(e, children.props.onKeyDown);
    },
    style: { ...children.props.style, fontStyle: 'italic' },
  });

  return (
    <div
      id="whispererInput"
      style={{ width: '100%', display: 'grid', ...divStyle }}
    >
      {whisperingChild}
      {whisperData.length > 0 && (
        <WhispererTable
          whisperData={whisperData}
          setWhisperData={setWhisperData}
          inputRef={children.ref}
          activeRow={activeRow}
          setActiveRow={setActiveRow}
          setFinalData={setFinalData}
          selectedData={selectedData}
          onOpen={onOpen}
          onClose={onClose}
          tableLeft={getBoundingBox(children.ref).x}
          tableTop={
            getBoundingBox(children.ref).y + getBoundingBox(children.ref).h
          }
        />
      )}
      {noDataWarning && (
        <SmallModal
          setShowSelf={setNoDataWarning}
          mHeight={30}
          mWidth={150}
          timeout={1000}
          mLeft={getBoundingBox(children.ref).x}
          mTop={getBoundingBox(children.ref).y + getBoundingBox(children.ref).h}
        >
          Žádná data
        </SmallModal>
      )}
    </div>
  );
};

export default WhispererInput;
