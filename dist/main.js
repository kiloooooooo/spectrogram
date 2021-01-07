"use strict";
var SAMPLES_COUNT = 25;
var FFT_SIZE = 2048;
var queue = new Array(SAMPLES_COUNT);
var sourceSelector = document.getElementById("source-selector-form");
var canvas = document.getElementById("monitor");
var canvasContext = canvas.getContext("2d");
var toHz = function (idx) { return idx * 44100 / FFT_SIZE; };
var toWavelength = function (strength) {
    var min = 380;
    var max = 750;
    var range = max - min;
    var regularized = strength / 255.0;
    // const f = (x: number) => 0.45 * (Math.log(3 * x + 0.37) + 1)
    return min + /*f(regularized)*/ regularized * range;
};
var toColorString = function (wavelength) {
    var LAMBDA_R = 700.0;
    var LAMBDA_G = 546.1;
    var LAMBDA_B = 435.8;
    var DELTA_L_R = 90;
    var DELTA_L_G = 80;
    var DELTA_L_B = 80;
    var r = 100.0 * Math.exp(-1.0 * Math.pow((wavelength - LAMBDA_R) / DELTA_L_R, 2.0));
    var g = 100.0 * Math.exp(-1.0 * Math.pow((wavelength - LAMBDA_G) / DELTA_L_G, 2.0));
    var b = 100.0 * Math.exp(-1.0 * Math.pow((wavelength - LAMBDA_B) / DELTA_L_B, 2.0));
    return "rgb(" + r + "%, " + g + "%, " + b + "%)";
};
var timeStride = canvas.width / SAMPLES_COUNT;
var drawSpectrogram = function () {
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);
    queue.forEach(function (buffer, time, _) {
        if (!buffer) {
            return;
        }
        var left = time * timeStride;
        var freqStride = canvas.height / buffer.length;
        buffer.forEach(function (val, freqIdx, _) {
            var top = freqIdx * freqStride;
            // const v = 255 - val
            var color = toColorString(toWavelength(val));
            canvasContext.fillStyle = color;
            canvasContext.fillRect(left, canvas.height - top, timeStride, freqStride);
        });
    });
};
var requestID = null;
sourceSelector.addEventListener("submit", function (ev) {
    if (requestID) {
        cancelAnimationFrame(requestID);
        requestID = null;
        canvasContext.fillStyle = "#FFFFFF";
        canvasContext.fillRect(0, 0, canvas.width, canvas.height);
    }
    var data = new FormData(sourceSelector);
    var entry = data.get("source");
    if (entry == "mic") {
        navigator
            .mediaDevices
            .getUserMedia({ audio: true, video: false })
            .then(function (stream) {
            console.log("Access granted");
            var audioContext = new AudioContext();
            var source = audioContext.createMediaStreamSource(stream);
            var analyser = audioContext.createAnalyser();
            source.connect(analyser);
            analyser.fftSize = FFT_SIZE;
            var draw = function () {
                var buffer = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(buffer);
                queue.shift();
                queue.push(buffer);
                drawSpectrogram();
                requestID = requestAnimationFrame(draw);
            };
            requestID = requestAnimationFrame(draw);
            console.log("Start");
        });
    }
    else if (entry == "file") {
        var audioFile_1 = document.getElementById("audio-file");
        var audio_1 = document.getElementById("audio");
        audioFile_1.onchange = function () {
            audio_1.pause();
            var files = audioFile_1.files;
            if (files) {
                var file = URL.createObjectURL(files[0]);
                audio_1.src = file;
                var audioContext = new AudioContext();
                var source = audioContext.createMediaElementSource(audio_1);
                var analyser_1 = audioContext.createAnalyser();
                source.connect(analyser_1);
                analyser_1.connect(audioContext.destination);
                analyser_1.fftSize = FFT_SIZE;
                var draw_1 = function () {
                    var buffer = new Uint8Array(analyser_1.frequencyBinCount);
                    analyser_1.getByteFrequencyData(buffer);
                    queue.shift();
                    queue.push(buffer);
                    drawSpectrogram();
                    requestID = requestAnimationFrame(draw_1);
                };
                requestID = requestAnimationFrame(draw_1);
                console.log("Start");
                audio_1.play();
            }
        };
    }
    ev.preventDefault();
});
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
/*
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
*/
//# sourceMappingURL=main.js.map