'use strict';

function assert(condition, message)
{
    if (!condition)
    {
        throw new Error(message || "Assertion failed");
    }
}

function numberToColor(value)
{
    switch (value)
    {
        case 0: return "blue";
        case 1: return "indigo";
        case 2: return "purple";
        case 3: return "pink";
        case 4: return "red";
        case 5: return "orange";
        case 6: return "yellow";
        case 7: return "green";
        case 8: return "teal";
        case 9: return "cyan";
        //case 1: return "white";
        case 10: return "gray";
        case 11: return "gray-dark";
    }
    return "white";
}

function numberToUtilityColor(value, prefix = 'bg-')
{
    //repeat colors for higher values
    value = value % 6;

    switch (value)
    {
        case 0: return prefix + "primary";
        case 1: return prefix + "success";
        case 2: return prefix + "danger";
        case 3: return prefix + "warning";
        case 4: return prefix + "info";
        case 5: return prefix + "secondary";
    }
    return prefix + "dark";
}

function numberToUsdCurrency(value, maxFractionDigits = 0)
{
    // Create our number formatter.
    var formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        // These options are needed to round to whole numbers if that's what you want.
        //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
        maximumFractionDigits: maxFractionDigits   //0 causes 2500.99 to be printed as $2,501
    });

    return formatter.format(value); /* $2,500.00 */
}

function numberToPrefixZeros(number, digits)
{
    return String(number).padStart(digits, "0");
}

function dateToShortString(date)
{
    var datestring =
        date.getFullYear() + "-" +
        numberToPrefixZeros(date.getMonth() + 1, 2) + "-" +
        numberToPrefixZeros(date.getDate(), 2) + " " +
        numberToPrefixZeros(date.getHours(), 2) + ":" +
        numberToPrefixZeros(date.getMinutes(), 2) + ":" +
        numberToPrefixZeros(date.getSeconds(), 2);

    return datestring;
}

function sortObjectByKeys(o)
{
    return Object.keys(o).sort().reduce((r, k) => (r[k] = o[k], r), {});
}

function numberToFixedFloor(num, fixed)
{
    var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
    return num.toString().match(re)[0];
}