const showMessage = (message, type = 'primary', duration = 5000) => {
  const types = {
    'primary': {'icon': 'info-circle-fill'},
    'secondary': {'icon': 'info-circle-fill'},
    'success': {'icon': 'check-circle-fill'},
    'danger': {'icon': 'exclamation-triangle-fill'},
    'warning': {'icon': 'exclamation-triangle-fill'},
    'info': {'icon': 'info-circle-fill'},
    'light': {'icon': 'info-circle-fill'},
    'dark': {'icon': 'info-circle-fill'},
  }

  if (!(type in types))
    return

  const messageCont = document.getElementById('message')
  const messageElement = `
    <div class="alert alert-${type} d-flex align-items-center alert-dismissible fade show" role="alert">
      <i class="bi bi-${types[type]['icon']} me-2"></i>
      <div>
        ${message}
      </div>
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `

  messageCont.innerHTML += messageElement
  
  setTimeout(() => {
    const messageDiv = document.querySelector('#message div')

    messageDiv && messageDiv.classList.toggle('show')
    messageDiv.remove()
  }, duration)
}

const showLoader = () => document.getElementById('loader').classList.add('show')

const hideLoader = () => document.getElementById('loader').classList.remove('show')

const getCookie = (name) => {
  const dc = document.cookie
  const prefix = name + "="
  let begin = dc.indexOf("; " + prefix)

  if (begin == -1) {
    begin = dc.indexOf(prefix)

    if (begin != 0)
      return null
  } else {
    begin += 2

    var end = document.cookie.indexOf(";", begin)

    if (end == -1)
      end = dc.length
  }

  return decodeURI(dc.substring(begin + prefix.length, end))
}

const escapeHtml = (unsafe) => {
  return unsafe
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
