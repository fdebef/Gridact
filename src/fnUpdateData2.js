const fnUpdateData2 = (newRow, row, data2, setData2, primaryKey) => {
  setData2((pData2) => {
    const idxOfUpdatedRowInData2 = pData2
      .map((rw) => rw[primaryKey])
      .indexOf(row[primaryKey]);

    // updatedRow takes old row (pData2 with index) and is merged with newRow
    // this way is the gridactPrimaryKey preserved
    const updatedRow = { ...pData2[idxOfUpdatedRowInData2], ...newRow };
    const newData2 = pData2.slice();
    newData2.splice(idxOfUpdatedRowInData2, 1, updatedRow);
    return newData2;
  });
};

export default fnUpdateData2;
