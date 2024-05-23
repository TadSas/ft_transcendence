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
    if (messageDiv) {
      messageDiv.classList.toggle('show')
      messageDiv.remove()
    }

  }, duration)
}

const showLoader = () => document.getElementById('loader').classList.remove('d-none')

const hideLoader = () => document.getElementById('loader').classList.add('d-none')

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

const objectsEqual = (o1, o2) => {
  if (!o1 || !o2)
    return false

  return Object.keys(o1).length === Object.keys(o2).length && Object.keys(o1).every(p => o1[p] === o2[p])
}

const arraysEqual = (a1, a2) => {
  if (!a1 || !a2)
    return false

  return a1.length === a2.length && a1.every((o, idx) => objectsEqual(o, a2[idx]))
}

const setsEqual = (xs, ys) => {
  return xs.size === ys.size && [...xs].every((x) => ys.has(x))
}