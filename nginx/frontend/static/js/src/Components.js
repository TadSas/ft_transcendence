var Components = (() => {
  var self = {}

  var buttonClasses = {
    'primary': 'btn btn-primary',
    'secondary': 'btn btn-secondary',
    'success': 'btn btn-success',
    'danger': 'btn btn-danger',
    'warning': 'btn btn-warning',
    'info': 'btn btn-info',
    'light': 'btn btn-light',
    'dark': 'btn btn-dark',
    'link': 'btn btn-link',
    'close': 'btn-close',
  }

  // Private
  var foo = () => {}

  self.button = ({buttonId = '', buttonLabel = '', buttonType = 'button', buttonClass = 'primary', hide = false, disabled = false, dataAttributes = {}, js = {}}) => {
    return `
    <button
      id="${buttonId}"
      type="${buttonType}"
      class="${hide ? 'visually-hidden' : buttonClasses[buttonClass || 'primary']}"
      ${disabled ? 'disabled' : ''}
      ${
        (() => {
          let attributes = ''

          for (const attribute in dataAttributes) {
            attributes += `data-${attribute}=${dataAttributes[attribute]} `
          }

          return attributes
        })()
      }
      ${
        (() => {
          let events = ''

          for (const event in js) {
            events += `${event}=${js[event]} `
          }

          return events
        })()
      }>
        ${buttonLabel || ''}
      </button>
    `
  }

  self.label = ({labelText = '', labelFor = '', hide = false}) => {
    return `
    <label class="${hide ? 'visually-hidden' : 'form-check-label'}" for="${labelFor}">
      ${labelText}
    </label>
    `
  }

  self.file = ({id = '', hide = false, disabled = false, js = {}}) => {
    return `
    <input
      type="file"
      class="${hide ? 'visually-hidden' : 'form-control'}"
      id="${id}"
      ${disabled ? 'disabled' : ''}"
      ${
        (() => {
          let events = ''

          for (const event in js) {
            events += `${event}=${js[event]} `
          }

          return events
        })()
      }
    >
    `
  }

  self.text = ({id = '', placeholder = '', hide = false, disabled = false}) => {
    return `
    <input type="text" class="${hide ? 'visually-hidden' : 'form-control'}" id="${id}" placeholder="${placeholder}" ${disabled ? 'disabled' : ''}">
    `
  }

  self.email = ({id = '', placeholder = '', hide = false, disabled = false}) => {
    return `
    <input type="email" class="${hide ? 'visually-hidden' : 'form-control'}" id="${id}" placeholder="${placeholder}" ${disabled ? 'disabled' : ''}">
    `
  }

  self.checkbox = ({id = '', placeholder = '', label = '', labelIncluded = true, labelPosition = 'before', hide = false, disabled = false}) => {
    if (!['before', 'after'].includes(labelPosition))
      labelPosition = 'before'

    return `
    <div class="${hide ? 'visually-hidden' : 'form-check form-switch'}">
      ${labelIncluded && labelPosition == 'before' ? label : ''}
      <input class="form-check-input" type="checkbox" id="${id}" ${placeholder ? 'checked' : ''} ${disabled ? 'disabled' : ''}>
      ${labelIncluded && labelPosition == 'after' ? label : ''}
    </div>
    `
  }

  self.modal = ({
    size = '',
    modalId = '',  buttonId = '', cancelButtonId = '', approveButtonId = '',
    modalTitle = '', buttonTitle = '', cancelButtonTitle = '', approveButtonTitle = '',
    modalBody = '', buttonClass = '', cancelButtonClass = '', approveButtonClass = '',
  }) => {
    let button = ''
    let cancelButton = ''
    let approveButton = ''

    if (buttonId || buttonTitle || buttonClass)
      button = self.button({'buttonId': buttonId, 'buttonClass': buttonClass})
    if (cancelButtonId || cancelButtonTitle || cancelButtonClass)
      cancelButton = self.button({'buttonId': cancelButtonId, 'buttonClass': cancelButtonClass, 'buttonLabel': cancelButtonTitle, 'dataAttributes': {'bs-dismiss': 'modal'}})
    if (approveButtonId || approveButtonTitle || approveButtonClass)
      approveButton = self.button({'buttonId': approveButtonId, 'buttonClass': approveButtonClass, 'buttonLabel': approveButtonTitle})

    const modalSizes = {
      'small': 'modal-sm',
      'default': '',
      'large': 'modal-lg',
      'extra_large': 'modal-xl',
    }

    return `
    <div class="modal fade" style="display: none;" id="${modalId}" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" role="dialog">
      <div class="${modalSizes[size || 'default']} modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5">${modalTitle}</h1>
            ${self.button({'buttonClass': 'close', 'dataAttributes': {'bs-dismiss': 'modal'}})}
          </div>
          <div class="modal-body">
            <p>${modalBody}</p>
          </div>
          <div class="modal-footer">
            ${cancelButton}
            ${approveButton}
          </div>
        </div>
      </div>
    </div>
    `
  }

  return self
})()


var ChatComponents = (() => {
  var self = {}

  // Private
  var foo = () => {}

  self.sidebarMessage = ({id = '', active = false, messageText = '', username = '', sentDate = '', onclick = ''}) => {
    const dateTime = sentDate.split(' ')

    return `
    <a id=${id} class="list-group-item list-group-item-action list-group-item-light ${active ? 'active' : ''}" role="button" onclick=${onclick}>
      <div class="d-flex align-items-center">
        <div>
          <img src="/auth/api/avatar/${username}" alt="user" width="40" height="40" class="rounded-circle object-fit-cover">
        </div>
        <div class="ms-3 w-100">
          <div class="d-flex align-items-center justify-content-between mb-1">
            <h6 class="mb-0" id="${id}_sender">
              ${username || ''}
            </h6>
            <p class="fw-lighter text-end mb-0 text-small-date" id="${id}_sentDate">
              ${dateTime[0] || ''}<br>${dateTime[1] || ''}
            </p>
          </div>
          <p class="font-italic mb-0 text-small chat-short-message" id="${id}_message">
            ${messageText || ''}
          </p>
        </div>
      </div>
    </a>
    `
  }

  self.senderMessage = ({messageText = '', sentDateTime = ''}) => {
    return `
    <div class="d-flex mb-2">
      <div class="ms-2 chat-message-mw">
        <div class="bg-success rounded-top-5 rounded-end-5 py-2 px-3 mb-0">
          <p class="text-small mb-0 text-white">
            ${messageText}
          </p>
        </div>
        <p class="small text-muted mb-0">
          <small>
            ${sentDateTime}
          </small>
        </p>
      </div>
    </div>
    `
  }

  self.recieverMessage = ({messageText = '', sentDateTime = ''}) => {
    return `
    <div class="d-flex justify-content-end mb-2">
      <div class="me-1 chat-message-mw">
        <div class="bg-primary rounded-top-5 rounded-start-5 py-2 px-3 mb-0">
          <p class="text-small mb-0 text-white">
            ${messageText}
          </p>
        </div>
        <p class="small text-muted mb-0 text-end mb-0">
          <small>
            ${sentDateTime}
          </small>
        </p>
      </div>
    </div>
    `
  }

  return self
})()


var ToastComponents = (() => {
  var self = {}

  // Private
  var foo = () => {}

  self.createToast = ({id = '', icon = '', title = '', dateTime = '', body = ''}) => {
    const toastContainer = document.getElementById('toast')

    while (toastContainer.getElementsByClassName('toast').length > 9) {
      toastContainer.removeChild(toastContainer.lastChild)
    }

    document.getElementById('toast').insertAdjacentHTML(
      'afterbegin',
      `
      <div id="${id}" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header">
          <i class="bi bi-${icon} me-2"></i>
          <strong class="me-auto chat-short-message">${title}</strong>
          <small>${dateTime}</small>
          <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
          ${body}
        </div>
      </div>
      `
    )
  }

  return self
})()
