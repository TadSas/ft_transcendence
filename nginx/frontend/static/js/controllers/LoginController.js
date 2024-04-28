var LoginController = (() => {
  var self = {}

  // Private
  var foo = () => {}

  // Public
  self.submit = () => {
    new httpRequest({
      resource: '/auth/api/login',
      method: 'GET',
      successCallback: response => {
        if ('redirect_uri' in response)
          location.href = response.redirect_uri
        else
          showMessage('There was a problem with redirection to the authorization server.', 'danger')
      }
    }).send()
  }

  self.submitOTP = () => {
    const inputs = document.querySelectorAll(".otp-field > input")
    const otp = Array.from(inputs).map(element => element.value).join('')

    if (otp.length !== 6 || !Number(otp)) {
      inputs.forEach(input => {
        input.classList.add('border-2')
        input.classList.add('border-danger')
      })

      return
    }

    new httpRequest({
      resource: '/auth/api/twofactor/verify',
      method: 'POST',
      body: JSON.stringify({'otp': otp}),
      successCallback: response => {
        if (!('status' in response) || response['status'] !== 0)
          return

        if (!('authenticated' in response))
          return

        if (!response['authenticated']) {
          inputs.forEach(input => {
            input.value = ''
            input.classList.add('border-2')
            input.classList.add('border-danger')
          })
        } else {
          const loginCont = document.getElementById("login")

          document.getElementById('hiddenVerify').click()

          if (!loginCont.classList.contains("d-none"))
            loginCont.classList.add("d-none")
        }
      }
    }).send()
  }

  self.authenticationCheck = () => {
    const authentication = new httpRequest({
      resource: '/auth/api/authentication/check',
      method: 'GET',
      sync: true,
      successCallback: response => response
    }).send()

    window.user = authentication.user

    return authentication
  }

  return self
})()
