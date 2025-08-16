
//   // background music setup （different stream from the microphone） --to be edited
//   const bgm = new Audio('./music.mp3');
//   const bgmSource = audioCtx.createMediaElementSource(bgm);
//   bgm.play();

export async function initAudio(onLoud) {
  const ctx = new AudioContext();
  const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const src = ctx.createMediaStreamSource(micStream);
  const analyser = ctx.createAnalyser();

  src.connect(analyser);
  analyser.fftSize = 512;
  const data = new Uint8Array(analyser.frequencyBinCount);

  let avgVolume = 0; // 平均音量
  const smoothing = 0.05; // EMA 平滑系数
  let fireCooldown = false; // 喷火冷却，避免连续触发
  const cooldownTime = 500; // ms

  function loop() {
    analyser.getByteFrequencyData(data);
    const currentVolume = data.reduce((a, b) => a + b) / data.length;

    // 更新环境平均音量（指数移动平均）
    avgVolume = (1 - smoothing) * avgVolume + smoothing * currentVolume;

    // 当前音量明显高于平均音量时触发喷火
    if (!fireCooldown && currentVolume > avgVolume * 1.5) { // 可以调节 1.5 倍为触发阈值
      onLoud(currentVolume);
      fireCooldown = true;

      // 喷火触发后重新计算平均音量（短期锁定后恢复）
      setTimeout(() => {
        fireCooldown = false;
      }, cooldownTime);
    }

    requestAnimationFrame(loop);
  }

  loop();
}

