const SAMPLES_COUNT = 25
const FFT_SIZE = 2048

const queue: Uint8Array[] = new Array(SAMPLES_COUNT)

const canvas = <HTMLCanvasElement> document.getElementById("monitor")!!
const canvasContext = canvas.getContext("2d")!!

const toHz = (idx: number) => idx * 44100 / FFT_SIZE;

const timeStride = canvas.width / SAMPLES_COUNT
const drawSpectrogram = () => {
    canvasContext.fillRect(0, 0, canvas.width, canvas.height)

    queue.forEach((buffer, time, _) => {
        if (!buffer) {
            return
        }
        
        const left = time * timeStride

        const freqStride = canvas.height / buffer.length
        buffer.forEach((val, freqIdx, _) => {
            const top = freqIdx * freqStride

            const v = 255 - val
            const color = `rgb(${v}, ${v}, ${v})`

            canvasContext.fillStyle = color
            canvasContext.fillRect(left, canvas.height - top, timeStride, freqStride)
        })
    })
}

navigator
    .mediaDevices
    .getUserMedia({ audio: true, video: false })
    .then(stream => {
        console.log("Access granted")

        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream)
        const analyser = audioContext.createAnalyser()

        source.connect(analyser)
        analyser.fftSize =  FFT_SIZE

        const draw = () => {
            const buffer = new Uint8Array(analyser.frequencyBinCount)
            analyser.getByteFrequencyData(buffer)

            queue.shift()
            queue.push(buffer)

            drawSpectrogram()

            requestAnimationFrame(draw)
        }

        requestAnimationFrame(draw)
        console.log("Start")
    })
