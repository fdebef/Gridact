import checkPageLength from './checkPageLength';

const addRow = ({
  setTableDataAdv,
  tableData,
  serverSideEdit,
  data2,
  setData2,
  setModalWarning,
  activeCell,
  setFilter,
  sortState,
  primaryKey,
}) => {
  serverSideEdit({ operation: 'new' })
    .then((rs) => {
      let parsedRes;
      if (typeof rs === 'string') {
        try {
          // try to parse as JSON
          parsedRes = JSON.parse(rs);
        } catch (e) {
          throw Error(`Not a JSON string ${JSON.stringify(e)}`);
        }
      } else if (typeof rs === 'object') {
        try {
          // try to parse as JSON
          parsedRes = JSON.parse(JSON.stringify(rs));
        } catch (e) {
          throw Error(`Not a valid JSON ${JSON.stringify(e)}`);
        }
      } else throw Error('Not a valid JSON string nor JSON object');
      if (parsedRes.error) {
        setModalWarning(parsedRes.error);
      } else if (parsedRes.data) {
        const primaryKeys = data2.current.map((x) => x[primaryKey]);
        parsedRes.data[primaryKey] = Math.max(...primaryKeys) + 1;

        data2.current.unshift(parsedRes.data);
        setTableDataAdv(data2.current);
        activeCell.current = [0, 0];
        setFilter('');
      }
    })
    .catch((err) => {
      console.log('ERROR: ', err);
      throw Error(err);
    });
};

export default addRow;
