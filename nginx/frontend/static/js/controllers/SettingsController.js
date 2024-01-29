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

  return self
})()
