'use strict';


//Nefunguje ;-(
/** turn on/of searchable columns */
$.fn.dataTable.Api.register("isColumnSearchable()", function (name)
{
	var idx = typeof name == 'number' ? name : this.column(name + ":name").index();
	return this.settings()[0].aoColumns[idx].bSearchable;
});

$.fn.dataTable.Api.register("setColumnSearchable()", function (name, value)
{
	var idx = typeof name == 'number' ? name : this.column(name + ":name").index();
	this.settings()[0].aoColumns[idx].bSearchable = value;
	return value;
});

/**
 * Format values
 */
$.fn.dataTable.format = new Object();
$.fn.dataTable.format.dateFormat = 'YYYY-MM-DD';
$.fn.dataTable.format.datetimeFormat = 'YYYY-MM-DD hh:mm';

$.fn.dataTable.format.datePickerFormat = {
	timepicker: false,
	format: "Y-m-d",
	formatDate: "Y-m-d",
	formatTime: 'H:i',
	dayOfWeekStart: 1,
};
$.fn.dataTable.format.datetimePickerFormat = {
	timepicker: true,
	format: "Y-m-d H:i",
	formatDate: "Y-m-d",
	formatTime: 'H:i',
	dayOfWeekStart: 1,
};

/**
 * dataTable format functions
 * https://editor.datatables.net/examples/dates/formatting-client.html
 */
$.fn.dataTable.render.datetimeFormat = function (d, type, row)
{
	if (!d || d == '0000-00-00 00:00:00' || d == '0000-00-00')
		return type === 'sort' || type === 'type' ? 0 : '-';

	// Order and type get a number value from Moment, everything else sees the rendered value
	return window.moment(d).format(type === 'sort' || type === 'type' ? 'x' : $.fn.dataTable.format.datetimeFormat);
};
$.fn.dataTable.render.dateTimeFormat = $.fn.dataTable.render.datetimeFormat;

$.fn.dataTable.render.dateFormat = function (d, type, row)
{
	if (!d || d == '0000-00-00 00:00:00' || d == '0000-00-00')
		return type === 'sort' || type === 'type' ? 0 : '-';

	// Order and type get a number value from Moment, everything else sees the rendered value
	return window.moment(d).format(type === 'sort' || type === 'type' ? 'x' : $.fn.dataTable.format.dateFormat);
};

/**
	Data tables helper/encapsuler
*/
class DevexDataTable
{
	static setTableCaption(dataTable, caption)
	{
		$(dataTable).parent().children('div.card-header').children('div.head-label').html('<h5 class="card-title mb-0">' + caption + '</h5>');
	}

	static hookAddEditDeleteEvents(jqueryTable)
	{
		var htmlTable = jqueryTable[0];
		var dataTable = jqueryTable.DataTable();

		// Add Record
		jqueryTable.siblings('.card-header').find('.create-new').on('click', function () 
		{
			DevexDataTable.openAddModal(htmlTable);
		});

		// Delete Record
		jqueryTable.on('click', '.delete-record', function () 
		{
			var thisRow = $(this).closest('tr');
			var thisDataRow = dataTable.row(thisRow[0]);
			thisDataRow.select();

			DevexDataTable.openDeleteModal(htmlTable);
		});

		// Edit record
		jqueryTable.on('click', '.edit-record', function () 
		{
			var thisRow = $(this).closest('tr');
			var thisDataRow = dataTable.row(thisRow[0]);
			thisDataRow.select();

			DevexDataTable.openEditModal(htmlTable);
		});

		// Duplicate record
		jqueryTable.on('click', '.duplicate-record', function () 
		{
			var thisRow = $(this).closest('tr');
			var thisDataRow = dataTable.row(thisRow[0]);
			thisDataRow.select();

			DevexDataTable.openDuplicateModal(htmlTable);
		});

		// Double click record
		jqueryTable.on('dblclick', function ()
		{
			DevexDataTable.openEditModal(htmlTable);
		});

		//after render event
		jqueryTable.on('draw.dt', function ()
		{
		});
	}

	static openAddModal(htmlTable)
	{
		var dataTableAltEditor = htmlTable.altEditor;
		dataTableAltEditor._openAddModal();

		$('#altEditor-form-' + dataTableAltEditor.random_id)
			.off('submit')
			.on('submit', function (e)
			{
				e.preventDefault();
				e.stopPropagation();
				dataTableAltEditor._addRowData();
			});

		$('.secondary, .close')
			.off('click')
			.on('click', function (e)
			{
				dataTableAltEditor.internalCloseDialog(dataTableAltEditor.modal_selector);
			});
	}
	static openEditModal(htmlTable)
	{
		var dataTableAltEditor = htmlTable.altEditor;
		dataTableAltEditor._openEditModal();

		$('#altEditor-form-' + dataTableAltEditor.random_id)
			.off('submit')
			.on('submit', function (e)
			{
				e.preventDefault();
				e.stopPropagation();
				dataTableAltEditor._editRowData();
			});

		$('.secondary, .close')
			.off('click')
			.on('click', function (e)
			{
				dataTableAltEditor.internalCloseDialog(dataTableAltEditor.modal_selector);
			});
	}
	static openDuplicateModal(htmlTable)
	{
		var dataTableAltEditor = htmlTable.altEditor;
		dataTableAltEditor._openEditModal(true);

		$('#altEditor-form-' + dataTableAltEditor.random_id)
			.off('submit')
			.on('submit', function (e)
			{
				e.preventDefault();
				e.stopPropagation();
				dataTableAltEditor._addRowData();
			});

		$('.secondary, .close')
			.off('click')
			.on('click', function (e)
			{
				dataTableAltEditor.internalCloseDialog(dataTableAltEditor.modal_selector);
			});
	}
	static openDeleteModal(htmlTable)
	{
		var dataTableAltEditor = htmlTable.altEditor;
		dataTableAltEditor._openDeleteModal();

		$('#altEditor-form-' + dataTableAltEditor.random_id)
			.off('submit')
			.on('submit', function (e)
			{
				e.preventDefault();
				e.stopPropagation();
				dataTableAltEditor._deleteRow();
			});

		$('.secondary, .close')
			.off('click')
			.on('click', function (e)
			{
				dataTableAltEditor.internalCloseDialog(dataTableAltEditor.modal_selector);
			});
	}

	static configureDateTimeColumns(columnsDef)
	{
		for (let columnDef of columnsDef)
		{
			if (columnDef.type == 'axDatetime')
			{
				columnDef.type = "datetime";
				columnDef.dateFormat = $.fn.dataTable.format.datetimeFormat;
				columnDef.datetimepicker = $.fn.dataTable.format.datetimePickerFormat;
				columnDef.render = $.fn.dataTable.render.datetimeFormat;
			}
			else if (columnDef.type == 'axDate')
			{
				columnDef.type = "datetime";
				columnDef.dateFormat = $.fn.dataTable.format.dateFormat;
				columnDef.datetimepicker = $.fn.dataTable.format.datePickerFormat;
				columnDef.render = $.fn.dataTable.render.dateFormat;
			}
		}
	}
}
