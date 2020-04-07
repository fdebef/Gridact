import React, { useRef, useState, useEffect } from 'react';
import WhispererTable from './WhispererTable';
import './whisperStyle.css';
import setEndOfContentEditable from './setEndOfContentEditable';

const KEY_UP = 38;
const KEY_DOWN = 40;
const KEY_LEFT = 37;
const KEY_RIGHT = 39;
const KEY_RETURN = 13;
const KEY_ENTER = 14;
const KEY_ESCAPE = 27;
const KEY_TAB = 9;

const FUNCTION_KEYS = [
  KEY_UP, KEY_DOWN, KEY_LEFT, KEY_RIGHT, KEY_RETURN, KEY_ENTER, KEY_ESCAPE, KEY_TAB
];

const WhispererInput = ({
  children, keyTimeOut, setFinalData, whisperApi, whisperTextKey, divStyle
}) => {
  const [whisperData, setWhisperData] = useState([]);
  const selectedData = useRef({ });
  const [activeRow, setActiveRow] = useState(null);

  const decodeInnerHtml = (innerText) => {
    const parser = new DOMParser();
    const dom = parser.parseFromString(
      `<!doctype html><body>${innerText}`,
      'text/html'
    );
    return dom.body.textContent;
  };

  const getWhisperData = async () => {
    if (children.ref.current) {
      if (children.ref.current.innerText.length > 3) {
        setEndOfContentEditable(children.ref.current);
        try {
          const wDataFromUser = await whisperApi({ sstring: children.ref.current.innerText.replace(String.fromCharCode(160), ' ') });
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
    if (e.ctrlKey || e.altKey || e.metaKey || (e.key === 'Home') || (e.key === 'End') || (e.key === 'Shift')) {
      console.log('DOING NOTHING: ');
      return;
    }
    // whisper table visible, no data selected
    if (whisperData.length && activeRow === null) {
      switch (e.keyCode) {
        case (KEY_TAB):
          e.preventDefault();
          setActiveRow(0);
          break;
        case (KEY_DOWN):
          setActiveRow(0);
          break;
        case KEY_RETURN:
          e.preventDefault();
          setWhisperData([]);
          setEndOfContentEditable(children.ref.current);
          break;
        case (KEY_ESCAPE):
          setActiveRow(null);
          e.preventDefault();
          setWhisperData([]);
          // children.ref.current.focus();
          setEndOfContentEditable(children.ref.current);
          break;
        default:
          break;
      }
    // whisper table visible, some row selected
    } else if (whisperData.length && activeRow !== null) {
      switch (e.keyCode) {
        case (KEY_DOWN):
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
          // if (Object.keys(children.ref.current).includes('value')) {
          //   // eslint-disable-next-line no-param-reassign
          //   children.ref.current.value = selectedData.current[whisperTextKey];
          // } else {
          //   // eslint-disable-next-line no-param-reassign
          //   children.ref.current.innerHTML = selectedData.current[whisperTextKey];
          // }
          setFinalData(selectedData.current);
          setEndOfContentEditable(children.ref.current);
          break;
        case (KEY_ESCAPE):
          setActiveRow(null);
          e.preventDefault();
          setWhisperData([]);
          // children.ref.current.focus();
          setEndOfContentEditable(children.ref.current);
          break;
        default:
          break;
      }
    } else if (!whisperData.length && Object.keys(selectedData.current).length) {
      if (e.keyCode === KEY_RETURN) {
        e.preventDefault();
        const sd = selectedData.current;
        setFinalData(sd);
        selectedData.current = {};
        setEndOfContentEditable(children.ref.current);
      }
    }
    // original Element Handle is children.props.onKeyDown
    // here we add it to special chain of functions
    if (!whisperData.length && !Object.keys(selectedData.current).length && origElemHandle) {
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

  const whisperingChild = React.cloneElement(children, {
    ...children.props,
    onKeyDown: (e) => {
      // add special action to onKeyDown with handleInput fn
      handleInput(e, children.props.onKeyDown);
    },
    style: { ...divStyle, fontStyle: 'italic' },
    // children: selectedData.current[whisperTextKey] || children.props.children
  });

  return (
    <div>
      {whisperingChild}
      {Boolean(whisperData.length)
      && (
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
