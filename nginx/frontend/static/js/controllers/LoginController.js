var LoginController = (() => {
  var self = {}

  // Private
  var foo = () => {}

  // Public
  self.submit = () => {
    new httpRequest({resource: 'auth/api/login/', method: 'GET', successCallback: response => {
      console.log(response)
      if ('redirect_uri' in response)
        location.href = response.redirect_uri
      else
        showMessage('There was a problem with redirection to the authorization server.', 'danger')
    }})
  }

  return self
})()
