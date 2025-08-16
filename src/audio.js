
//   // background music setup （different stream from the microphone） --to be edited
//   const bgm = new Audio('./music.mp3');
//   const bgmSource = audioCtx.createMediaElementSource(bgm);
//   bgm.play();

  let fireCooldown = false; // 喷火冷却，避免连续触发
  export function isFireCooldown() {
    return fireCooldown;
  }

export async function initAudio(onLoud) {
  const ctx = new AudioContext();
  const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const src = ctx.createMediaStreamSource(micStream);
  const analyser = ctx.createAnalyser();

  src.connect(analyser);
  analyser.fftSize = 512;
  const data = new Uint8Array(analyser.frequencyBinCount);


  const cooldownTime = 500; // ms
  const threshold = 40;

  function loop() {
    analyser.getByteFrequencyData(data);
    const currentVolume = data.reduce((a, b) => a + b) / data.length;


    // 当前音量明显高于平均音量时触发喷火
    if (!fireCooldown && currentVolume > threshold) { 

      fireCooldown = true;
      onLoud();

      // 喷火触发后重新计算平均音量（短期锁定后恢复）
      setTimeout(() => {
        fireCooldown = false;
      }, cooldownTime);
    }

    requestAnimationFrame(loop);
  }

  loop();
}

