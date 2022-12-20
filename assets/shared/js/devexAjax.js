
class DevexRestApiHandler
{
  restServer;
  endpointUri;
  url;
  method;
  data;
  onSent;
  onResponse;
  onError;
  resultElementId;
  showErrorToast;
  devexAuth;

  constructor(params)
  {
    assert(typeof params === "object");
    assert(params.hasOwnProperty('restServer'));
    assert(params.hasOwnProperty('endpointUri'));

    this.restServer = params.restServer;
    this.endpointUri = params.endpointUri;
    this.method = params.method ?? (params.data ? 'POST' : 'GET');
    this.url = this.restServer + this.endpointUri; // + (params.endpointFilter ?? ''),
    this.data = params.data;
    this.onSent = params.onSent;
    this.onResponse = params.onResponse;
    this.onError = params.onError;
    this.resultElementId = params.resultElementId;
    this.showErrorToast = params.showErrorToast;
    this.showSuccessToast = params.showSuccessToast;
    this.devexAuth = params.devexAuth; //automatic authentization from local storege
  }

  async doAjaxRequest(data)
  {
    let body = JSON.stringify(data ?? this.data);
    let options = {
      method: this.method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: body
    };
    if (this.devexAuth)
    {
      const timestamp = Date.now();
      const address = localStorage.getItem('DevexAuth/address');
      const hash = localStorage.getItem('DevexAuth/hash');
      const verificationString = timestamp + hash + address;

      if (!address || !hash)
        throw new Error('Not authenticated')

      options.headers['devex-auth-address'] = address.toLowerCase();
      options.headers['devex-auth-timestamp'] = timestamp;
      options.headers['devex-auth-hash'] = CryptoJS.SHA3(verificationString).toString();
      //options.headers['devex-auth-debug'] = verificationString;
    }

    let resultPromise = fetch(this.url, options)
      .then(response => this.onResponseError(response))
      .then(response => response.json())
      .then(body => this.onSuccess(body))
      .catch(error => this.onCommunicationError(error));

    let message = 'Request sent: ' + this.url;
    if (this.onSent)
      message = this.onSent() ?? message;
    this.handleSendingMessage(message);

    return await resultPromise;
  }

  async onResponseError(response)
  {
    if (!response.ok)
    {
      let message = '';
      let contenttype = response.headers.get('Content-Type');
      if (contenttype.startsWith('text'))
      {
        message = response.status + ' - ' + response.statusText;
        if (this.onError)
          this.onError(undefined, message);
      }
      else
      {
        let responseData = await response.json();
        if (this.onError)
          this.onError(undefined, responseData);

        message = responseData.message ? responseData.message : responseData;
      }

      //do not handle it here, beucause it will be handled again in onCommError
      //this.handleErrorMessage(message);
      throw new Error(message);
    }
    return response;
  }
  onCommunicationError(error)
  {
    if (this.onError)
      this.onError(error, undefined);

    let message = error.message ? error.message : error;
    this.handleErrorMessage(message);
    throw new Error(message);
  }
  onSuccess(body)
  {
    let successful = body.successful ? body.successful : true;
    let title = body.title ? body.title : "Ajax response";
    let message = body.message ? body.message : ("Response " + (successful ? "OK" : "FAILED"));
    if (this.onResponse)
      message = this.onResponse(body) ?? message;

    this.handleSuccessMessage(title, message, successful);
    return body;
  }

  handleSendingMessage(message)
  {
    if (this.resultElementId)
    {
      let elem = document.getElementById(this.resultElementId);
      elem.innerText = message;
      this.clearAndSetAlertTags(elem, "alert-info");
    }
  }

  handleErrorMessage(message)
  {
    if (this.resultElementId)
    {
      let elem = document.getElementById(this.resultElementId);
      elem.innerText = message;
      this.clearAndSetAlertTags(elem, "alert-danger");
    }

    //show when allowed or when there is no other handler
    if (this.showErrorToast === true || (this.showErrorToast === undefined && !this.resultElementId))
    {
      devexShowFloatingToast({
        msg: message + '\n' + this.url,
        title: 'Ajax request error',
        type: 'error'
      });
    }
  }

  handleSuccessMessage(title, message, successful)
  {
    if (this.resultElementId)
    {
      let elem = document.getElementById(this.resultElementId);
      elem.innerHTML = message;
      this.clearAndSetAlertTags(elem, successful ? "alert-success" : "alert-warning");
    }

    //only show when explicitely allowed or when debugging
    if (this.showSuccessToast === true)
    {
      devexShowFloatingToast({
        msg: message,
        title: title,
        type: successful ? "success" : "warning"
      });
    }
    /*else if (appConfig.isDebug && this.showSuccessToast === undefined && !this.resultElementId)
    {
      devexShowFloatingToast({
        msg: this.url + "<br/>" + message,
        title: 'Request ' + (successful ? "success" : "error"),
        type: successful ? "success" : "warning"
      });
    }*/
  }

  clearAndSetAlertTags(elem, correctTag)
  {
    elem.removeAttribute('hidden');
    elem.classList.remove("alert-danger");
    elem.classList.remove("alert-success");
    elem.classList.remove("alert-warning");
    elem.classList.remove("alert-info");
    elem.classList.remove("d-none");
    elem.classList.add(correctTag);
  }
}

async function devexAjax(params)
{
  return await new DevexRestApiHandler(params).doAjaxRequest();
}



/*OBSOLETE!!*/
$.devexAjax = function (params) 
{
  assert(typeof params === "object");
  assert(params.hasOwnProperty('uri') || params.hasOwnProperty('url'));
  assert(params.hasOwnProperty('type'));

  let url = params.url;
  if (!url)
    url = appConfig.portfolioRestServerUrl + params.uri;

  $.ajax({
    url: url,
    type: params.type
  })
    .done(function (msg)
    {
      alert('Done: ' + JSON.stringify(msg));
    })
    .fail(function (msg)
    {
      alert('Fail: ' + JSON.stringify(msg));
    });
}
