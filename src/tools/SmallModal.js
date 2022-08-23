import React, { useEffect, useState } from 'react';
import { Transition } from 'react-transition-group';

const SmallModal = ({
  setShowSelf,
  timeout = 2000,
  children,
  mLeft,
  mTop,
  mWidth = 150,
  mHeight = 30,
  modalClassName = 'moverlay',
}) => {
  const [animStatus, setAnimStatus] = useState('exited');

  useEffect(() => {
    setTimeout(() => setAnimStatus('entering'), 10);
    if (timeout) {
      setTimeout(() => {
        setAnimStatus('exiting');
        setTimeout(() => setShowSelf(false), 1000);
      }, timeout);
    }
  }, [setShowSelf, timeout]);

  let modLeft = 0;
  let modTop = 0;

  modLeft =
    mLeft + mWidth > window.innerWidth
      ? (modLeft = window.innerWidth - mWidth)
      : mLeft;
  modTop =
    mTop + mHeight > window.innerHeight
      ? (modTop = window.innerHeight - mHeight)
      : mTop;

  const modalStyle = {
    top: modTop,
    left: modLeft,
    zIndex: '5000',
    width: mWidth,
    height: mHeight,
  };

  const defaultStyle = {
    transition: `opacity 800ms`,
    opacity: 0,
  };

  const transitionStyles = {
    entering: { opacity: 1 },
    entered: { opacity: 1 },
    exiting: { opacity: 0 },
    exited: { opacity: 0 },
  };

  return (
    <div
      className={modalClassName}
      style={{
        ...modalStyle,
        ...defaultStyle,
        ...transitionStyles[animStatus],
      }}
    >
      {children}
    </div>
  );
};

export default SmallModal;
