var Components = (() => {
  var self = {}

  // Private
  var foo = () => {}

  self.button = ({buttonId = '', buttonLabel = '', buttonType = 'button', buttonClass = 'primary', hide = false, disabled = false, dataAttributes = {}, js = {}}) => {
    return `
    <button
      id="${buttonId}"
      type="${buttonType}"
      class="${hide ? 'visually-hidden' : `btn btn-${buttonClass || 'primary'}`}"
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
            if (!js[event])
              continue

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
    <label class="${hide ? 'visually-hidden' : 'form-label'}" for="${labelFor}">
      ${labelText}
    </label>
    `
  }

  self.input = ({type = 'text', id = '', className = '', placeholder = '', value = '', required = false, label = '', invalidFeedback = '', maxlength = ''}) => {
    return `
    ${label ? self.label({'labelText': label, 'labelFor': id}) : ''}
    <input
      type="${type}"
      class="form-control ${className}"
      ${id ? `id="${id}"` : ''}
      ${value ? `value="${value}"` : ''}
      ${placeholder ? `placeholder="${placeholder}"`: ''}
      ${required ? 'required' : ''}
      ${maxlength ? `maxlength="${maxlength}"`: ''}
    >
    <div class="invalid-feedback" ${id ? `id="${id}_invalid_feedback"` : ''}>${invalidFeedback}</div>
    `
  }

  self.selector = ({id = '', className = '', options = [], label = '', invalidFeedback = ''}) => {
    return `
    ${label ? self.label({'labelText': label, 'labelFor': id}) : ''}
    <select ${id ? `id="${id}"` : ''} class="form-select ${className}">
      ${
        (() => {
          let content = ''

          for (const option of options) {
            content += `<option value="${option.value}">${option.title}</option>`
          }

          return content
        })()
      }
    </select>
    <div class="invalid-feedback" ${id ? `id="${id}_invalid_feedback"` : ''}>${invalidFeedback}</div>
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
    size = '', centered = false,
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
      'extraLarge': 'modal-xl',
    }

    return `
    <div class="modal fade" style="display: none;" id="${modalId}" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" role="dialog">
      <div class="${modalSizes[size || 'default']} modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5">${modalTitle}</h1>
            ${self.button({'buttonClass': 'close', 'dataAttributes': {'bs-dismiss': 'modal'}})}
          </div>
          <div class="modal-body ${centered ? 'm-auto' : ''}">
            ${modalBody}
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
          <img src="/auth/api/avatar/${username.replace(/[^a-zA-Z0-9-_]/g, '')}" alt="user" width="40" height="40" class="rounded-circle object-fit-cover">
        </div>
        <div class="ms-3 w-100">
          <div class="d-flex align-items-center justify-content-between mb-1">
            <h6 class="mb-0 short-text" id="${id}_sender">
              ${username || ''}
            </h6>
            <p class="fw-lighter text-end mb-0 text-small-date" id="${id}_sentDate">
              ${dateTime[0] || ''}<br>${dateTime[1] || ''}
            </p>
          </div>
          <p class="font-italic mb-0 text-small short-text" id="${id}_message">
            ${messageText || ''}
          </p>
        </div>
      </div>
    </a>
    `
  }

  self.senderMessage = ({messageText = '', sentDateTime = '', failed = false}) => {
    return `
    <div class="d-flex mb-2">
      <div class="ms-2 chat-message-mw">
        <div class="d-inline-flex ${failed ? 'bg-danger' : 'bg-success'} rounded-top-5 rounded-end-5 py-2 px-3 mb-0">
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

  self.recieverMessage = ({messageText = '', sentDateTime = '', failed = false}) => {
    return `
    <div class="d-flex justify-content-end mb-2">
      <div class="d-flex flex-column me-1 chat-message-mw">
        <div class="align-self-end ${failed ? 'bg-danger' : 'bg-primary'} rounded-top-5 rounded-start-5 py-2 px-3 mb-0">
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

  self.createToast = ({id = '', icon = '', title = '', dateTime = '', body = '', autohide = true}) => {
    const toastContainer = document.getElementById('toast')

    while (toastContainer.getElementsByClassName('toast').length > 9) {
      toastContainer.removeChild(toastContainer.lastChild)
    }

    const redundantToasts = document.querySelectorAll(`#${id}`)
    redundantToasts && redundantToasts.forEach(element => element.remove())
    document.getElementById('toast').insertAdjacentHTML(
      'afterbegin',
      `
      <div id="${id}" class="toast" role="alert" aria-live="assertive" aria-atomic="true" data-bs-autohide="${autohide}">
        <div class="toast-header">
          <i class="bi bi-${icon} me-2"></i>
          <strong class="me-auto short-text">${title}</strong>
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

  self.show = (toastId) => bootstrap.Toast.getOrCreateInstance(document.getElementById(toastId)).show()

  self.hide = (toastId) => bootstrap.Toast.getOrCreateInstance(document.getElementById(toastId)).hide()

  return self
})()


var TournamentBracketComponent = (() => {
  var self = {}

  // Private
  var foo = () => {}

  self.createTeam = ({win = false, draw = false, top = false, name = '', score = '-'}) => {
    let iconType = '-'
    let baseStyle = `match-top`

    if (!draw) {
      baseStyle = `match-${top ? 'top' : 'bottom'}`
      iconType = `-${win ? '1' : '2'}-`
    }

    return `
    <div class="${baseStyle} rounded-${top ? 'bottom' : 'top'}-0 rounded-3 team border border-dark-subtle">
      <span class="image ps-2">
        <i class="bi bi${iconType}circle"></i>
      </span>
      <span class="seed ps-2"></span>
      <span class="name">${name || '-'}</span>
      <span class="score ps-2 pe-2 ms-auto">${score || '-'}</span>
    </div>
    `
  }

  self.createMatch = (matchObject) => {
    const leftScore = Number(matchObject['leftScore']) || 0
    const rightScore = Number(matchObject['rightScore']) || 0
    const leftUser = matchObject['leftUser']
    const leftUserAlias = (self.participants[leftUser] || {}).alias
    const rightUser = matchObject['rightUser']
    const rightUserAlias = (self.participants[rightUser] || {}).alias

    return `
    <div class="match winner-${leftScore > rightScore ? 'top' : 'bottom'}">
      ${self.createTeam({
        'win': leftScore > rightScore,
        'draw': leftScore == rightScore,
        'top': true,
        'name': leftUserAlias && `${leftUserAlias || ''} (${leftUser})` || leftUser,
        'score': leftScore
      })}
      ${self.createTeam({
        'win': rightScore > leftScore,
        'draw': leftScore == rightScore,
        'name': rightUserAlias && `${rightUserAlias || ''} (${rightUser})` || rightUser,
        'score': rightScore
      })}

      <div class="match-lines">
        <div class="line one position-absolute bg-secondary"></div>
        <div class="line two position-absolute bg-secondary"></div>
      </div>

      <div class="match-lines alt">
        <div class="line one position-absolute bg-secondary"></div>
      </div>
    </div>
    `
  }

  self.createColumn = (column) => {
    return `
    <div class="bracket-column">
      ${
        (() => {
          let match = ''

          for (const matchObject in column) {
            match += self.createMatch(column[matchObject])
          }

          return match
        })()
      }
    </div>
    `
  }

  self.createBracket = (data) => {
    let bracket = ''
    const queue = []
    const temp = [data]

    while (temp.length > 0) {
      queue.push(temp[0])

      let node = temp.shift()

      if ("left" in node && Object.keys(node["left"]).length !== 0)
        temp.push(node["left"])

      if ("right" in node && Object.keys(node["right"]).length !== 0)
        temp.push(node["right"])
    }

    if ((Math.log(queue.length + 1) / Math.log(2)) % 1 !== 0)
      return ''

    let start = 0
    let end = 1

    while (end < queue.length) {
      bracket = `${self.createColumn(queue.slice(start, end * 2 - 1))}${bracket}`
      start = end * 2 - 1
      end *= 2
    }

    return `
    <div class="bracket disable-image">
      ${bracket}
    </div>
    `
  }

  self.init = ({draw = {}, participants = {}}) => {
    if (
      typeof draw !== 'object' || Object.keys(draw).length === 0 ||
      typeof participants !== 'object' || Object.keys(participants).length === 0
    )
      return ''

    self.draw = draw
    self.participants = participants

    return self.createBracket(draw)
  }

  return self
})()


var TableComponent = (() => {
  var self = {}

  // Private
  var foo = () => {}

  self.createHeaders = (headers) => {
    let content = ''

    for (const header in headers) {
      content += `<th scope="col">${headers[header] || ''}</th>`
    }

    return `<tr>${content}</tr>`
  }

  self.createRows = (data, headers) => {
    let body = ''

    for (const row of data) {
      body += `<tr>${self.createRow(row, headers)}</tr>`
    }

    return body
  }

  self.createRow = (row, headers) => {
    let data = ''

    for (const header in headers) {
      data += `<td>${row[header] || ''}</td>`
    }

    return data
  }

  self.init = ({headers = {}, data = []}) => {
    return `
    <table class="table table-striped table-hover">
      <thead>
        ${self.createHeaders(headers)}
      </thead>
      <tbody>
        ${self.createRows(data, headers)}
      </tbody>
    </table>
    `
  }

  return self
})()