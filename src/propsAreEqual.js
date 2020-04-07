const propsAreEqual = (prev, act) => {
  const prevPropType = Object.prototype.toString.call(prev);
  const actPropType = Object.prototype.toString.call(act);
  if (prevPropType === actPropType) {
    switch (Object.prototype.toString.call(prev)) {
      case '[object String]':
        return prev === act;
      case '[object Number]':
        return prev === act;
      case '[object Boolean]':
        return prev === act;
      case '[object Undefined]':
        // both are Undefined, no need further testing
        return true;
      case '[object Null]':
        // both are null, no need further testing
        return true;
      case '[object Array]':
        // first must be same length
        if (prev.length !== act.length) {
          return false;
        }
        // further compare all items in Array, order is important
        // eslint-disable-next-line no-case-declarations
        const arrComp = prev.map((p, i) => propsAreEqual(p, act[i]));
        return arrComp.every(n => n);
      case '[object Object]':
        // if includes $$typeof >> is Component with circular, compare only props
        if (Object.keys(prev).includes('$$typeof')) {
          return propsAreEqual(prev.prop, act.prop);
        }
        // if not circular, compare keys and if equal compare actual props
        if (propsAreEqual(Object.keys(prev), Object.keys(act))) {
          return propsAreEqual(Object.values(prev), Object.values(act));
        }
        return false;
      case '[object Function]':
        return prev.toString() === act.toString();
      default:
        return false;
    }
  } else {
    return false;
  }
};

export default propsAreEqual;
