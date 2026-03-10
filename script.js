let mysound = null;

async function main() {
  await Tone.start();

  const selectedWave = document.getElementById("selectWave").value;

  if (selectedWave === "sineWave") {
    mysound = sine_wave();
  }
  else if (selectedWave === "triangleWave") {
    mysound = triangle_wave();
  }
  else if (selectedWave === "squareWave") {
    mysound = square_wave();
  }

  else if (selectedWave === "sawtoothWave") {
    mysound = sawtooth_wave();
  }

  else {
    console.log("Select a wave")
    return;
  }


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
}
function square_wave(frequency = 440, amplitude = 0.5) {
    return new Tone.Oscillator({
      type: "square",
      frequency: frequency,
      volume: Tone.gainToDb(amplitude),
    }).start();
  }

