var SettingsController = (() => {
  var self = {}

  // Private
  var foo = () => {}

  // Public
  self.triggerAvatarUpload = (elementId) => {
    document.getElementById(elementId).click()
  }

  self.uploadAvatar = () => {
    const formData = new FormData()

    formData.append("filename", document.getElementById('avatarInput').files[0])

    new httpRequest({
      resource: 'auth/api/avatar',
      method: 'PUT',
      headers: {'Content-Type': 'multipart/form-data'},
      body: formData,
      successCallback: response => {
        return response
      }
    }).send()
}

  return self
})()
