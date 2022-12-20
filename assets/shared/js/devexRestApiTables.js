'use strict';

function copyParamsToTableDef(params, tableDef)
{
  if (params.order)
    tableDef.order = params.order;

  tableDef.pageLength = params.pageLength ?? 18;
}

$.fn.devexRestApiCrudTable = function (params) 
{
  assert(typeof params === "object");
  assert(params.hasOwnProperty('columns'));
  assert(params.hasOwnProperty('restServer'));
  assert(params.hasOwnProperty('endpointUri'));

  //add edit/delete icons
  let columnsDef = _.clone(params.columns);
  DevexDataTable.configureDateTimeColumns(columnsDef);

  columnsDef.push(
    {
      // Actions
      targets: -1,
      title: 'Actions',
      orderable: false,
      searchable: false,
      type: 'hidden',
      data: null,
      value: '',
      render: function (data, type, full, meta)
      {
        let before = params.generateButtonsBefore ? params.generateButtonsBefore(data) : [];
        let beforeHtml = before.reduce((prev, cur) => prev + (cur ?? `<span class="btn btn-sm btn-icon"></span>`),'');
        let after = params.generateButtonsAfter ? params.generateButtonsAfter(data) : [];
        let afterHtml = after.reduce((prev, cur) => prev + (cur ?? `<span class="btn btn-sm btn-icon"></span>`), '');
        return (
          beforeHtml + 
          '<a href="javascript:;" class="btn btn-sm btn-icon item-edit edit-record"><i class="bx bxs-edit"></i></a>' +
          '<a href="javascript:;" class="btn btn-sm btn-icon item-duplicate duplicate-record"><i class="bx bx-duplicate"></i></a>' +
          '<a href="javascript:;" class="btn btn-sm btn-icon item-delete delete-record"><i class="bx bx-folder-minus"></i></a>' + 
          afterHtml
        );
      }
    }
  );

  //define table
  let tableDef = {
    columns: columnsDef,
    processing: true,
    ajax: {
      url: params.restServer + params.endpointUri + (params.endpointFilter ?? ''),
      // our data is an array of objects, in the root node instead of /data node, so we need 'dataSrc' parameter
      dataSrc: ''
    },
    dom: '<"card-header flex-column flex-md-row"<"head-label text-center"><"dt-action-buttons text-end pt-3 pt-md-0"B>><"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6 d-flex justify-content-center justify-content-md-end"f>>t<"row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
    buttons: [
      {
        text: '<i class="bx bx-plus me-sm-2"></i> <span class="d-none d-sm-inline-block">Add New Record</span>',
        className: 'create-new btn btn-primary'
      }
    ],
    select: {
      style: 'single',
      toggleable: false
    },
    altEditor: true,
    onAddRow: function (datatable, rowdata, success, error)
    {
      $.ajax({
        contentType: "application/json",
        url: params.restServer + params.endpointUri,
        type: 'PUT',
        data: JSON.stringify(rowdata),
        success: success,
        error: error
      });
    },
    onDeleteRow: function (datatable, rowdata, success, error)
    {
      $.ajax({
        url: params.restServer + params.endpointUri + '/' + rowdata[0].id,
        type: 'DELETE',
        success: success,
        error: error
      });
    },
    onEditRow: function (datatable, rowdata, success, error)
    {
      $.ajax({
        contentType: "application/json",
        url: params.restServer + params.endpointUri + '/' + rowdata.id,
        type: 'PUT',
        data: JSON.stringify(rowdata),
        success: success,
        error: error
      });
    }
  }
  copyParamsToTableDef(params, tableDef);

  let table = this.dataTable(tableDef);
  DevexDataTable.hookAddEditDeleteEvents(table);
  if (params.tableCaption)
    DevexDataTable.setTableCaption(table, params.tableCaption);

  return table;
}


//todo bez edit funkci
$.fn.devexRestApiSummaryTable = function (params) 
{
  assert(typeof params === "object");
  assert(params.hasOwnProperty('columns'));
  assert(params.hasOwnProperty('restServer') || params.hasOwnProperty('url'));
  assert(params.hasOwnProperty('endpointUri') || params.hasOwnProperty('url'));

  //add edit/delete icons
  let columnsDef = _.clone(params.columns);

  //define table
  let tableDef = {
    columns: columnsDef,
    processing: true,
    ajax: {
      url: params.url ?? params.restServer + params.endpointUri,
      // our data is an array of objects, in the root node instead of /data node, so we need 'dataSrc' parameter
      dataSrc: ''
    },
    dom: '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6 d-flex justify-content-center justify-content-md-end"f>><"table-responsive"t><"row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
    altEditor: true
  }
  copyParamsToTableDef(params, tableDef);

  let table = this.dataTable(tableDef);
  if (params.tableCaption)
    DevexDataTable.setTableCaption(table, params.tableCaption);

//hack search to search after first character
 /* $(".dataTables_filter input")
    .unbind() // Unbind previous default bindings
    .bind("input", function (e)
    { // Bind our desired behavior
      // If the length is 3 or more characters, or the user pressed ENTER, search
      if (this.value.length >= 1 || e.keyCode == 13)
      {
        // Call the API search function
        //table.api().search(this.value).draw();
        table.api().search('^' + this.value, true, false).draw();
      }
      // Ensure we clear the search if they backspace far enough
      if (this.value == "")
      {
        table.api().search("").draw();
      }
      return;
    });*/
  /*
$('input[type = search]').on('keyup', function ()
{
  //start check from first character
  //table.api().search('^' + this.value, true, false).draw();
  table.api().search(this.value).draw();
}); */

  return table;
}
