async function main() {
  await Tone.start();


  mysound = sine_tone();
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

function sine_tone(frequency = 440, amplitude = 0.5) {
  return new Tone.Oscillator({
    type: "sine",
    frequency: frequency,
    volume: Tone.gainToDb(amplitude),
  }).start();
}



