class View {
    constructor() {
        this.recorderBtn = document.getElementById("record")
    }

    createVideoElement({ muted = true, src, srcObject }) {
        const video = document.createElement('video')
        video.muted = muted
        video.src = src
        video.srcObject = srcObject

        if (src) {
            video.controls = true
            video.loop = true
            Util.sleep(200).then(_ => video.play())
        }

        if (srcObject) {
            video.addEventListener("loadedmetadata", _ => video.play())
        }

        return video
    }

    renderVideo({ userId, stream = null, url = null, isCurrentId = false, muted = true }) {
        const video = this.createVideoElement({ src: url, srcObject: stream, muted })
        this.appendToHTMLTree(userId, video, isCurrentId)
    }

    appendToHTMLTree(userId, video, isCurrentId) {
        const div = document.createElement('div')
        div.id = userId
        div.classList.add('wrapper')
        div.append(video)

        const div2 = document.createElement('div')
        div2.innerHTML = isCurrentId ? '' : userId
        div.append(div2)

        const videoGrid = document.getElementById('video-grid')
        videoGrid.append(div)
    }

    removeVideoElement(userId) {
        divVideoUser = document.getElementById(userId)
        if (divVideoUser) {
            divVideoUser.remove()
        }
    }

    toggleRecordingButtonColor(isActive = true) {
        this.recorderBtn.style.color = isActive ? 'red' : 'white'
    }

    onRecordClick(command) {
        this.recordingEnable = false
        return () => {
            const isActive = this.recordingEnable = !this.recordingEnable
            
            command(this.recordingEnable)
            this.toggleRecordingButtonColor(isActive)
        }
    }

    configureRecordButton(command) {
        this.recorderBtn.addEventListener('click', this.onRecordClick(command))
    }

    setParticipants(count) {
        const myself = 1
        const participants = document.getElementById('participants')
        participants.innerHTML = (count + myself)
    }
}