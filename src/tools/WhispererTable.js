import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
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

const WhispererTable = function ({
  whisperData,
  setWhisperData,
  inputRef,
  activeRow,
  setActiveRow,
  setFinalData,
  selectedData,
}) {
  const [whisperPos, setWhisperPos] = useState({ x: null, y: null, h: null });
  const rowRefs = useRef({});
  const tableRef = useRef(null);
  const scrollRef = useRef(0);

  useLayoutEffect(() => {
    if (inputRef.current) {
      setWhisperPos({
        x: inputRef.current.getBoundingClientRect().left,
        y: inputRef.current.getBoundingClientRect().top,
        h: inputRef.current.getBoundingClientRect().height,
      });
    }
  }, [inputRef]);

  useLayoutEffect(() => {
    if (activeRow != null) {
      const divRect = inputRef.current.getBoundingClientRect();
      const divElemTop = divRect.top;
      const divElemBottom = divRect.bottom;
      const rowRect = rowRefs.current[activeRow].getBoundingClientRect();
      const rowElemTop = rowRect.top - scrollRef.current;
      const rowElemBottom = rowRect.bottom - scrollRef.current;
      if (rowElemTop < divElemTop) {
        rowRefs.current[activeRow].scrollIntoView(true);
        if (scrollRef.current <= ROW_HEIGHT) {
          scrollRef.current = 0;
        }
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
    overflowY: 'hidden',
    overflowX: 'hidden',
    maxHeight: '200px',
    display: 'grid',
    gridTemplateColumns: 'auto',
    zIndex: 1000,
  };

  const handleClick = (e, i) => {
    e.preventDefault();
    selectedData.current = whisperData[i];
    // hide whisper table
    setWhisperData([]);
    setActiveRow(null);
    setFinalData(selectedData.current);
  };

  const WhTbl = ({ wd }) => {
    return (
      <div
        id="whisperTableContainer"
        role="button"
        tabIndex={0}
        style={wTblPositionStyle}
        onScroll={(r) => {
          scrollRef.current = inputRef.current.scrollTop;
        }}
      >
        <table role="grid" className="whTable" ref={tableRef}>
          <tbody>
            {wd.map((rw, i) => (
              <tr
                className={i === activeRow ? 'focused' : ''}
                key={Object.values(rw).join()}
                tabIndex={0}
                onMouseDown={(e) => {
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
                      maxWidth: '150px',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {v ? v.slice(0, 40) : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const whisperStyle = {
    position: 'absolute',
    left: whisperPos.x,
    top: whisperPos.y,
  };

  // if (!document.getElementById('whisperEl')) {
  //   const modEl = document.createElement('div');
  //   modEl.id = 'whisperEl';
  //   document.body.appendChild(modEl);
  // }
  // return whisperDiv, document.getElementById('whisperEl'));

  return <WhTbl wd={whisperData} />;
};
export default WhispererTable;
