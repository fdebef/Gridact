const colDefs = {
  id: {
    tableHead: "id",
    editable: false,
    sortable: true,
    width: 50,
    hidden: false,
    fnCellClass: "text-center"
  },
  name: {
    cellRender: (v, row) => "xx" + v,
    tableHead: "Name",
    filterEditValue: (newValue, cellValue, row) =>
      newValue.replace(/[{]|[}]|[<]|[>]|[\\]|[/]/g, ""),
    filterEditChar: (char, cellValue, row) =>
      char.match(/[a-zA-ZščřžýáíéóúůďťňĎŇŤŠČŘŽÝÁÍÉÚŮ0-9 ]/),
    editable: true,
    sortable: true,
    width: 200,
    fnCellClass: "text-success", // string | list | function returns string or list
    thClass: "bg-warning" // string
  },
  address: {
    cellRender: v => v,
    tableHead: "Street address",
    editable: true,
    sortable: true,
    width: 200,
    fnCellClass: (cv, rw) => {
      if (cv) {
        if (cv.slice(0, 1) > 5) return "text-primary";
      }
    }
  },
  city: {
    tableHead: "City",
    editable: true,
    sortable: true,
    width: 200,
    fnCellClass: (cv, rwdt) => {
      if (rwdt.id % 2) return "text-success font-weight-bold";
      return undefined;
    }
  },
  volume: {
    tableHead: "Volume",
    editable: true,
    sortable: true,
    width: 100,
    filterEditValue: (newValue, cellValue, row) => {
      console.log(
        "NEW VALUE: ",
        Number.parseInt(newValue),
        newValue !== Number.parseInt(newValue)
      );
      if (newValue !== Number.parseInt(newValue, 0)) {
        console.log("----------------");
        return cellValue;
      } else {
        return newValue;
      }
    },
    filterEditChar: (char, cellValue, row) => char.match(/[0-9]/),
    fnCellClass: (cv, rw) => {
      if (cv < 0) return "bg-danger text-white text-right";
      return "text-right";
    },
    thClass: "font-weight-bold text-warning"
  }
};

export default colDefs;
