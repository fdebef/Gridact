


 ##Column definitions:
 ```
    cellRender: (v, row) => v,
    title: true,
    tableHead: 'Id',
    sortable: true,
    filterable: true,
    hidden: false,
    width: 50,
    thClass: undefined,
    fnCellClass: 'FFtext-right',
    fnCellClass: (v, row) => 'iconTableCell',
    editable: false,
    filterEditValue: (newValue, cellValue, row) =>
      newValue.replace(/[{]|[}]|[<]|[>]|[\\]|[/]/g, ''),
    filterEditChar: (char, cellValue, row) =>
      char.match(/[a-zA-ZščřžýáíéěóúůďťňĎŇŤŠČŘŽÝÁÍÉÚŮ0-9 -.,]/),
    whisper: (row) => false,
    whisperApi: (sData) => {
```

whisper: Boolean or functions returning Boolean, argument is Row 
celLRender: (v, row) => v
