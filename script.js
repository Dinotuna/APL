let mySound = null;

async function main() {
  await Tone.start();

  const selectedWave = document.getElementById("selectWave").value;

  const frequencyValue = parseFloat(document.getElementById("frequencyInput").value);
  const amplitudeValue = parseFloat(document.getElementById("amplitudeInput").value);
  const durationValue = parseFloat(document.getElementById("durationInput").value);
  const modulationType = document.querySelector('input[name="modulationType"]:checked').value;
  const modFrequency = parseFloat(document.getElementById("modulationFrequency").value);
  const modWave = document.getElementById("selectModulatorWave").value;

  if (mySound) {
    mySound.stop();
    mySound.dispose();
  }

  switch (modulationType) {
    case "am":
      mySound = generate_am_wave(selectedWave, frequencyValue, amplitudeValue, durationValue, modFrequency, modWave);
      break;
    case "fm":
      mySound = generate_fm_wave(selectedWave, frequencyValue, amplitudeValue, durationValue, modFrequency, modWave);
      break;
    default:
      mySound = generate_wave(selectedWave, frequencyValue, amplitudeValue, durationValue);
      break;
  }


  mySound.connect(Tone.Destination);
}

document.getElementById("playButton").addEventListener("click", () => {
  if (Tone.context.state === "closed") {
    Tone.context = new Tone.Context();
  }
  main();
});

document.getElementById("stopButton").addEventListener("click", () => {
  if (mySound) {
    mySound.stop();
    mySound.dispose();
    mySound = null;
  }
}); 

document.getElementById("modulationFrequency").addEventListener("input", (e) => {
  if (mySound && mySound.modulationFrequency) {
    mySound.modulationFrequency.value = parseFloat(e.target.value);
  }
});

document.getElementById("frequencyInput").addEventListener("input", (e) => {
  if (mySound && mySound.frequency) {
    mySound.frequency.value = parseFloat(e.target.value);
  }
});

document.getElementById("amplitudeInput").addEventListener("input", (e) => {
  if (mySound) {
    mySound.volume.value = Tone.gainToDb(parseFloat(e.target.value));
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

function generate_am_wave(waveType, amplitude, duration, modulationFrequency, modWave) {
  const osc = new Tone.AMOscillator({
    type: waveType,
    frequency: modulationFrequency,
    volume: Tone.gainToDb(amplitude),
    modulationType: modWave,
  });

  osc.start().stop("+" + duration);
  return osc;
}

function generate_fm_wave(waveType, amplitude, duration, modulationFrequency, modWave) {
  const osc = new Tone.FMOscillator({
    type: waveType,
    frequency: modulationFrequency,
    volume: Tone.gainToDb(amplitude),
    modulationType: modWave,
    modulationIndex: 10
  });

  osc.start().stop("+" + duration);
  return osc;
}
