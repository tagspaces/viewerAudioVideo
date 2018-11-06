/* Copyright (c) 2013-present The TagSpaces Authors.
 * Use of this source code is governed by the MIT license which can be found in the LICENSE.txt file. */

/* globals plyr, initI18N, getParameterByName, $, sendMessageToHost */

$(document).ready(() => {
  const locale = getParameterByName('locale');
  const filePath = getParameterByName('file');
  const ext = filePath.split('.').pop().toLowerCase();
  const extensionSupportedFileTypesAudio = ['mp3', 'ogg', 'flac'];
  // const extensionSupportedFileTypesVideo = ['mp4', 'webm', 'ogv', 'm4v'];
  let resume;
  let autoPlayEnabled = true;
  let loop = 'loopAll'; // loopOne, noLoop, loopAll
  let player;

  initI18N(locale, 'ns.viewerAudioVideo.json');

  loadExtSettings();

  loadSprite($(document).find('body'));

  window.addEventListener('resume', (e) => {
    // console.log('Receive resume event', e);
    if (resume) { //  && e.detail === true
      resume = false;
      player.play();
    } else {
      resume = true;
      player.pause();
    }
  });

  function loadSprite(body) {
    const jqxhr = $.get('./libs/plyr/dist/plyr.svg', () => {
      const $el = $('<div/>')
        .css('display', 'none')
        .html(jqxhr.responseText);
      body.prepend($el);
    });
  }

  function initPlayer() {
    const controlsHTML = `<div class='plyr__controls'>
      <button type='button' data-plyr='restart'>
          <svg><use xlink:href='#plyr-restart'></use></svg>
          <span class='plyr__sr-only'>Restart</span>
      </button>
      <button type='button' data-plyr='rewind'>
          <svg><use xlink:href='#plyr-rewind'></use></svg>
          <span class='plyr__sr-only'>Rewind {seektime} secs</span>
      </button>
      <button type='button' data-plyr='play'>
          <svg><use xlink:href='#plyr-play'></use></svg>
          <span class='plyr__sr-only'>Play</span>
      </button>
      <button type='button' data-plyr='pause'>
          <svg><use xlink:href='#plyr-pause'></use></svg>
          <span class='plyr__sr-only'>Pause</span>
      </button>
      <button type='button' data-plyr='fast-forward'>
          <svg><use xlink:href='#plyr-fast-forward'></use></svg>
          <span class='plyr__sr-only'>Forward {seektime} secs</span>
      </button>
      <span class='plyr__progress'>
          <label for='seek{id}' class='plyr__sr-only'>Seek</label>
          <input id='seek{id}' class='plyr__progress--seek' type='range' min='0' max='100' step='0.1' value='0' data-plyr='seek'>
          <progress class='plyr__progress--played' max='100' value='0' role='presentation'></progress>
          <progress class='plyr__progress--buffer' max='100' value='0'>
              <span>0</span>% buffered
          </progress>
          <span class='plyr__tooltip'>00:00</span>
      </span>
      <span class='plyr__time'>
          <span class='plyr__sr-only'>Current time</span>
          <span class='plyr__time--current'>00:00</span>
      </span>
      <span class='plyr__time'>
          <span class='plyr__sr-only'>Duration</span>
          <span class='plyr__time--duration'>00:00</span>
      </span>
      <button type='button' data-plyr='mute'>
          <svg class='icon--muted'><use xlink:href='#plyr-muted'></use></svg>
          <svg><use xlink:href='#plyr-volume'></use></svg>
          <span class='plyr__sr-only'>Toggle Mute</span>
      </button>
      <span class='plyr__volume'>
          <label for='volume{id}' class='plyr__sr-only'>Volume</label>
          <input id='volume{id}' class='plyr__volume--input' type='range' min='0' max='10' value='5' data-plyr='volume'>
          <progress class='plyr__volume--display' max='10' value='0' role='presentation'></progress>
      </span>
      <button type='button' data-plyr='captions'>
          <svg class='icon--captions-on'><use xlink:href='#plyr-captions-on'></use></svg>
          <svg><use xlink:href='#plyr-captions-off'></use></svg>
          <span class='plyr__sr-only'>Toggle Captions</span>
      </button>
      <!--button type='button' data-plyr='fullscreen'>
        <svg class='icon--exit-fullscreen'><use xlink:href='#plyr-exit-fullscreen'></use></svg>
        <svg><use xlink:href='#plyr-enter-fullscreen'></use></svg>
        <span class='plyr__sr-only'>Toggle Fullscreen</span>
      </button-->
    </div>`;

    const options = {
      html: controlsHTML,
      title: 'TagSpaces',
      tooltips: {
        controls: false
      },
      autoplay: autoPlayEnabled,
      captions: {
        defaultActive: true
      },
      hideControls: false,
      keyboardShortcuts: { focused: true, global: false }
    };

    let controls = $('<video controls>');
    if (extensionSupportedFileTypesAudio.indexOf(ext) !== -1) {
      controls = $('<audio controls>');
    }
    controls.append('<source>').attr('src', filePath);
    $(document).find('.js-plyr').append(controls);

    player = plyr.setup('.js-plyr', options)[0];

    // player.autoplay = autoPlayEnabled;

    document.querySelector('.js-plyr').addEventListener('ended', () => {
      if (loop === 'loopOne') {
        player.play();
      } else if (loop === 'noLoop') {
        // player.stop();
      } else {
        sendMessageToHost({ command: 'playbackEnded', filepath: filePath });
      }
    });
  }

  function saveExtSettings() {
    const settings = {
      autoPlayEnabled,
      loop
    };
    localStorage.setItem('viewerAudioVideoSettings', JSON.stringify(settings));
  }

  function loadExtSettings() {
    const extSettings = JSON.parse(localStorage.getItem('viewerAudioVideoSettings'));
    if (extSettings) {
      autoPlayEnabled = extSettings.autoPlayEnabled;
      loop = extSettings.loop;
    }
    // console.log('Settings loaded ap ' + autoPlayEnabled + ' - ' + JSON.stringify(extSettings));
    initPlayer();
    initMenu();
  }

  function initMenu() {
    if (autoPlayEnabled) {
      $('#enableAutoPlay').hide();
      $('#disableAutoPlay').show();
    } else {
      $('#enableAutoPlay').show();
      $('#disableAutoPlay').hide();
    }

    $('#enableAutoPlay').on('click', (e) => {
      e.stopPropagation();
      $('#enableAutoPlay').hide();
      $('#disableAutoPlay').show();
      autoPlayEnabled = true;
      saveExtSettings();
    });

    $('#disableAutoPlay').on('click', (e) => {
      e.stopPropagation();
      $('#disableAutoPlay').hide();
      $('#enableAutoPlay').show();
      autoPlayEnabled = false;
      saveExtSettings();
    });

    switch (loop) {
    case 'loopAll':
      $('#loopAll .fa').removeClass('fa-circle-o').addClass('fa-check-circle-o');
      $('#loopOne .fa').removeClass('fa-check-circle-o').addClass('fa-circle-o');
      $('#noLoop .fa').removeClass('fa-check-circle-o').addClass('fa-circle-o');
      break;
    case 'loopOne':
      $('#loopAll .fa').removeClass('fa-check-circle-o').addClass('fa-circle-o');
      $('#loopOne .fa').removeClass('fa-circle-o').addClass('fa-check-circle-o');
      $('#noLoop .fa').removeClass('fa-check-circle-o').addClass('fa-circle-o');
      break;
    case 'noLoop':
      $('#loopAll .fa').removeClass('fa-check-circle-o').addClass('fa-circle-o');
      $('#loopOne .fa').removeClass('fa-check-circle-o').addClass('fa-circle-o');
      $('#noLoop .fa').removeClass('fa-circle-o').addClass('fa-check-circle-o');
      break;
    default:
      break;
    }

    $('#loopAll').on('click', (e) => {
      e.stopPropagation();
      $('#loopAll .fa').removeClass('fa-circle-o').addClass('fa-check-circle-o');
      $('#loopOne .fa').removeClass('fa-check-circle-o').addClass('fa-circle-o');
      $('#noLoop .fa').removeClass('fa-check-circle-o').addClass('fa-circle-o');
      loop = 'loopAll';
      autoPlayEnabled = false;
      saveExtSettings();
    });

    $('#loopOne').on('click', (e) => {
      e.stopPropagation();
      $('#loopAll .fa').removeClass('fa-check-circle-o').addClass('fa-circle-o');
      $('#loopOne .fa').removeClass('fa-circle-o').addClass('fa-check-circle-o');
      $('#noLoop .fa').removeClass('fa-check-circle-o').addClass('fa-circle-o');
      loop = 'loopOne';
      saveExtSettings();
    });

    $('#noLoop').on('click', (e) => {
      e.stopPropagation();
      $('#loopAll .fa').removeClass('fa-check-circle-o').addClass('fa-circle-o');
      $('#loopOne .fa').removeClass('fa-check-circle-o').addClass('fa-circle-o');
      $('#noLoop .fa').removeClass('fa-circle-o').addClass('fa-check-circle-o');
      loop = 'noLoop';
      saveExtSettings();
    });
  }
});
