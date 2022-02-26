const colDefs = {
  columnName: {
    cellRender: (v, row) => v,
    tableHead: 'Column description',
    sortable: true,
    filterable: true,
    hidden: false,
    width: 80,
    title: true, // or (value,row) => return (value)
    thClass: undefined,
    fnCellClass: (v, row) => ['FFtext-center'], // can be function or list or string
    // edit part
    editable: false,
    filterEditValue: (newValue, cellValue, row) =>
      newValue.replace(/[{]|[}]|[<]|[>]|[\\]|[/]/g, ''),
    filterEditChar: (char, cellValue, row) =>
      char.match(/[a-zA-ZščřžýáíéěóúůďťňĎŇŤŠČŘŽÝÁÍÉÚŮ0-9 -.,]/),
    // whisper part
    whisper: false,
    whisperApi: (sData) => {},
  },
};

module.exports = colDefs;
