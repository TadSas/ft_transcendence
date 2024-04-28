var SettingsController = (() => {
  var self = {}

  // Private
  var foo = () => {}

  // Public
  self.triggerAvatarUpload = (avatarImageId) => {
    document.getElementById(avatarImageId).click()
  }

  self.uploadAvatar = (avatarImageInputId, avatarImageId) => {
    const formData = new FormData()

    formData.append("avatar", document.getElementById(avatarImageInputId).files[0])

    new httpRequest({
      resource: '/auth/api/avatar',
      method: 'PUT',
      headers: {},
      body: formData,
      successCallback: response => {
        if (!response)
          return showMessage('Failed to upload avatar. The size of image exceeded the 1MB', 'danger')

        if ('status' in response && response['status'] === 0) {
          const selectedImage = document.getElementById(avatarImageId)
          const headerImage = document.getElementById('headerUserAvatar')
          const fileInput = document.getElementById(avatarImageInputId)

          if (fileInput.files && fileInput.files[0]) {
            const reader = new FileReader()

            reader.onload = function(e) {
                selectedImage.src = e.target.result
                headerImage.src = e.target.result
            }

            reader.readAsDataURL(fileInput.files[0])
          }
        }

        if ('message' in response && response['message'])
          showMessage(response['message'])
      }
    }).send()
  }

  self.submit = (formId) => {
    const body = {}

    Array.from(document.getElementById(formId).getElementsByTagName('input')).forEach(element => {
      if (element.type === 'checkbox')
        body[element.id] = element.checked || false
      else
        body[element.id] = element.value
    })

    new httpRequest({resource: '/auth/api/user', method: 'POST', body: JSON.stringify(body), successCallback: response => {
      if (!('message' in response))
        return

      if ('errors' in response) {
        for (const [key, value] of Object.entries(response['errors'])) {
          if (value.constructor === Array && value.length > 0)
            document.getElementById(`${key}_invalid_feedback`).innerText = value[0]

          document.getElementById(key).classList.add('is-invalid')
        }

        showMessage(response['message'], 'danger')
      }
      else {
        for (const [key, value] of Object.entries(body)) {
          if (!value)
            continue

          const element = document.getElementById(key)

          if (element.classList.contains('is-invalid'))
            element.classList.remove('is-invalid')

          element.classList.add('is-valid')
          element.value = ''
          element.placeholder = value
        }

        showMessage(response['message'], 'success')
      }

      if ('data'in response && 'qr' in response['data']) {
        const modalBody = `
        <div class="card">
          <div class="row g-0">
            <div class="col-md-5 d-flex justify-content-center align-items-center bg-white">
              <img width="400" height="400" src="data:image/png;base64,${response['data']['qr']}">
            </div>
            <div class="col-md-7">
              <div class="card-body">
                <h5 class="card-title">Set Up Two-Factor Authentication with Google Authenticator</h5>
                <p class="card-text">
                  <br>
                  Dear user,
                  <br>
                  To enhance the security of your account, we recommend setting up two-factor authentication (2FA) using Google Authenticator.
                  <br><br>
                  <strong>Follow these steps:</strong>
                  <br>
                  <ol class="list-group list-group-numbered list-group-flush">
                    <li class="list-group-item">Open Google Authenticator on your mobile device.</li>
                    <li class="list-group-item">Tap the '+' icon to add a new account.</li>
                    <li class="list-group-item">Select "Scan a QR code" and scan the QR code attached to this text.</li>
                    <li class="list-group-item">A six-digit code will appear in the app. Enter this code on the verification page.</li>
                  </ol>
                  <br>
                  <strong>Note:</strong> Ensure you keep your mobile device secure, as it will be required for login verification.
                </p>
                <p class="card-text">
                  <small class="text-body-secondary">
                    Thank you for taking the extra step to protect your account.
                  </small>
                </p>
              </div>
            </div>
          </div>
        </div>
        `
        document.getElementsByClassName('modals')[0].innerHTML = Components.modal({
          'modalId': 'qrModalId', 'modalTitle': 'Attention', 'modalBody': modalBody, 'size': 'extraLarge'
        })
        new bootstrap.Modal(document.getElementById("qrModalId"), {}).show()
      }
    }}).send()
  }

  return self
})()
