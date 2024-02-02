var LoginController = (() => {
  var self = {}

  // Private
  var foo = () => {}

  // Public
  self.submit = () => {
    new httpRequest({resource: 'auth/api/login', method: 'GET', successCallback: response => {
      if ('redirect_uri' in response)
        location.href = response.redirect_uri
      else
        showMessage('There was a problem with redirection to the authorization server.', 'danger')
    }}).send()
  }

  self.submitOTP = () => {
    new httpRequest({resource: 'auth/api/twofactor/verify', method: 'POST', body: JSON.stringify({'otp': ''}), successCallback: response => {
      response
    }}).send()
  }

  self.authenticationCheck = () => {
    return new httpRequest({resource: 'auth/api/authentication/check', method: 'GET', sync: true, successCallback: () => {}}).send()
  }

  return self
})()
