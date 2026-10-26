(() => {
  'use strict';

  const tracks = [
    {title: 'Mickey', file: 'mickey.mp3'},
    {title: 'Mickey (1)', file: 'mickey-1.mp3'},
    {title: 'Mickey (2)', file: 'mickey-2.mp3'},
    {title: 'Mickey (4)', file: 'mickey-4.mp3'},
    {title: "Mickey's Plan", file: 'mickeys-plan.mp3'}
  ];
  const audio = document.getElementById('music-audio');
  const toggle = document.getElementById('music-toggle');
  const selector = document.getElementById('music-track');
  const status = document.getElementById('music-status');
  const storageKey = 'mickey-cat-music-muted';
  let muted = false;
  let index = 0;
  let playRequest = 0;
  let pending = false;
  let waitingForGesture = true;

  // Music remains usable when browser privacy settings disable local storage.
  try { muted = localStorage.getItem(storageKey) === 'true'; } catch {}
  audio.muted = muted;
  audio.volume = 0.65;

  function rememberMute() {
    try { localStorage.setItem(storageKey, String(muted)); } catch {}
  }

  function render(message) {
    toggle.textContent = muted ? 'Unmute music' : audio.paused ? 'Play music' : 'Mute music';
    selector.value = String(index);
    status.textContent = message || `${muted ? 'Music muted' : audio.paused ? 'Music paused' : 'Playing'} · Track ${index + 1} of ${tracks.length} · Playlist repeats`;
  }

  async function play() {
    if (muted || pending) return;
    const request = ++playRequest;
    pending = true;
    audio.muted = false;
    render(`Starting ${tracks[index].title}…`);
    try {
      // Call directly in the gesture handler so phones can authorize playback.
      await audio.play();
      if (request !== playRequest) return;
      pending = false;
      waitingForGesture = false;
      render();
    } catch (error) {
      if (request !== playRequest) return;
      pending = false;
      waitingForGesture = error.name === 'NotAllowedError';
      render(waitingForGesture
        ? 'Tap Play music or interact with Mickey to start. All 5 tracks repeat.'
        : 'Music could not start. Tap Play music to retry, or choose another track.');
    }
  }

  function selectTrack(nextIndex) {
    ++playRequest;
    pending = false;
    audio.pause();
    index = nextIndex;
    audio.src = new URL(`./music/${tracks[index].file}`, document.baseURI).href;
    render();
    if (!muted) void play();
  }

  toggle.addEventListener('click', () => {
    if (!muted && !audio.paused) {
      muted = true;
      ++playRequest;
      pending = false;
      audio.muted = true;
      audio.pause();
      rememberMute();
      render();
    } else {
      muted = false;
      rememberMute();
      void play();
    }
  });

  selector.addEventListener('change', () => selectTrack(Number(selector.value)));
  // Advance on the real end of each song, and wrap the last song to the first.
  // The audio element itself must not loop, or it would repeat only one track.
  audio.addEventListener('ended', () => selectTrack((index + 1) % tracks.length));
  audio.addEventListener('playing', () => {
    waitingForGesture = false;
    render();
  });
  audio.addEventListener('pause', () => render());
  audio.addEventListener('error', () => {
    render('This track could not load. Choose another track or tap Play music to retry.');
  });

  function unlockFromGesture(event) {
    if (muted || !waitingForGesture || event.target.closest?.('#music-controls')) return;
    if (event.type === 'keydown' && (event.key === 'Tab' || event.ctrlKey || event.metaKey || event.altKey)) return;
    void play();
  }
  document.addEventListener('click', unlockFromGesture);
  document.addEventListener('touchend', unlockFromGesture, {passive: true});
  document.addEventListener('keydown', unlockFromGesture);

  // Autoplay where permitted; otherwise the button or first interaction starts it.
  // A saved mute choice is honored before any playback attempt.
  selectTrack(0);
})();
