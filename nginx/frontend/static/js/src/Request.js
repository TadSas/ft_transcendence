class httpRequest {
  constructor({resource, method, headers, body, successCallback, skipLoader, sync}) {
    this.resource = resource || ''
    this.method = method || 'GET'
    this.body = body || {}
    this.successCallback = successCallback
    this.skipLoader = skipLoader || false
    this.sync = sync || false

    if (!headers || typeof headers === 'object' && Object.keys(headers).length !== 0)
      this.headers = {'Content-Type': 'application/json', ...(headers || {})}

    if (this.#validateParams())
      return

    this.#prepareParams()
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

    if (['POST', 'PUT'].includes(this.method))
      this.options['body'] = this.body
  }

  send = () => {
    !this.skipLoader && showLoader()

    if (this.sync)
      return this.#syncSend()

    return fetch(this.resource, this.options).then(response => {
      if (response.status > 500)
        return showMessage('Internal server error', 'danger')

      const contentType = response.headers.get("content-type")

      if (contentType && contentType.indexOf("application/json") !== -1) {
        if (response.ok)
          return response.json()
        else
          Promise.reject(response)
      } else {
        if (response.ok)
          return {'status': 0, 'message': Promise.resolve(response.text().then(text => text))}
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

      return this.successCallback(responseData)
    }).catch((error) => {
      showMessage('Internal server error', 'danger')
      hideLoader()
    })
  }

  #syncSend = () => {
    const request = new XMLHttpRequest()

    request.open(this.method, this.resource, false)

    if (!this.headers || typeof this.headers === 'object' && Object.keys(this.headers).length !== 0)
      Object.entries(this.headers).forEach(([key, value]) => {
        request.setRequestHeader(key, value)
      })

    request.send(this.body)

    if (request.status === 403 || request.status === 200) {
      try {
        return JSON.parse(request.response)
      } catch (e) {
        return request.response
      }
    }

    return null
  }
}
