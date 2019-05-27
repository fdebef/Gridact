import React from 'react';

const cols = {
  line_id: {
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
  },
  pdk: {
    cellRender: (v, row) => v,
    name: 'PDK',
    editable: true,
    sortable: true,
    filterable: true,
    resizable: true,
    width: 80,
    cellClass: 'text-left', // string | list | function returns string or list
    thClass: 'text-primary' // string
  },
  name_pdk: {
    cellRender: v => v,
    filterEditValue: (newValue, cellValue, row) => (newValue.replace(/[{]|[}]|[<]|[>]|[\\]|[/]/g, '')),
    filterEditChar: (char, cellValue, row) => (char.match(/[a-zA-ZščřžýáíéóúůďťňĎŇŤŠČŘŽÝÁÍÉÚŮ0-9 ]/)),
    name: 'Název PDK',
    editable: true,
    sortable: true,
    filterable: true,
    resizable: true,
    width: 200
  },
  name_original: {
    name: 'Název původní',
    editable: true,
    sortable: true,
    filterable: true,
    resizable: true,
    width: 200,
    cellClass: (rwdt) => {
      if (rwdt.spoh > 8) return 'text-success font-weight-bold';
      return undefined;
    }
  },
  note: {
    name: 'Poznámka',
    editable: true,
    sortable: true,
    filterable: true,
    resizable: true,
    width: 200
  },
  spoh: {
    cellRender: v => v,
    name: 'SPOH',
    editable: true,
    sortable: true,
    filterable: true,
    resizable: true,
    width: 40,
    class: 'text-right'
  },
  ppoh: {
    cellRender: v => v,
    name: 'PPOH',
    editable: false,
    sortable: true,
    filterable: true,
    resizable: true,
    width: 40
  },
  npoh: {
    cellRender: v => v,
    name: 'NPOH',
    editable: false,
    sortable: true,
    filterable: true,
    resizable: true,
    width: 40
  },
  opoh: {
    cellRender: v => v,
    name: 'OPOH',
    editable: false,
    sortable: true,
    filterable: true,
    resizable: true,
    width: 40
  },
  sklb: {
    cellRender: v => v,
    name: 'SKLB',
    editable: false,
    sortable: true,
    filterable: true,
    resizable: true,
    width: 40,
    cellClass: 'text-right',
    thClass: 'text-left'
  },
  pklb: {
    cellRender: v => v,
    name: 'PKLB',
    editable: false,
    sortable: true,
    filterable: true,
    resizable: true,
    width: 40
  },
  nklb: {
    cellRender: v => v,
    name: 'NKLB',
    editable: false,
    sortable: true,
    filterable: true,
    resizable: true,
    width: 40
  },
  oklb: {
    cellRender: v => v,
    name: 'OKLB',
    editable: false,
    sortable: true,
    filterable: true,
    resizable: true,
    width: 40
  }
};

export default cols;
