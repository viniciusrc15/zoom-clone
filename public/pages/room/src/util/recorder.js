class Recorder {
    constructor({ userName, stream }) {
        this.userName = userName
        this.stream = stream

        this.fileName = `id:${userName}-when:${Date.now()}`
        this.videoType = 'video/webm'

        this.mediaRecorder = {}
        this.recordedBlobs = []
        this.completeRecordings = []
        this.recordingActive = false
    }

    _setup() {
        const commonCodecs = [
            "codecs=vp9,opus",
            "codecs=vp8,opus",
            ""
        ]

        const options = commonCodecs
            .map(codec => { mimeType: `${this.videoType};${codec}` })
            .find(options => MediaRecorder.isTypeSupported(options.mimeType))

        if (!options)
            throw new Error(`none of codecs: ${commonCodecs.join(',')} are supported`)

        return options
    }

    startRecording() {
        const options = this._setup()

        if (this.stream.active) return;

        this.mediaRecorder = new MediaRecorder(this.stream, options)
        console.log(`Created Media Recorder ${this.mediaRecorder} with options ${options}`)

        this.mediaRecorder.onstop = (event) => {
            console.log('Recorded Blobs', this.recordedBlobs)
        }

        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data || !event.data.size) return;

            this.recordedBlobs.push(event.data)
        }

        this.mediaRecorder.start()
        console.log(`Media Recorded started`, this.mediaRecorder)
        this.recordingActive = true
    }

    async stopRecording() {
        if (!this.recordingActive || this.mediaRecorder.state === "inactive") return;

        console.log('`media recorded stopped!', this.userName)
        this.mediaRecorder.stop()

        this.recordingActive = false
        await Util.sleep(200)

        this.completeRecordings.push([...this.recordedBlobs])
        this.recordedBlobs = []
    }
}