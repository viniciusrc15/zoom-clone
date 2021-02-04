class Business {
    constructor({ room, media, view, socketBuilder, peerBuilder }) {
        this.room = room
        this.media = media
        this.view = view

        this.socketBuilder = socketBuilder
        this.peerBuilder = peerBuilder

        this.socket = {}
        this.currentStream = {}
        this.currentPeer = {}

        this.peers = new Map()
        this.usersRecordings = new Map()
    }

    static initialize(deps) {
        const instance = new Business(deps)
        return instance._init()
    }

    async _init() {
        this.view.configureRecordButton(this.onRecordPressed.bind(this))

        this.currentStream = await this.media.getCamera();

        this.socket = this.socketBuilder
            .setOnUserConnected(this.onUserConnected())
            .setOnUserDisconnected(this.onUserDisConnected())
            .build()

        this.currentPeer = await this.peerBuilder
            .setOnError(this.onPeerError())
            .setOnConnectionOpened(this.onPeerConnectionOpened())
            .setOnCallReceived(this.onPeerCallReceived())
            .setOnPeerStreamReceived(this.onPeerStreamReceived())
            .build()


        console.log('init', this.currentStream)
        this.addVideoStream('teste1')
    }

    addVideoStream(userId, stream = this.currentStream) {
        const recorderInstace = new Recorder({userId, stream})
        this.usersRecordings.set(recorderInstace.fileName, recorderInstace)
        if (this.recordingEnabled) {
            recorderInstace.startRecording()
        }

        const isCurrentId = false
        this.view.renderVideo({
            userId,
            stream,
            isCurrentId
        })

    }

    onUserConnected = function () {
        return userId => {
            console.log('user-conn', userId)
            this.currentPeer.call(userId, this.currentStream)
        }
    }

    onUserDisConnected = function () {
        return userId => {
            console.log('user-disconn', userId)

            if (this.peers.has(userId)) {
                this.peers.get(userId).call.close()
                this.peers.delete(userId)
            }

            this.view.setParticipants(this.peers.size)
            this.view.removeVideoElement(userId)
        }
    }

    onPeerError = function () {
        return error => {
            console.error('error on peer!', error)
        }
    }

    onPeerConnectionOpened = function () {
        return (peer) => {
            const id = peer.id
            console.log('peer!!', peer)
            this.socket.emit('join-room', this.room, id)
        }
    }

    onPeerCallReceived = function () {
        return call => {
            console.log('answering call', call)
            call.answer(this.currentStream)
        }
    }

    onPeerStreamReceived = function () {
        return (call, stream) => {
            const callerId = call.peer
            this.addVideoStream(callerId, stream)
            this.peers.set(callerId, { call })

            this.view.setParticipants(this.peers.size)
        }
    }

    onPeerCallError() {
        return (call, error) => {
            console.log(`an call ${call} error ocurred ${error}`)
            this.view.removeVideoElement(call.peer)
        }
    }

    onPeerCallClose() {
        return call => {
            console.log(`call ${call.peer} ended`)
        }
    }

    onRecordPressed(recordingEnabled) {
        this.recordingEnabled = recordingEnabled
        console.log('press btn')
        for (const [key, value] of this.usersRecordings) {
            value.startRecording()
            continue;
        }
        this.stopRecording(key)
    }

    async stopRecording(userId) {
        const usersRecordings = this.usersRecordings
        for (const [key, value] of usersRecordings) {
            const isContextUser = key.includes(userId)

            if(!isContextUser) continue;

            const rec =value
            const isRecordingActive =  rec.recordingActive
            if(!isRecordingActive) continue;

            await rec.stopRecording()
        }
    }
}