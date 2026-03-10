async function main() {
  await Tone.start();

  mysound = sine_wave();
  mysound.connect(Tone.Destination);
}

document.getElementById("playButton").addEventListener("click", () => {
  if (Tone.context.state === "closed") {
    Tone.context = new Tone.Context();
  }
  main();
});

document.getElementById("stopButton").addEventListener("click", () => {
  if (mysound) {
    mysound.stop();
    console.log("Sound Stopped");
  }
});

function sine_wave(frequency = 440, amplitude = 0.5) {
  return new Tone.Oscillator({
    type: "sine",
    frequency: frequency,
    volume: Tone.gainToDb(amplitude),
  }).start();
}

function sawtooth_wave(frequency = 440, amplitude = 0.5) {
  return new Tone.Oscillator({
    type: "sawtooth",
    frequency: frequency,
    volume: Tone.gainToDb(amplitude),
  }).start();
}
function triangle_wave(frequency = 440, amplitude = 0.5) {
  return new Tone.Oscillator({
    type: "triangle",
    frequency: frequency,
    volume: Tone.gainToDb(amplitude),
  }).start();

  function square_wave(frequency = 440, amplitude = 0.5) {
    return new Tone.Oscillator({
      type: "square",
      frequency: frequency,
      volume: Tone.gainToDb(amplitude),
    }).start();
  }
}
