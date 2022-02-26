import ReactDOM from 'react-dom';
import React, { useEffect, useRef } from 'react';

const CellModalWarning = ({
  show,
  children,
  cellRef,
  x = 150,
  y = 30,
  setShow = () => {},
}) => {
  let modLeft = 0;
  let modTop = 0;

  useEffect(
    () => () => {
      const modEl = document.getElementById('cellModalEl');
      modEl.remove();
    },
    []
  );

  const modalRef = useRef();

  useEffect(() => {
    modalRef.current.addEventListener('click', () => setShow(''));
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        setShow('');
      }
    });
    window.addEventListener('click', () => setShow(''));
  }, [setShow]);

  if (!cellRef.current) return null;
  modLeft = cellRef.current.getBoundingClientRect().left + 10;
  modTop = cellRef.current.getBoundingClientRect().top + 25;
  modLeft =
    modLeft + (x + 10) > window.innerWidth
      ? (modLeft = window.innerWidth - (x + 10))
      : modLeft;
  modTop =
    modTop + (y + 10) > window.innerHeight
      ? (modTop = window.innerHeight - (y + 10))
      : modTop;

  const modalStyle = {
    display: 'grid',
    alignItems: 'center',
    justifyContent: 'center',
    top: modTop,
    left: modLeft,
    cursor: 'pointer',
    width: `${x}px`,
    height: `${y}px`,
  };
  const modalDiv = (
    <div
      key={`modaldiv-${String(y)}-${String(x)}`}
      className="moverlay"
      style={modalStyle}
      ref={modalRef}
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
