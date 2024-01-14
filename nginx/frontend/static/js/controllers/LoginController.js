var LoginController = (() => {
  var self = {}

  // Private
  var foo = () => {}

  // Public
  self.submit = () => {
    new httpRequest({resource: 'auth/example', method: 'POST', successCallback: response => {
      console.log(response)
      // response.message.then(a => {console.log(a)})
    }})
  }

  return self
})()
