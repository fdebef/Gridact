// --------------------------------------------------------------------------
// Update data without re-rendering table
// data in table are updated on row-base, so there is no need
// re-render whole table.
// But for further operations (paging, sorting, filtering)
// must be the actual data prepared.

const fnUpdateDataOnEditWithoutRender = (
  newRow,
  data2,
  setData2,
  primaryKey
) => {
  const idxOfUpdatedRowInData2 = data2
    .map((rw) => rw[primaryKey])
    .indexOf(newRow[primaryKey]);
  console.log(
    'ooooooooooooooooooooooooooooooooooo',
    data2[idxOfUpdatedRowInData2]
  );
  const updatedRow = { ...data2[idxOfUpdatedRowInData2], ...newRow };
  setData2((p) => {
    p.splice(idxOfUpdatedRowInData2, 1, updatedRow);
    return p;
  });
};

export default fnUpdateDataOnEditWithoutRender;
