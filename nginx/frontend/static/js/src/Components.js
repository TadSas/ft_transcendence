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
