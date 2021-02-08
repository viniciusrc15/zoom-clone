class PeerBuilder {
    constructor({ peerConfig }) {
        this.peerConfig = peerConfig

        const defaultFunctionValue = () => { }
        this.onError = defaultFunctionValue
        this.onCallReceived = defaultFunctionValue
        this.onConnectionOpened = defaultFunctionValue
        this.onPeerStreamReceived = defaultFunctionValue
        this.onCallError = defaultFunctionValue
        this.onCallClose = defaultFunctionValue
    }

    setOnError(fn) {
        this.onError = fn

        return this
    }
    setOnCallReceived(fn) {
        this.onCallReceived = fn

        return this
    }

    setOnConnectionOpened(fn) {
        this.onConnectionOpened = fn

        return this
    }

    setOnPeerStreamReceived(fn) {
        this.onPeerStreamReceived = fn

        return this
    }

    _prepareCallEvent(call) {
        call.on('stream', stream => this.onPeerStreamReceived(call, stream))
        call.on('error', error => this.onPeerStreamReceived(call, error))
        call.close('close', _ => this.onCallClose(call))

        this.onCallReceived(call)
    }

    // adicionar o comportamento dos eventos de call também para quem ligar!
    _preparePeerInstanceFunction(peerModule) {
        class PeerCustomModule extends peerModule { }

        const peerCall = PeerCustomModule.prototype.call
        const context = this
        PeerCustomModule.prototype.call = function (id, stream) {
            const call = peerCall.apply(this, [id, stream])
            // aqui acontece a magia, interceptamos o call e adicionamos todos os eventos
            //  da chamada para quem liga também
            context._prepareCallEvent(call)

            return call
        }

        return PeerCustomModule
    }

    build() {
        const PeerCustomInstance = this._preparePeerInstanceFunction(Peer)
        const peer = new Peer(...this.peerConfig)


        peer.on('error', this.onError)
        peer.on('call', this._prepareCallEvent.bind(this))

        return new Promise(resolve => peer.on('open', id => {
            this.onConnectionOpened(peer)
            return resolve(peer)
        }))
    }
}