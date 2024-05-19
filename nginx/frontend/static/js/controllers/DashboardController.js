var DashboardController = (() => {
  var self = {}

  // Private
  var foo = () => {}

  // Public
  self.initPlatformUsers = async (users) => {
    users = users || window.userActivity || {}

    let onlineUsers = users['online'] || []
    let offlineUsers = await new httpRequest({resource: '/auth/api/users/all', method: 'GET', successCallback: response => {return response?.data?.users}}).send()
    onlineUsers = [...new Set(onlineUsers)]
    offlineUsers = [...new Set(offlineUsers)]

    offlineUsers = offlineUsers.filter(user => !onlineUsers.includes(user))

    const onlineUsersTab = `
    <div class="tab-pane fade show active" id="online-tab-pane" role="tabpanel" aria-labelledby="online-tab" tabindex="0">
      <div class="d-flex align-items-end flex-row">
        <div class="container text-center">
          <div class="row">
            ${await self.getUserCards(onlineUsers)}
          </div>
        </div>
      </div>
    </div>
    `

    const offlineUsersTab = `
    <div class="tab-pane fade" id="offline-tab-pane" role="tabpanel" aria-labelledby="offline-tab" tabindex="0">
      <div class="d-flex align-items-end flex-row">
        <div class="container text-center">
          <div class="row">
            ${await self.getUserCards(offlineUsers)}
          </div>
        </div>
      </div>
    </div>
    `
    const result = `
      ${onlineUsersTab}
      ${offlineUsersTab}
    `

    const platformUsersTabContent = document.getElementById('platformUsersTabContent')
    platformUsersTabContent && (platformUsersTabContent.innerHTML = result)

    return result
  }

  self.getUserCards = async (users) => {
    if (!users || users.constructor !== Array || users.length === 0)
      return ''

    let content = ''

    for (const user of users) {
      content += `
      <div class="col-1 col-sm-1 d-flex justify-content-center">
        <div class="card-body">
          <div class="px-2 position-relative">
            <img src="/auth/api/avatar/${user}" width="64" height="64" class="rounded-circle border object-fit-cover">
            <p>${user}</p>
            <a href="/profile/${user}" class="stretched-link" data-link></a>
          </div>
        </div>
      </div>
      `
    }

    return content
  }

  return self
})()
