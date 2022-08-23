import React, { useEffect, useRef, useState } from 'react';
import WhispererInput from './tools/WhispererInput';

const WhisperingEditingDiv = function ({
  additionalWhisperData,
  keyDnEditWhisper,
  fnOnBlur,
  inputEditValue,
  setInputEditValue,
  setWhisperedData,
  colDefs,
  col,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  return (
    <WhispererInput
      keyTimeOut="1000"
      setFinalData={setWhisperedData}
      whisperApi={colDefs[col].whisperApi}
      additionalWhisperData={additionalWhisperData}
      divStyle={{
        outline: 'none',
        fontSize: '1em',
        paddingLeft: 0,
        border: 0,
        width: '100%',
        background: 'rgba(0,0,0,0)',
        caretColor: 'auto',
      }}
    >
      <input
        type="text"
        ref={inputRef}
        onKeyDown={keyDnEditWhisper}
        value={inputEditValue}
        onChange={(e) => setInputEditValue(e.target.value)}
        onBlur={() => {
          fnOnBlur(inputEditValue);
        }}
      />
    </WhispererInput>
  );
};

export default WhisperingEditingDiv;
