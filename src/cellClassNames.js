const cellClassNames = (userClass, celVal, rwDt) => {
  switch (Object.prototype.toString.call(userClass)) {
    case '[object String]':
      return userClass;
    case '[object Function]':
      return userClass(celVal, rwDt);
    case '[object Array]':
      return userClass.join(' ');
    default:
      return 'defaultCell';
  }
};

export default cellClassNames;
