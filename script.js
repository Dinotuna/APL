let mySound = null;
let myEnvelope = null;
let myFilter = null;

async function main(customFrequency = null) {
  await Tone.start();

  const selectedWave = document.getElementById("selectWave").value;
  const frequencyValue =  customFrequency !== null
    ? customFrequency
    : parseFloat(document.getElementById("frequencyInput").value);
  const amplitudeValue = parseFloat(document.getElementById("amplitudeInput").value);
  const durationValue = parseFloat(document.getElementById("durationInput").value);
  const modulationType = document.querySelector('input[name="modulationType"]:checked').value;
  const modulationFrequency = parseFloat(document.getElementById("modulationFrequency").value);
  const modWave = document.getElementById("selectModulatorWave").value;
  const attackInput = parseFloat(document.getElementById("attackInput").value);
  const decayInput = parseFloat(document.getElementById("decayInput").value);
  const sustainInput = parseFloat(document.getElementById("sustainInput").value);
  const releaseInput = parseFloat(document.getElementById("releaseInput").value);
  const adsrToggle = document.getElementById("adsrToggle").checked;
  const useHarmonicity = document.getElementById("harmonicityToggle").checked;
  const calculatedHarmonicity = useHarmonicity ? modulationFrequency : (modulationFrequency / frequencyValue);
  const filterType = document.querySelector('input[name="filterType"]:checked').value;
  const filterCutoff = parseFloat(document.getElementById("filterCutoff").value);

  if (mySound) {
    mySound.stop();
    mySound.dispose();
    mySound = null;
  }
  if (myEnvelope) {
    myEnvelope.dispose();
    myEnvelope = null;
  }
  if (myFilter) {
    myFilter.dispose();
    myFilter = null;
  }

  switch (modulationType) {
    case "am":
      mySound = generate_am_wave(selectedWave, frequencyValue, amplitudeValue, durationValue, calculatedHarmonicity, modWave);
      break;
    case "fm":
      mySound = generate_fm_wave(selectedWave, frequencyValue, amplitudeValue, durationValue, calculatedHarmonicity, modWave);
      break;
    default:
      mySound = generate_wave(selectedWave, frequencyValue, amplitudeValue, durationValue);
      break;
  }
  if (filterType !== "none") {
    myFilter = new Tone.Filter({
      type: filterType,
      frequency: filterCutoff,
      rolloff: -12
    });
  }

  let lastNode = mySound;

  if (adsrToggle) {
    myEnvelope = apply_amplitude_envelope(attackInput, decayInput, sustainInput, releaseInput);
    mySound.connect(myEnvelope);
    myEnvelope.triggerAttackRelease(durationValue);
    lastNode = myEnvelope; 
  } else {
    mySound.stop("+" + durationValue);
  }

  if (myFilter) {
    lastNode.connect(myFilter);
    myFilter.connect(Tone.Destination);
  } else {
    lastNode.connect(Tone.Destination);
  }
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
  if (myEnvelope) {
    myEnvelope.dispose();
    myEnvelope = null;
  }
  if (myFilter) {
    myFilter.dispose();
    myFilter = null;
  }
}); 

const pianoKeys = document.querySelectorAll(".piano-keys");

pianoKeys.forEach((key, index) => {
  key.addEventListener("mousedown", () => {
    if (Tone.context.state === "closed") {
      Tone.context = new Tone.Context();
    }
    const baseFreqC4 = 261.63; 
    const keyFrequency = baseFreqC4 * Math.pow(2, index / 12);
    main(keyFrequency);
  });
}); 

document.getElementById("modulationFrequency").addEventListener("input", (e) => {
  if (mySound && mySound.harmonicity) {
    const val = parseFloat(e.target.value);
    const useHarmonicity = document.getElementById("harmonicityToggle").checked;
    
    if (useHarmonicity) {
      mySound.harmonicity.value = val;
    } else {
      const freq = parseFloat(document.getElementById("frequencyInput").value);
      mySound.harmonicity.value = val / freq;
    }
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
document.getElementById("filterCutoff").addEventListener("input", (e) => {
  if (myFilter) {
    myFilter.frequency.value = parseFloat(e.target.value);
  }
});

function generate_wave(waveType, frequency, amplitude, duration) {
  if (waveType === "noise") {
    const noise = new Tone.Noise({
      type: "white",
      volume: Tone.gainToDb(amplitude),
    });
    noise.start();
    return noise;
  }

  const osc = new Tone.Oscillator({
    type: waveType,
    frequency: frequency,
    volume: Tone.gainToDb(amplitude),
  });

  osc.start();
  return osc;
}
    
function generate_am_wave(waveType, frequency, amplitude, duration, calculatedHarmonicity, modWave) {
  const osc = new Tone.AMOscillator({
    type: waveType,
    frequency: frequency,
    volume: Tone.gainToDb(amplitude),
    harmonicity: calculatedHarmonicity,
    modulationType: modWave,
  });

  osc.start();
  return osc;
}

function generate_fm_wave(waveType, frequency, amplitude, duration, calculatedHarmonicity, modWave) {
  const osc = new Tone.FMOscillator({
    type: waveType,
    frequency: frequency,
    volume: Tone.gainToDb(amplitude),
    harmonicity: calculatedHarmonicity,
    modulationType: modWave,
    modulationIndex: 10,
  });

  osc.start();
  return osc;
}

function apply_amplitude_envelope(attackInput, decayInput, sustainInput, releaseInput) {
  const ampEnv = new Tone.AmplitudeEnvelope({
    attack: attackInput,
    decay: decayInput,
    sustain: sustainInput,
    release: releaseInput,
  });

  return ampEnv;
}
