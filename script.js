let mySound = null;
let myEnvelope = null;
let myFilter = null;
const activeVoices = {};


async function main(customFrequency = null, keyId = "main") {
  await Tone.start();

  const selectedWave = document.getElementById("selectWave").value;
  const frequencyValue =  customFrequency !== null
    ? customFrequency
    : parseFloat(document.getElementById("frequencyInput").value);
  const amplitudeValue = parseFloat(document.getElementById("amplitudeInput").value);
  const durationValue = parseFloat(document.getElementById("durationInput").value);
  const modulationType = document.querySelector('input[name="modulationType"]:checked').value;
  const modulationFrequency = parseFloat(document.getElementById("modulationFrequency").value);
  const modIntensity = parseFloat(document.getElementById("modulationIntensity").value); 
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

  if (activeVoices[keyId]) {
    const oldVoice = activeVoices[keyId];
    if (oldVoice.sound) { oldVoice.sound.stop(); oldVoice.sound.dispose(); }
    if (oldVoice.env) { oldVoice.env.dispose(); }
    if (oldVoice.filter) { oldVoice.filter.dispose(); }
  }

  mySound = null;
  myEnvelope = null;
  myFilter = null;

  switch (modulationType) {
    case "am":
      mySound = generate_am_wave(selectedWave, frequencyValue, amplitudeValue, durationValue, calculatedHarmonicity, modWave);
      break;
    case "fm":
      mySound = generate_fm_wave(selectedWave, frequencyValue, amplitudeValue, durationValue, calculatedHarmonicity, modWave, modIntensity);
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

  activeVoices[keyId] = { sound: mySound, env: myEnvelope, filter: myFilter };

  console.log(lastNode);
}





document.getElementById("playButton").addEventListener("click", () => {
  if (Tone.context.state === "closed") {
    Tone.context = new Tone.Context();
  }
  main(null, "main");
});


document.getElementById("stopButton").addEventListener("click", () => {
  Object.values(activeVoices).forEach(voice => {
    if (voice.sound) { voice.sound.stop(); voice.sound.dispose(); }
    if (voice.env) voice.env.dispose();
    if (voice.filter) voice.filter.dispose();
  });
  for (let key in activeVoices) delete activeVoices[key];
}); 

const pianoKeys = document.querySelectorAll(".piano-keys");

pianoKeys.forEach((key, index) => {
  key.addEventListener("mousedown", () => {
    key.classList.add("active");
    if (Tone.context.state === "closed") {
      Tone.context = new Tone.Context();
    }
    const baseFreqC4 = 261.63; 
    const keyFrequency = baseFreqC4 * Math.pow(2, index / 12);
    main(keyFrequency);
  });

  key.addEventListener("mouseup", () => key.classList.remove("active"));
  key.addEventListener("mouseleave", () => key.classList.remove("active"));
}); 

const keyboardMap = ['a', 'w', 's', 'e', 'd', 'r', 'f', 'g', 't', 'h', 'y', 'j', 'k', 'u', 'l', 'i', 'ö', 'o', 'ä',"'",'å']; 

document.addEventListener("keydown", (e) => {
  if (e.repeat) return;
  
  const index = keyboardMap.indexOf(e.key.toLowerCase());
  
  if (index !== -1) {
    pianoKeys[index].classList.add("active");
    if (Tone.context.state === "closed") {
      Tone.context = new Tone.Context();
    }
    const baseFreqC4 = 261.63; 
    const keyFrequency = baseFreqC4 * Math.pow(2, index / 12);
    main(keyFrequency, "piano_" + index); 
  }
});

document.addEventListener("keyup", (e) => {
  const index = keyboardMap.indexOf(e.key.toLowerCase());
  if (index !== -1) {
    pianoKeys[index].classList.remove("active");
  }
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

document.getElementById("modulationIntensity").addEventListener("input", (e) => {
  if (mySound && mySound.modulationIndex) {
    mySound.modulationIndex.value = parseFloat(e.target.value);
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

function generate_fm_wave(waveType, frequency, amplitude, duration, calculatedHarmonicity, modWave, modIntensity) {
  const osc = new Tone.FMOscillator({
    type: waveType,
    frequency: frequency,
    volume: Tone.gainToDb(amplitude),
    harmonicity: calculatedHarmonicity,
    modulationType: modWave,
    modulationIndex: modIntensity,
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
