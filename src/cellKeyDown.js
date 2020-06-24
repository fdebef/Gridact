const serverUpdate = (newCellValue) => {
  const operData = {};
  operData[col] = newCellValue;
  operData[primaryKey] = row[primaryKey]; // data for server must be in {line_id: 12932, some_col: 'new value'}
  const dataToSend = { operation: 'edit', data: operData };
  return new Promise((resolve, reject) => {
    serverSideEdit(dataToSend)
      .then((rs) => {
        // successfull return
        let parsedRes;
        if (typeof rs === 'string') {
          try {
            // try to parse as JSON
            parsedRes = JSON.parse(rs);
          } catch (e) {
            reject('Not a JSON string');
          }
        } else if (typeof rs === 'object') {
          try {
            // try to parse as JSON
            parsedRes = JSON.parse(JSON.stringify(rs));
          } catch (e) {
            reject('Not valid JSON');
          }
        } else reject('Not a valid JSON string nor JSON object');
        const redefRow = {}; // prepare redefined row
        if (!parsedRes.error) {
          // if in response is not {error: 'some error'
          const dataResp = parsedRes.data;
          Object.keys(colDefs).forEach((c) => {
            // iterate over colDefs
            redefRow[c] = dataResp[c]; // take only cols in colDefs
          });
          resolve(redefRow); // return redefined new Row
        }
        reject(parsedRes.error); // if error in response
      })
      .catch((err) => {
        reject(`API ERROR${JSON.stringify(err)}`);
      });
  });
};
