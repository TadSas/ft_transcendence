var FriendsController = (() => {
  var self = {}

  // Private
  var foo = () => {}

  // Public
  self.friendAction = (event, friend) => {
    if (!('target' in event) || !event['target'] || !('dataset' in event['target']) || !event['target']['dataset'])
      return

    switch (event['target']['dataset']['status']) {
      case 'not-friends':
        self.sendFriendRequest(friend)
        break
      case 'request':
        self.sendCancelFriendRequest(friend)
        break
      case 'accept':
        self.removeFriend(friend)
        break
      case 'reject':
        self.sendFriendRequest(friend)
        break
      case 'removed':
        self.sendFriendRequest(friend)
        break
    }
  }

  self.sendFriendRequest = (friend) => {
    new httpRequest({
      resource: '/auth/api/friends/request',
      method: 'POST',
      body: JSON.stringify({'friend': friend}),
      successCallback: response => {
        if (!('status' in response) || response['status'] !== 0)
          showMessage('An error occurred while sending a friend request', 'danger')
        else if ('message' in response && response['message'])
          showMessage(response['message'], 'success')

        self.reloadStatus(friend)
      }
    }).send()
  }

  self.removeFriend = (friend) => {
    new httpRequest({
      resource: `/auth/api/friends/${friend}/remove`,
      method: 'GET',
      successCallback: response => {
        if (!('status' in response) || response['status'] !== 0)
          showMessage('An error occurred while removing a friend request', 'danger')
        else if ('message' in response && response['message'])
          showMessage(response['message'], 'success')

        self.reloadStatus(friend)
      }
    }).send()
  }

  self.sendCancelFriendRequest = (friend) => {
    new httpRequest({
      resource: '/auth/api/friends/request/cancel',
      method: 'POST',
      body: JSON.stringify({'friend': friend}),
      successCallback: response => {
        if (!('status' in response) || response['status'] !== 0)
          showMessage('An error occurred while canceling a friend request', 'danger')
        else if ('message' in response && response['message'])
          showMessage(response['message'], 'success')

        self.reloadStatus(friend)
      }
    }).send()
  }

  self.status = async (friend) => {
    return new httpRequest({
      resource: `/auth/api/friends/status/${friend}`,
      method: 'GET',
      successCallback: response => {
        if (!('data' in  response) || !response['data'] || !('status' in response['data']) || !response['data']['status'])
          return ''

        let contClass = ''
        let contTitle = ''
        const friendStatus = response['data']['status']

        switch (friendStatus) {
          case 'not-friends':
            contClass = 'outline-primary'
            contTitle = 'Add friend'
            break
          case 'request':
            contClass = 'outline-secondary'
            contTitle = 'Cancel request'
            break
          case 'accept':
            contClass = 'outline-danger'
            contTitle = 'Unfriend'
            break
          case 'reject':
            contClass = 'outline-primary'
            contTitle = 'Add friend'
            break
          case 'removed':
            contClass = 'outline-primary'
            contTitle = 'Add friend'
            break
        }

        return `
        <div role="button" class="btn btn-${contClass}" data-status="${friendStatus}">
          ${contTitle}
          <a type="button" class="pe-none d-none"></a>
        </div>
        `
      }
    }).send()
  }

  self.reloadStatus = async (friend) => {
    const friendAction = document.getElementById('friendAction')
    friendAction && (friendAction.innerHTML = await self.status(friend))
  }

  self.getLoggedUserFriends = async () => {
    return new httpRequest({
      resource: `/auth/api/friends/all`,
      method: 'GET',
      successCallback: response => {
        if ('data' in response, 'friends' in response['data'])
          return response['data']['friends']

        return []
      }
    }).send()
  }

  self.getFriends = async (username) => {
    return new httpRequest({
      resource: `/auth/api/friends/${username}/all`,
      method: 'GET',
      successCallback: response => {
        if ('data' in response, 'friends' in response['data'])
          return response['data']['friends']

        return []
      }
    }).send()
  }

  self.getFriendRequests = async () => {
    return new httpRequest({
      resource: '/auth/api/friends/request/all/get',
      method: 'GET',
      successCallback: response => {
        if ('data' in response, 'requests' in response['data'])
          return response['data']['requests']

        return []
      }
    }).send()
  }

  self.getFriendRequestsView = async () => {
    const friendRequests = await self.getFriendRequests()

    if (!friendRequests || friendRequests.constructor !== Array || friendRequests.length === 0)
      return ''

    let friendRequestsView = ''

    for (const friendRequest of friendRequests) {
      const username = friendRequest.user_id
      friendRequestsView += `
      <div class="col-3 mb-4">
        <div class="card text-bg-dark" style="max-width: 18rem;">
          <div class="card-header">${username || ''}</div>
          <div class="card-body">
            <div role="button" class="btn btn-primary btn-sm" onclick="FriendsController.acceptFriendRequest('${username}')">Accept</div>
            <div role="button" class="btn btn-secondary btn-sm" onclick="FriendsController.rejectFriendRequest('${username}')">Not now</div>
          </div>
        </div>
      </div>
      `
    }

    return `
    <div class="position-relative p-5 text-start bg-body border rounded-4 mb-3">
      <h3 class="border-bottom pb-2">Friend requests</h3>
      <div class="d-flex align-items-end flex-row mt-4">
        <div class="container">
          <div class="row">
            ${friendRequestsView}
          </div>
        </div>
      </div>
    </div>
    `
  }

  self.getFriendsView = async (username) => {
    let friends = []
    let friendsView = ''

    if (!username)
      friends = await self.getLoggedUserFriends()
    else
      friends = await self.getFriends(username)

    if (!friends || friends.constructor !== Array || friends.length === 0)
      friendsView = `
      <div class="col-2 col-sm-2 d-flex justify-content-center">
        <div class="px-2">
          <i class="bi bi-person-arms-up h1"></i>
          <p class="text-center text-wrap">No friends found</p>
        </div>
      </div>
      `
    else {
      for (const friend of friends) {
        friendsView += `
        <div class="col-2 col-sm-2 d-flex justify-content-center">
          <div class="card-body">
            <div class="px-2 position-relative">
              <img src="/auth/api/avatar/${friend}" width="64" height="64" class="rounded-circle border object-fit-cover">
              <p>${friend}</p>
              <a href="/profile/${friend}" class="stretched-link" data-link></a>
            </div>
          </div>
        </div>
        `
      }
    }

    return `
    <div class="position-relative p-5 text-start bg-body border rounded-4 mb-3">
      <h3 class="border-bottom pb-2">Friends</h3>
      <div class="d-flex align-items-end flex-row mt-4">
        <div class="container text-center">
          <div class="row">
            ${friendsView}
          </div>
        </div>
      </div>
    </div>
    `
  }

  self.acceptFriendRequest = (username) => {
    new httpRequest({
      resource: '/auth/api/friends/request/accept',
      method: 'POST',
      body: JSON.stringify({'username': username}),
      successCallback: response => {
        if (!('status' in response) || response['status'] !== 0)
          showMessage('An error occurred while canceling a friend request', 'danger')
        else if ('message' in response && response['message'])
          showMessage(response['message'], 'success')

        self.reloadFriendRequestsView()
        self.reloadFriendsView()
      }
    }).send()
  }

  self.rejectFriendRequest = (username) => {
    new httpRequest({
      resource: '/auth/api/friends/request/reject',
      method: 'POST',
      body: JSON.stringify({'username': username}),
      successCallback: response => {
        if (!('status' in response) || response['status'] !== 0)
          showMessage('An error occurred while canceling a friend request', 'danger')
        else if ('message' in response && response['message'])
          showMessage(response['message'], 'success')

        self.reloadFriendRequestsView()
        self.reloadFriendsView()
      }
    }).send()
  }

  self.reloadFriendRequestsView = async () => {
    const friendRequests = document.getElementById('friendRequests')
    friendRequests && (friendRequests.innerHTML = await self.getFriendRequestsView())
  }

  self.reloadFriendsView = async () => {
    const friends = document.getElementById('friends')
    friends && (friends.innerHTML = await self.getFriendsView())
  }

  return self
})()
