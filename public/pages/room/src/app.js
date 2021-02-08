const onload = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const room = urlParams.get('room');
  console.log(`this is the room ${room}`)

  // const recorderBtn = document.getElementById('record')
  // recorderBtn.addEventListener('click', recordClick(recorderBtn))

  const socketUrl = 'http://localhost:3000'
  const socketBuilder = new SocketBuilder({ socketUrl })
  const view = new View()
  const media = new Media()

  const peerConfig = Object.values({
    id: undefined,
    config: {
      port: 9000,
      host: 'localhost',
      path: '/'
    }
  })
  const peerBuilder = new PeerBuilder({ peerConfig })

  const deps = {
    room,
    media,
    view,
    socketBuilder,
    peerBuilder
  }
  // view.renderVideo({ userId: 'teste01', url: 'https://media.giphy.c om/media/PaC5cuf49rRyw8XpiA/giphy.mp4', isCurrentId: true })
  // view.renderVideo({ userId: 'teste01', url: 'https://media.giphy.com/media/PaC5cuf49rRyw8XpiA/giphy.mp4' })
  // view.renderVideo({ userId: 'teste01', url: 'https://media.giphy.com/media/PaC5cuf49rRyw8XpiA/giphy.mp4' })
  Business.initialize(deps)
}

window.onload = onload 