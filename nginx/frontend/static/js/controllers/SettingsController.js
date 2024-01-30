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
        if ('data' in response)
          showMessage(response['message'], 'danger')
        else
          showMessage(response['message'])
      }
    }}).send()
  }

  return self
})()
