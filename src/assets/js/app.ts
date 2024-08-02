import confetti from 'canvas-confetti';
import Slot from '@js/Slot';
import * as XLSX from 'xlsx';
import SoundEffects from '@js/SoundEffects';

// Initialize slot machine
(() => {
  const drawButton = document.getElementById('draw-button') as HTMLButtonElement | null;
  const fullscreenButton = document.getElementById('fullscreen-button') as HTMLButtonElement | null;
  const settingsButton = document.getElementById('settings-button') as HTMLButtonElement | null;
  const settingsWrapper = document.getElementById('settings') as HTMLDivElement | null;
  // const reelContainer = document.getElementById('reel') as HTMLDivElement | null;
  const settingsContent = document.getElementById('settings-panel') as HTMLDivElement | null;
  const settingsSaveButton = document.getElementById('settings-save') as HTMLButtonElement | null;
  const settingsCloseButton = document.getElementById('settings-close') as HTMLButtonElement | null;
  const sunburstSvg = document.getElementById('sunburst') as HTMLImageElement | null;
  const fileInput = document.querySelector('#spreadsheet') as HTMLInputElement | null;
  const confettiCanvas = document.getElementById('confetti-canvas') as HTMLCanvasElement | null;
  const input = document.querySelector('.iteration') as HTMLInputElement;
  // const nameListTextArea = document.getElementById('name-list') as HTMLTextAreaElement | null;
  const removeNameFromListCheckbox = document.getElementById('remove-from-list') as HTMLInputElement | null;
  const enableSoundCheckbox = document.getElementById('enable-sound') as HTMLInputElement | null;
  const nameElement = document.getElementById('name-display') as HTMLInputElement | null;
  const winnerElement = document.getElementById('winner-display') as HTMLInputElement | null;


  // function that animates names to fadeIn and fadeOut
  const reelAnimation =  () => {

    const audio = new Audio('images/drum-roll-please-6386.mp3');
    audio.play();

    const soundEffects = new SoundEffects()
    const duration = input.value? Number(input.value) : 1
    const animationDuration = duration * 60 * 1000;
    drawButton!.disabled = true;
    let currentIndex: number = 0;
    settingsButton!.disabled = true;
    soundEffects.play(duration)
  
    let startTime = Date.now();
    const shuffledArray = slot.names.sort(() => 0.5 - Math.random())
    winnerElement!.textContent = '';
    let intervalId: ReturnType<typeof setTimeout> | undefined;
    stopWinningAnimation();


  function updateDisplay() {
      const elapsedTime = Date.now() - startTime;

      if (elapsedTime < animationDuration) {
          // Display random name from the list
          nameElement!.classList.remove('fade-in', 'fade-out');
          nameElement!.textContent = shuffledArray[currentIndex];
          nameElement!.classList.add('fade-in');

          setTimeout(() => {
            nameElement!.classList.remove('fade-in');
            nameElement!.classList.add('fade-out');
        }, 1000);

        currentIndex = (currentIndex + 1) % shuffledArray.length;

      } else {
          // Stop animation and display winner
          console.log('in elasped time')
          clearInterval(intervalId);
          onSpinEnd()
          const winnerIndex = Math.floor(Math.random() * slot.names.length);
          winnerElement!.textContent = `${slot.names[winnerIndex]}`; 
          nameElement!.textContent = '';
      }
  }
  // Update the display every 100ms
  intervalId = setInterval(updateDisplay, 600);

  // Stop the animation after the specified duration
  setTimeout(() => {
      clearInterval(intervalId);
  }, animationDuration);

}


  // Graceful exit if necessary elements are not found
  if (!(
    drawButton
    && fullscreenButton
    && settingsButton
    && settingsWrapper
    && settingsContent
    && settingsSaveButton
    && settingsCloseButton
    && sunburstSvg
    && confettiCanvas
    // && nameListTextArea
    && removeNameFromListCheckbox
    && enableSoundCheckbox
  )) {
    console.error('One or more Element ID is invalid. This is possibly a bug.');
    return;
  }

  if (!(confettiCanvas instanceof HTMLCanvasElement)) {
    console.error('Confetti canvas is not an instance of Canvas. This is possibly a bug.');
    return;
  }

  const soundEffects = new SoundEffects();
  const MAX_REEL_ITEMS = 40;
  const CONFETTI_COLORS = ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff'];
  let confettiAnimationId;

  /** Confeetti animation instance */
  const customConfetti = confetti.create(confettiCanvas, {
    resize: true,
    useWorker: true
  });

  /** Triggers cconfeetti animation until animation is canceled */
  const confettiAnimation = () => {
    const windowWidth = window.innerWidth || document.documentElement.clientWidth || document.getElementsByTagName('body')[0].clientWidth;
    const confettiScale = Math.max(0.5, Math.min(1, windowWidth / 1100));

    customConfetti({
      particleCount: 1,
      gravity: 0.8,
      spread: 90,
      origin: { y: 0.6 },
      colors: [CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]],
      scalar: confettiScale
    });

    confettiAnimationId = window.requestAnimationFrame(confettiAnimation);
  };

  /** Function to stop the winning animation */
  const stopWinningAnimation = () => {
    if (confettiAnimationId) {
      window.cancelAnimationFrame(confettiAnimationId);
    }
    sunburstSvg.style.display = 'none';
  };

  /**  Function to be trigger before spinning */
  const onSpinStart = () => {
    stopWinningAnimation();
    drawButton.disabled = true;
    settingsButton.disabled = true;
    soundEffects.spin((MAX_REEL_ITEMS - 1) / 10);
  };

  /**  Functions to be trigger after spinning */
  const onSpinEnd = async () => {
    confettiAnimation();
    sunburstSvg.style.display = 'block';
    await soundEffects.win();
    drawButton.disabled = false;
    settingsButton.disabled = false;
  };


  // function to display names above raffle
  const showNames = (names) => {
    const nameWrapper = document.querySelector('.name__list');
    nameWrapper!.innerHTML = 
      `<ul>
        ${names.map((item) => (
          `<li>${item}</li>`
        )).join('')}
      </ul>`
  }


  /** Slot instance */
  const slot = new Slot({
    reelContainerSelector: '#reell',
    maxReelItems: MAX_REEL_ITEMS,
    onSpinStart,
    onSpinEnd,
    onNameListChanged: stopWinningAnimation
  });

  /** To open the setting page */
  const onSettingsOpen = () => {
    // nameListTextArea.value = slot.names.length ? slot.names.join('\n') : '';
    removeNameFromListCheckbox.checked = slot.shouldRemoveWinnerFromNameList;
    enableSoundCheckbox.checked = !soundEffects.mute;
    settingsWrapper.style.display = 'block';
  };

  /** To close the setting page */
  const onSettingsClose = () => {
    settingsContent.scrollTop = 0;
    settingsWrapper.style.display = 'none';
  };


  // Click handler for "Draw" button
  drawButton.addEventListener('click', () => {
    if (!slot.names.length) {
      onSettingsOpen();
      return;
    }
    // slot.spin();
    reelAnimation()
  });

  // Hide fullscreen button when it is not supported
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - for older browsers support
  if (!(document.documentElement.requestFullscreen && document.exitFullscreen)) {
    fullscreenButton.remove();
  }

  // Click handler for "Fullscreen" button
  fullscreenButton.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      return;
    }

    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  });


  // Click handler for "Settings" button
  settingsButton.addEventListener('click', onSettingsOpen);

  // Click handler for "Save" button for setting page
  settingsSaveButton.addEventListener('click', () => {

    //conditional statement for file input
    if (fileInput?.files && fileInput.files.length > 0) {
      const file = fileInput.files[0]
      const reader = new FileReader()

      if (file.type === 'text/csv') {
        reader.onload = (e) => {
          const text = e.target!.result as string
          const lines = text.split('\n');
          const nameList = lines.map(line => line.replace(/\r/g, ''));
          slot.names = nameList
          showNames(slot.names)
        }
        reader.readAsText(file)

      } else if ('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {

        reader.onload = (e => {
          type Row = (string)[];
          type SheetData = Row[];
      
          const data = new Uint8Array(e.target!.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json: SheetData = XLSX.utils.sheet_to_json(worksheet, {header: 1});
          const names = json.map(row => row[0]);
          slot.names = names
          showNames(slot.names)
        })
        reader.readAsArrayBuffer(file);
      }
    }
    // slot.names = nameListTextArea.value
    //   ? nameListTextArea.value.split(/\n/).filter((name) => Boolean(name.trim()))
    //   : [];
    slot.shouldRemoveWinnerFromNameList = removeNameFromListCheckbox.checked;    
    soundEffects.mute = !enableSoundCheckbox.checked;
    onSettingsClose();
  });

  // Click handler for "Discard and close" button for setting page
  settingsCloseButton.addEventListener('click', onSettingsClose);
})();