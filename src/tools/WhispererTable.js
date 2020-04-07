import React, { useEffect, useState, useRef } from 'react';
import './whisperStyle.css';

const KEY_UP = 38;
const KEY_DOWN = 40;
const KEY_LEFT = 37;
const KEY_RIGHT = 39;
const KEY_RETURN = 13;
const KEY_ENTER = 14;
const KEY_ESCAPE = 27;
const KEY_TAB = 9;
const ROW_HEIGHT = 25;

const WhispererTable = ({
  whisperData, setWhisperData, inputRef, activeRow, setActiveRow,
  setFinalData
}) => {
  const [whisperPos, setWhisperPos] = useState({ x: null, y: null, h: null });
  const [transY, setTransY] = useState(0);
  const tableDivRef = useRef();
  const rowRefs = useRef({});
  const tableRef = useRef(null);
  const scrollRef = useRef(0);

  useEffect(() => {
    if (inputRef.current) {
      setWhisperPos({
        x: inputRef.current.getBoundingClientRect().left,
        y: inputRef.current.getBoundingClientRect().top,
        h: inputRef.current.getBoundingClientRect().height
      });
    }
  }, [inputRef]);


  useEffect(() => {
    if (activeRow != null) {
      const divRect = tableDivRef.current.getBoundingClientRect();
      const divElemTop = divRect.top;
      const divElemBottom = divRect.bottom;
      const rowRect = rowRefs.current[activeRow].getBoundingClientRect();
      const rowElemTop = rowRect.top - scrollRef.current;
      const rowElemBottom = rowRect.bottom - scrollRef.current;
      if (rowElemTop < divElemTop) {
        rowRefs.current[activeRow].scrollIntoView(true);
        if (scrollRef.current <= ROW_HEIGHT) scrollRef.current = 0;
      } else if (rowElemBottom > divElemBottom) {
        rowRefs.current[activeRow].scrollIntoView(false);
      } else {
        tableDivRef.current.scrollTop = scrollRef.current;
      }
    }
  }, [activeRow]);
  const wTblPositionStyle = {
    position: 'absolute',
    left: whisperPos.x,
    top: whisperPos.y + whisperPos.h,
    overflowY: 'auto',
    height: '376px',
    display: 'grid',
    gridTemplateColumns: 'auto',
    zIndex: 1000
  };

  const handleClick = (e, i) => {
    console.log('HANDLING CLICK: ', whisperData[i])
    setFinalData(whisperData[i]);
    setWhisperData([]);
  };

  const WhTbl = ({ wd }) => (
    <div
      role="button"
      tabIndex={0}
      style={wTblPositionStyle}
      ref={tableDivRef}
      onScroll={(r) => {
        scrollRef.current = tableDivRef.current.scrollTop;
      }
      }
    >
      <table
        role="grid"
        className="whTable"
        ref={tableRef}
      >
        <tbody>
          {wd.map((rw, i) => (
            <tr
              className={(i === activeRow) ? 'focused' : ''}
              key={Object.values(rw).join()}
              tabIndex={0}
              onClick={(e) => {
                e.preventDefault();
                handleClick(e, i);
              }}
              ref={(r) => {
                rowRefs.current[i] = r;
              }}
            >
              {Object.values(rw).map((v, ix) => (
                <td
                  key={ix}
                  style={{
                    paddingRight: '10px',
                    maxWidth: '300px',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {v}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const whisperStyle = {
    positiwhon: 'absolute',
    left: whisperPos.x,
    top: whisperPos.y
  };

  // if (!document.getElementById('whisperEl')) {
  //   const modEl = document.createElement('div');
  //   modEl.id = 'whisperEl';
  //   document.body.appendChild(modEl);
  // }
  // return whisperDiv, document.getElementById('whisperEl'));

  return (
    <div
      style={whisperStyle}
    >
      <WhTbl wd={whisperData} />
    </div>
  );
};

export default WhispererTable;
