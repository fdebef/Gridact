import ReactDOM from 'react-dom';
import React, { useEffect } from 'react';

const CellModalWarning = ({ show, children, cellRef, x, y }) => {
  let modLeft = 0;
  let modTop = 0;

  useEffect(
    () => () => {
      const modEl = document.getElementById('cellModalEl');
      modEl.remove();
    },
    []
  );

  if (!cellRef.current) return null;
  modLeft = cellRef.current.getBoundingClientRect().left + 10;
  modTop = cellRef.current.getBoundingClientRect().top + 25;
  modLeft =
    modLeft + 160 > window.innerWidth
      ? (modLeft = window.innerWidth - 160)
      : modLeft;
  modTop =
    modTop + 40 > window.innerHeight
      ? (modTop = window.innerHeight - 40)
      : modTop;

  const modalStyle = {
    display: 'grid',
    alignItems: 'center',
    justifyContent: 'center',
    top: modTop,
    left: modLeft,
  };
  const modalDiv = (
    <div
      key={`modaldiv-${String(y)}-${String(x)}`}
      className="moverlay"
      style={modalStyle}
    >
      {children}
    </div>
  );

  const modEl = document.createElement('div');
  modEl.id = 'cellModalEl';
  document.body.appendChild(modEl);
  return (
    show &&
    ReactDOM.createPortal(modalDiv, document.getElementById('cellModalEl'))
  );
};

export default CellModalWarning;
