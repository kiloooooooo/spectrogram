"use strict";
var SAMPLES_COUNT = 25;
var FFT_SIZE = 2048;
var queue = new Array(SAMPLES_COUNT);
var canvas = document.getElementById("monitor");
var canvasContext = canvas.getContext("2d");
var toHz = function (idx) { return idx * 44100 / FFT_SIZE; };
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
            var v = 255 - val;
            var color = "rgb(" + v + ", " + v + ", " + v + ")";
            canvasContext.fillStyle = color;
            canvasContext.fillRect(left, canvas.height - top, timeStride, freqStride);
        });
    });
};
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
        requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
    console.log("Start");
});
//# sourceMappingURL=main.js.map