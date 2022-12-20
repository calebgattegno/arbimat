/*
  //let form = document.getElementById('formDexTradingQuickBuy');
  //let data = DevexFormHandler.getFormDataToObject(form)
*/

class DevexFormHandler
{
  static getFormDataToObject(formId)
  {
    const myFormData = new FormData(formId);
    const entries = myFormData.entries();
    const formDataObj = Object.fromEntries(entries);
    return formDataObj;
  }

  static getInputDataToObject(controlsArray)
  {
    let data = [];
    for (const control of controlsArray)
    {
      let elem = document.getElementById(control);
      let name = elem.name;
      let value = elem.value;
      data[name] = value;
    };
    return data;
  }
}

class DevexFormRestApiHandler
{
  formId;
  restApiHandler;

  constructor(params)
  {
    assert(typeof params === "object");
    assert(params.hasOwnProperty('formId'));
    assert(params.hasOwnProperty('restServer'));
    assert(params.hasOwnProperty('endpointUri'));

    //customize params, add params required by form sender
    params.method = 'POST';

    this.restApiHandler = new DevexRestApiHandler(params);
    this.formId = params.formId;

    const form = document.getElementById(params.formId);
    form.addEventListener('submit', event => this.onSubmitClicked(event));
  }

  onSubmitClicked(event)
  {
    event.preventDefault();
    const formData = DevexFormHandler.getFormDataToObject(event.target);
    this.restApiHandler.doAjaxRequest(formData);
  }
}

function devexRestApiFormHandler(params)
{
  new DevexFormRestApiHandler(params);
}
