var Components = (() => {
  var self = {}

  // Private
  var foo = () => {}

  self.button = ({buttonLabel = '', buttonType = 'button', hide = false, disabled = false, js = {}}) => {
    return `
    <button
      type="${buttonType}"
      class="${hide ? 'visually-hidden' : 'btn btn-primary'}"
      ${disabled ? 'disabled' : ''}
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

  self.modal = ({id = '', titleId = '', title = '', body = '', cancelButtonTitle = '', approveButtonTitle = ''}) => {
    // const button = self.button({})
    // const cancelButton = self.button({})
    // const approveButton = self.button({})

    return `
    <div class="modal fade" id="${id}" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLiveLabel" style="display: none;" aria-modal="true" role="dialog">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5" id="${titleId}">${title}</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>${body}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${cancelButtonTitle}</button>
            <button type="button" class="btn btn-primary">${approveButtonTitle}</button>
          </div>
        </div>
      </div>
    </div>
    `
  }

  return self
})()
