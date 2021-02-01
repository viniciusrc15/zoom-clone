class Business {
    constructor({ room, media, view, socketBuilder }) {
        this.room = room
        this.media = media
        this.view = view

        this.socketBuilder = socketBuilder
            .setOnUserConnected(this.onUserConnected())
            .setOnUserDisconnected(this.onUserDisConnected())
            .build()

        this.socketBuilder.emit('join-room', this.room, 'teste01')
        this.currentStream = {}
    }

    static initialize(deps) {
        const instance = new Business(deps)
        return instance._init()
    }

    async _init() {
        // this.media.getCamera().then(
        //     stream => (this.currentStream = stream),
        //     err => console.log(err)
        // )
        this.currentStream = await this.media.getCamera();
        console.log('init', this.currentStream)
        this.addVideoStream('teste1')
    }

    addVideoStream(userId, stream = this.currentStream) {
        const isCurrentId = true
        this.view.renderVideo({
            userId,
            stream,
            isCurrentId
        })

    }

    onUserConnected = function () {
        return userId => {
            console.log('user-conn', userId)
        }
    }

    onUserDisConnected = function () {
        return userId => {
            console.log('user-disconn', userId)
        }
    }
}