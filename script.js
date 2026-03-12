let mySound = null;

async function main() {
  await Tone.start();

  const selectedWave = document.getElementById("selectWave").value;

  const frequencyValue = parseFloat(document.getElementById("frequencyInput").value);
  const amplitudeValue = parseFloat(document.getElementById("amplitudeInput").value);
  const durationValue = parseFloat(document.getElementById("durationInput").value);

  mySound = generate_wave(selectedWave, frequencyValue, amplitudeValue, durationValue);

  mySound.connect(Tone.Destination);
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

function generate_wave(waveType, frequency, amplitude, duration) {
  const osc = new Tone.Oscillator({
    type: waveType,
    frequency: frequency,
    volume: Tone.gainToDb(amplitude),
  });

  osc.start().stop("+" + duration);

  return osc;
}
