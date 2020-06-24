import React, { useRef, useState, useEffect } from 'react';
import WhispererTable from './WhispererTable';
import './whisperStyle.css';

const KEY_UP = 38;
const KEY_DOWN = 40;
const KEY_LEFT = 37;
const KEY_RIGHT = 39;
const KEY_RETURN = 13;
const KEY_ENTER = 14;
const KEY_ESCAPE = 27;
const KEY_TAB = 9;

const FUNCTION_KEYS = [
  KEY_UP,
  KEY_DOWN,
  KEY_LEFT,
  KEY_RIGHT,
  KEY_RETURN,
  KEY_ENTER,
  KEY_ESCAPE,
  KEY_TAB,
];

const WhispererInput = ({
  children,
  keyTimeOut,
  setFinalData,
  whisperApi,
  divStyle,
}) => {
  const [whisperData, setWhisperData] = useState([]);
  const selectedData = useRef({});
  const [activeRow, setActiveRow] = useState(null);

  const getWhisperData = async () => {
    if (children.ref.current) {
      if (children.ref.current.value.length > 3) {
        try {
          const wDataFromUser = await whisperApi({
            sstring: children.ref.current.value.replace(
              String.fromCharCode(160),
              ' '
            ),
          });
          setActiveRow(null);
          setWhisperData(JSON.parse(wDataFromUser).data);
        } catch (er) {
          console.log('ERROR GETTING WHISPER DATA: ', er);
        }
      } else {
        setWhisperData([]);
      }
    }
  };

  let timeout;

  const handleInput = (e, origElemHandle) => {
    if (
      e.ctrlKey ||
      e.altKey ||
      e.metaKey ||
      e.key === 'Home' ||
      e.key === 'End' ||
      e.key === 'Shift'
    ) {
      console.log('DOING NOTHING: ');
      return;
    }
    // whisper table visible, no data selected
    if (whisperData.length && activeRow === null) {
      switch (e.keyCode) {
        case KEY_TAB:
          e.preventDefault();
          setActiveRow(0);
          break;
        case KEY_DOWN:
          setActiveRow(0);
          break;
        case KEY_RETURN:
          e.preventDefault();
          setWhisperData([]);
          break;
        case KEY_ESCAPE:
          console.log('EXCAPE PRASSED');
          e.preventDefault();
          setActiveRow(null);
          setWhisperData([]);
          break;
        default:
          break;
      }
      // whisper table visible, some row selected
    } else if (whisperData.length && activeRow !== null) {
      switch (e.keyCode) {
        case KEY_DOWN:
          e.preventDefault();
          setActiveRow((p) => {
            if (p >= whisperData.length - 1) return p;
            return p + 1;
          });
          break;
        case KEY_UP:
          e.preventDefault();
          setActiveRow((p) => {
            if (p <= 0) {
              return null;
            }
            return p - 1;
          });
          break;
        case KEY_RETURN:
          e.preventDefault();
          selectedData.current = whisperData[activeRow];
          // hide whisper table
          setWhisperData([]);
          setActiveRow(null);
          setFinalData(selectedData.current);
          break;
        case KEY_ESCAPE:
          setActiveRow(null);
          e.preventDefault();
          setWhisperData([]);
          // children.ref.current.focus();
          break;
        default:
          break;
      }
    } else if (
      !whisperData.length &&
      Object.keys(selectedData.current).length
    ) {
      if (e.keyCode === KEY_RETURN) {
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
    if (!FUNCTION_KEYS.includes(e.keyCode)) {
      console.log();
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      timeout = setTimeout(getWhisperData, keyTimeOut);
    }
  };

  console.log('THIS IS CHILDREN PRPS: ', children.props);

  const whisperingChild = React.cloneElement(children, {
    ...children.props,
    onKeyDown: (e) => {
      // add special action to onKeyDown with handleInput fn
      handleInput(e, children.props.onKeyDown);
    },
    style: { ...divStyle, fontStyle: 'italic' },
  });

  return (
    <div style={{ width: '100%', display: 'grid' }}>
      {whisperingChild}
      {Boolean(whisperData.length) && (
        <WhispererTable
          whisperData={whisperData.slice(0, 100)}
          setWhisperData={setWhisperData}
          inputRef={children.ref}
          activeRow={activeRow}
          setActiveRow={setActiveRow}
          setFinalData={setFinalData}
        />
      )}
    </div>
  );
};

export default WhispererInput;
