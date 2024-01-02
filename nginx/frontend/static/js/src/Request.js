class httpRequest {
  constructor({resource, method, headers, body, successCallback, skipLoader}) {
    this.resource = resource || ''
    this.method = method || 'GET'
    this.headers = {'Content-Type': 'application/json', ...(headers || {})}
    this.body = body || {}
    this.successCallback = successCallback
    this.skipLoader = skipLoader || false

    if (this.#validateParams())
      return

    this.#prepareParams()

    this.#send()
  }

  #validateParams = () => {
    if (!this.resource)
      return showMessage(("Resource not specified"), 'danger') === void 0

    if (!['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(this.method))
      return showMessage(("An invalid HTTP method was specified"), 'danger') === void 0

    if (typeof this.successCallback !== 'function')
      return showMessage(("Success callback specified incorrectly"), 'danger') === void 0
  }

  #prepareParams = () => {
    this.options = {
      method: this.method,
      headers: this.headers,
    }

    this.method === 'POST' && (this.options['body'] = this.body)
  }

  #send = () => {
    !this.skipLoader && showLoader()

    fetch(this.resource, this.options).then(response => {
      const contentType = response.headers.get("content-type")

      if (contentType && contentType.indexOf("application/json") !== -1) {
        if (response.ok)
          return response.json()
        else
          Promise.reject(response)
      } else {
        if (response.ok)
          return {'status': 0, 'message': response.text().then(text => text)}
        else
          Promise.reject(response)
      }
    }).then(responseData => {
      hideLoader()

      if (typeof responseData === 'object' && 'status' in responseData) {
        if (responseData.status == 1 && 'message' in responseData)
          return showMessage(responseData.message, 'danger')
        if (responseData.status == 2 && 'message' in responseData)
          return showMessage(responseData.message, 'warning')
      }

      this.successCallback(responseData)
    }).catch((error) => {
      showMessage(`${('Error message: ')}${error}`, 'danger')
      console.error(error)
      hideLoader()
    })
  }
}
