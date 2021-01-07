const SAMPLES_COUNT = 25
const FFT_SIZE = 2048

const queue: Uint8Array[] = new Array(SAMPLES_COUNT)

const canvas = <HTMLCanvasElement> document.getElementById("monitor")!!
const canvasContext = canvas.getContext("2d")!!

const toHz = (idx: number) => idx * 44100 / FFT_SIZE;

const toWavelength = (strength: number) => {
    const min = 380
    const max = 750
    const range = max - min
    const regularized = strength / 255.0

    // const f = (x: number) => 0.45 * (Math.log(3 * x + 0.37) + 1)

    return min + /*f(regularized)*/ regularized * range
}

const toColorString = (wavelength: number) => {
    const LAMBDA_R = 700.0
    const LAMBDA_G = 546.1
    const LAMBDA_B = 435.8
    const DELTA_L_R = 90
    const DELTA_L_G = 80
    const DELTA_L_B = 80

    const r = 100.0 * Math.exp(-1.0 * Math.pow((wavelength - LAMBDA_R) / DELTA_L_R, 2.0))
    const g = 100.0 * Math.exp(-1.0 * Math.pow((wavelength - LAMBDA_G) / DELTA_L_G, 2.0))
    const b = 100.0 * Math.exp(-1.0 * Math.pow((wavelength - LAMBDA_B) / DELTA_L_B, 2.0))

    return `rgb(${r}%, ${g}%, ${b}%)`
}

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

            // const v = 255 - val
            const color = toColorString(toWavelength(val))

            canvasContext.fillStyle = color
            canvasContext.fillRect(left, canvas.height - top, timeStride, freqStride)
        })
    })
}

/*
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
*/

const audioFile = <HTMLInputElement>document.getElementById("audio-file")!!
const audio = <HTMLAudioElement>document.getElementById("audio")!!
audioFile.onchange = () => {
    audio.pause()

    const files = audioFile.files
    if (files) {
        const file = URL.createObjectURL(files[0])
        audio.src = file

        const audioContext = new AudioContext()
        const source = audioContext.createMediaElementSource(audio)
        const analyser = audioContext.createAnalyser()

        source.connect(analyser)
        analyser.connect(audioContext.destination)
        analyser.fftSize = FFT_SIZE

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

        audio.play()
    }
}
