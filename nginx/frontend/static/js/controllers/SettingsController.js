var SettingsController = (() => {
  var self = {}

  // Private
  var foo = () => {}

  // Public
  self.triggerAvatarUpload = (elementId) => {
    document.getElementById(elementId).click()
  }

  self.uploadAvatar = () => {
    // const selectedImage = document.getElementById(avatarImageId)
    // const fileInput = event.target

    // if (fileInput.files && fileInput.files[0]) {
    //     const reader = new FileReader()

    //     reader.onload = function(e) {
    //         selectedImage.src = e.target.result
    //     };

    //     reader.readAsDataURL(fileInput.files[0])
    // }
}

  return self
})()
