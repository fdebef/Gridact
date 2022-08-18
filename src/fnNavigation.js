// --------------------------------------------------------------------------
// fnNavigation calculates new coordinates
// and sets focus to calculated cell - based on ref in store
const navigation = (
  keyCode,
  activeCell,
  fnGetActiveCell,
  fnSetActiveCell,
  fnGetRef,
  onEnterMoveDown,
  pageData,
  colDefs
) => {
  // --------------------------------------------------------------------------
  // number of cols and rows for navigation (not to go outside table
  let colRowsCount;
  if (pageData.length) {
    colRowsCount = [
      Object.keys(colDefs).filter((k) => !k.hidden).length,
      pageData.length,
    ];
  }

  let [calcX, calcY] = fnGetActiveCell();
  const [xCount, yCount] = colRowsCount; // number of columns and rows
  if (keyCode === 'move_next') {
    keyCode = onEnterMoveDown ? 'ArrowDown' : 'ArrowRight';
  }
  switch (keyCode) {
    case 'ArrowUp': // up
      calcY = calcY - 1 > 0 ? calcY - 1 : 0;
      break;
    case 'ArrowDown': // down
      calcY = calcY + 1 < yCount - 1 ? calcY + 1 : yCount - 1;
      break;
    case 'ArrowLeft': // left
      calcX = calcX - 1 > 0 ? calcX - 1 : 0;
      break;
    case 'ArrowRight': // right
      calcX = calcX + 1 < xCount - 1 ? calcX + 1 : xCount - 1;
      break;
    case 'Tab': // right (TAB)
      calcX = calcX + 1 < xCount - 1 ? calcX + 1 : xCount - 1;
      break;
    case 'PageUp': // pgUp
      calcY = 0;
      break;
    case 'PageDown': // pgDn
      calcY = yCount - 1;
      break;
    case 'Home': // Home
      calcX = 0;
      break;
    case 'End': // End
      calcX = xCount - 1;
      break;
    default:
      break;
  }
  fnSetActiveCell([calcX, calcY]);
  fnGetRef(calcX, calcY).current.focus();
};
export default navigation;
