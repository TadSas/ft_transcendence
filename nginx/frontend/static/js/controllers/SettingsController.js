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
      resource: 'auth/api/avatar',
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

    new httpRequest({resource: 'auth/api/user', method: 'POST', body: JSON.stringify(body), successCallback: response => {
      if ('message' in response) {
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

        if ('data'in response && 'qr' in response['data'])
          // Create modal with qr in the card component
      }
    }}).send()
  }

  return self
})()
