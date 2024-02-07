var LogoutController = (() => {
  var self = {}

  // Private
  var foo = () => {}

  // Public
  self.logout = () => {
    new httpRequest({resource: '/auth/api/logout', method: 'GET', successCallback: response => {
      history.pushState(null, null, '/login')
    }}).send()
  }

  return self
})()
