

/*
    devexShowFloatingToast({
      msg:'asdf',
      title:'asdfasdf'
    })
*/

//DOCS: https://pixinvent.com/demo/frest-clean-bootstrap-admin-dashboard-template/html/vertical-menu-template-bordered/ui-toasts.html
async function devexShowFloatingToast(params)
{
  toastr.options = {
    maxOpened: 1,
    autoDismiss: true,
    closeButton: true, 
    debug: false, 
    newestOnTop: true, 
    progressBar: false, 
    positionClass: 'toast-top-right', 
    preventDuplicates: false, 
    onclick: null,
    rtl: false,
    showDuration: 300,
    hideDuration: 1000,
    timeOut: 1000*10, //10sec
    extendedTimeOut: 1000,
    showEasing: 'swing',
    hideEasing: 'linear',
    showMethod: 'fadeIn',
    hideMethod: 'fadeOut',
    ...params
  };

  var shortCutFunction = params.type ?? 'success'; 
  var title = params.title ?? 'title'; 
  var msg =  params.msg ?? 'msg'; 
  var toast = toastr[shortCutFunction](msg, title); // Wire up an event handler to a button in the toast, if it exists

  /*
      toastr.options.onclick = function ()
    {
      alert('You can perform some custom action after a toast goes away');
    };
    
    if (typeof $toast === 'undefined')
    {
      return;
    }
    if ($toast.find('#okBtn').length)
    {
      $toast.delegate('#okBtn', 'click', function ()
      {
        alert('you clicked me. i was toast #' + toastIndex + '. goodbye!');
        $toast.remove();
      });
    }
    if ($toast.find('#surpriseBtn').length)
    {
      $toast.delegate('#surpriseBtn', 'click', function ()
      {
        alert('Surprise! you clicked me. i was toast #' + toastIndex + '. You could perform an action here.');
      });
    }
    if ($toast.find('.clear').length)
    {
      $toast.delegate('.clear', 'click', function ()
      {
        toastr.clear($toast, {
          force: true
        });
      });
    }
    */
}