const removeRow = ({
  e,
  activeCell,
  addRemove,
  pageData,
  serverSideEdit,
  data2,
  setData2,
  primaryKey,
  tableData,
  setTableDataAdv,
  setModalWarning,
}) => {
  // prepare deleted data with primaryKey
  if (
    !(activeCell.current[0] >= 0) ||
    !(activeCell.current[1] >= 0) ||
    !addRemove
  )
    return null;
  const delData = { ...pageData[activeCell.current[1]] };
  const deletedDataKey = delData.gridactPrimaryKey;
  delete delData.gridactPrimaryKey;
  return serverSideEdit({ operation: 'delete', row: delData })
    .then((rs) => {
      let parsedRes;
      if (typeof rs === 'string') {
        try {
          // try to parse as JSON
          parsedRes = JSON.parse(rs);
        } catch (er) {
          throw Error(`Not a JSON string ${JSON.stringify(er)}`);
        }
      } else if (typeof rs === 'object') {
        try {
          // try to parse as JSON
          parsedRes = JSON.parse(JSON.stringify(rs));
        } catch (er) {
          throw Error(`Not a valid JSON ${JSON.stringify(er)}`);
        }
      } else throw Error('Not a valid JSON string nor JSON object');
      if (!parsedRes.error) {
        if (parsedRes.data === 1) {
          const idxOfDeletedRow = data2.current
            .map((rw) => rw[primaryKey])
            .indexOf(deletedDataKey);
          data2.current.splice(idxOfDeletedRow, 1);
          setTableDataAdv(data2.current);
          // calculate new pageActual - you can delete last item on page
          // before changing data2 - 1
        } else {
          // TODO: add modal error
        }
      } else {
        setModalWarning(parsedRes.error);
      }
    })
    .catch((err) => {
      throw Error(err);
    });
};
export default removeRow;
