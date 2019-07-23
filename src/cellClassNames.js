const cellClassNames = (userClass, celVal, rwDt) => {
  if (!userClass) return undefined;
  if (typeof userClass === 'string') return userClass;
  if (Array.isArray(userClass)) return userClass.join(' ');
  if (typeof userClass === 'function') {
    const calcClass = userClass(celVal, rwDt);
    if (!calcClass) return undefined;
    if (typeof calcClass === 'string') return calcClass;
    if (Array.isArray(calcClass)) return calcClass.join(' ');
  }
  return undefined;
};


export default cellClassNames;
