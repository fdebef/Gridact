const serverUpdate = (dataToSend, colDefs, serverSideEdit) =>
  new Promise((resolve, reject) => {
    try {
      // remove gridactPrimaryKey, which is not user data
      // and therefore is not sent to the srever
      delete dataToSend.row.gridactPrimaryKey;
    } catch (e) {}
    // serverSideEdit is user function which returns new data
    serverSideEdit(dataToSend)
      .then((rs) => {
        // successfull return
        let parsedRes;

        // processing response from server
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
        if (!parsedRes.error) {
          // if in response is not {error: 'some error'
          resolve(parsedRes.data); // return redefined new Row
        }
        reject(parsedRes.error); // if error in response
      })
      .catch((err) => {
        console.log('API ERROR: ', err);
        reject(`API ERROR: ${JSON.stringify(err)}`);
      });
  });

export default serverUpdate;
