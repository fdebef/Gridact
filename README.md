<p align="center"><img width="460" src="./img/GridAct.png"></p>

#Gridact
## Your Excellent React Grid Component


Gridact is React component for displaying large datasets in table supporting

- filtering
- sorting
- paging
    - custom page lengths with initial set
- custom row classes based on row data
- individual columns definitions
    - column name
    - sortable, editable,
    - hidden, width, table head class
    - custom cell rendering (based on cell and row data)
    - custom cell class rendering based on row data
- inline editing with server side processing
    - edit cells
    - add and remove rows
    - custom allowed values and characters
    - error messages

Gridact component is result of my experience working with Microsoft Excel as an user and
[jQuery DataTables](https://datatables.net/), which taught me to love data in JavaScript.
(Big thanks to _Allan Jardine_).

#Basic configuration
The basic configuration is pretty simple. Just import Gridact module and pass data and some configuration:
```javascript
import Gridact from 'gridact'
import React from 'react';

const App = () => {
  const [data, setData] = useState();  
  useEffect(() => {
    yourApi().then(yourData => {
    setData(yourData)}
  )}, [])

  <Gridact    
    data={data}    
    colDefs={tableColsDef}
    wrapperDivClass={['table-responsive', 'col-xl-12']}
    tableClasses={['table', 'table-sm', 'table-striped', 'text-nowrap', 'table-bordered']}
    pagingOptions={[5, 10, 20, 50, 100, 200, 500]} // first = initial, will be always sorted
    // rowClass can be: string (one class), Array (list of Classes),
    // function returning either class string or class list
    // function is passed Row Data
    fnRowClass={(row) => {
      if (row.name_original) {
        if (row.name_original.includes('X')) return 'font-weight-bold text-danger';
        return undefined;
      }
      return undefined;
    }
    }
    serverSideEdit={editData => PostApi('updatetransferdata', editData)
    }
    primaryKey="line_id"
    showFilter
    addRemove
    pageSelector
    pagingSelector
    searchPlaceHolder="Search..."
    onEnterMoveDown={false}
  />
      
```

##Gridact props
###data
Accepted values: _Array of Objects_
```javascript
[{col1: val, col2: val,...}, {col1: val, col2: val,...},...] 
```

###wrapperDivClass
Accepted values: _Array, String_ 
Props is joined to final classNames `classNames=wrapperDivClass.join(' ')`
Final table is wrapped in div - main reason was enabling responsiveness in bootstraps, what requires table's outer div.
For table responsiveness, use at least 'table-responsive col'

###tableClasses
Accepted values: _Array, String_ | undefined
Props is joined to final classNames `classNames=wrapperDivClass.join(' ')`
Best use with boostrap's table classes. E.g. ```['table', 'table-sm', 'table-striped', 'text-nowrap', 'table-bordered']```

###pagingOptions
Accepted values: _Array_ | undefined 
If undefined, default paging is `[10, 20, 50]`

###fnRowClass
AcceptedValues: _String | Array | function | undefined_
String or Array of classNames
If function is provided, it is passed row data. Must return String or Array.
Used for coloring whole row based on row data.

###serverSideEdit
AcceptedValues: _function_

###colDefs
*Column definitions*
Accepted values: _Object_
```line_id: {
    cellRender: v => v,
    name: 'ID',
    editable: false,
    // filterEditValue: function | regexp of chars to filter out (newValue.prototype.replace(regexp, '')
    filterEditValue: (newValue, curCellValue, row) => (newValue.replace(/[{]|[}]|[<]|[>]|[\\]|[/]/g, '')),
    // filterEditValue: function which returns true to allow or false for disable char
    // regexp of chars allowed (newValue.prototype.match(regexp))
    filterEditChar: (char, cellValue, row) => char.match(/[a-zA-ZščřžýáíéóúůďťňĎŇŤŠČŘŽÝÁÍÉÚŮ0-9 ]/g),
    sortable: true,
    filterable: true,
    resizable: true,
    width: 80,
    hidden: false
  }```
