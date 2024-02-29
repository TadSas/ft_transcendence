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
        self.sendUnfriendRequest(friend)
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

  self.sendUnfriendRequest = (friend) => {
    console.log('unfriend... (')
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

  self.getFriendRequests = () => {
    new httpRequest({
      resource: '/auth/api/friends/request/all/get',
      method: 'GET',
      successCallback: response => {
        console.log('response:', response)
        // if (!('status' in response) || response['status'] !== 0)
        //   showMessage('An error occurred while sending a friend request', 'danger')
        // else if ('message' in response && response['message'])
        //   showMessage(response['message'], 'success')

        // self.reloadStatus(friend)
      }
    }).send()
  }

  return self
})()
