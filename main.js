/* Copyright (c) 2013-present The TagSpaces Authors.
 * Use of this source code is governed by the MIT license which can be found in the LICENSE.txt file. */

/* globals plyr, initI18N, getParameterByName, $, sendMessageToHost */
'use strict';

$(document).ready(() => {
  const locale = getParameterByName('locale');
  const filePath = getParameterByName('file');
  initI18N(locale, 'ns.viewerAudioVideo.json');

  let extSettings;
  loadExtSettings();

  // var extensionSupportedFileTypesVideo = ['mp4', 'webm', 'ogv', 'm4v'];
  const extensionSupportedFileTypesAudio = ['mp3', 'ogg'];

  let resume, currentAutoPlay = true, currentLoopOne = false, currentLoopAll = false, currentNoLoop = false;

  if (extSettings && extSettings.autoPlay) {
    currentAutoPlay = extSettings.autoPlay;
  }
  if (extSettings && extSettings.loopOne) {
    currentLoopOne = extSettings.loopOne;
  }
  if (extSettings && extSettings.loopAll) {
    currentLoopAll = extSettings.loopAll;
  }
  if (extSettings && extSettings.noLoop) {
    currentLoopAll = extSettings.noLoop;
  }

  function saveExtSettings() {
    const settings = {
      'autoPlay': currentAutoPlay,
      'loopOne': currentLoopOne,
      'loopAll': currentLoopAll,
      'noLoop': currentNoLoop
    };
    localStorage.setItem('viewerAudioVideoSettings', JSON.stringify(settings));
    console.log('saveExtSettings');
    console.log(settings);
  }

  function loadExtSettings() {
    extSettings = JSON.parse(localStorage.getItem('viewerAudioVideoSettings'));
  }

  loadSprite(
    $(document).find('body')
  );
  const ext = filePath
    .split('.')
    .pop()
    .toLowerCase();
  let controls = $('<video controls>');

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
    captions: {
      defaultActive: true
    },
    hideControls: false,
    keyboardShortcuts: { focused: true, global: false }
  };
  if (extensionSupportedFileTypesAudio.indexOf(ext) !== -1) {
    controls = $('<audio controls>');
  }
  controls.append('<source>').attr('src', filePath);

  $(document).find('.js-plyr').append(controls);

  const player = plyr.setup('.js-plyr', options)[0];
  // player.play();

  window.addEventListener('resume', (e) => {
    // console.log('Receive resume event', e);
    if (resume === true && e.detail === true) {
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

  document.querySelector('.js-plyr').addEventListener('loadstart', () => {
    if (currentAutoPlay) {
      $('.fa-play-circle-o').addClass('indication');
      player.play();
    } else {
      $('.fa-stop-circle-o').addClass('indication');
      player.stop();
    }

    if (currentLoopOne) {
      $('.fa-play-circle').addClass('indication');
      player.play();
    }

    if (currentLoopAll) {
      $('.fa-repeat').addClass('indication');
      player.play();
    }

    if (currentNoLoop) {
      $('.fa-play').addClass('indication');
      player.stop();
    }
  });

  document.querySelector('.js-plyr').addEventListener('ended', () => {
    if (currentAutoPlay) {
      player.restart();
      player.play();
    } else {
      player.stop();
      sendMessageToHost({ command: 'playbackEnded', filepath: filePath });
    }

    if (currentLoopOne) {
      player.play();
    }

    if (currentNoLoop) {
      player.stop();
    }
  });

  $('#disableAutoPlay').on('click', (e) => {
    e.stopPropagation();
    $('.fa-play-circle-o').removeClass('indication');
    $('.fa-play-circle').removeClass('indication');
    $('.fa-play').removeClass('indication');
    $('.fa-repeat').removeClass('indication');
    // $('#disableAutoPlay').hide();
    // $('#enableAutoPlay').show();
    $('.fa-stop-circle-o').addClass('indication');
    currentAutoPlay = false;
    currentLoopAll = false;
    currentLoopOne = false;
    currentNoLoop = false;
    saveExtSettings();
  });

  $('#enableAutoPlay').on('click', (e) => {
    e.stopPropagation();
    $('.fa-stop-circle-o').removeClass('indication');
    $('.fa-play-circle').removeClass('indication');
    $('.fa-play').removeClass('indication');
    $('.fa-repeat').removeClass('indication');
    // $('#enableAutoPlay').hide();
    // $('#disableAutoPlay').show();
    $('.fa-play-circle-o').addClass('indication');
    currentAutoPlay = true;
    currentLoopAll = false;
    currentLoopOne = false;
    currentNoLoop = false;
    player.restart();
    player.play();
    saveExtSettings();
  });

  $('#loopAll').on('click', (e) => {
    e.stopPropagation();
    $('.fa-play-circle-o').removeClass('indication');
    $('.fa-stop-circle-o').removeClass('indication');
    $('.fa-play-circle').removeClass('indication');
    $('.fa-play').removeClass('indication');
    $('.fa-repeat').addClass('indication');
    player.play();
    currentLoopAll = true;
    currentLoopOne = false;
    currentAutoPlay = false;
    currentNoLoop = false;
    saveExtSettings();
  });

  $('#loopOne').on('click', (e) => {
    e.stopPropagation();
    $('.fa-play-circle-o').removeClass('indication');
    $('.fa-stop-circle-o').removeClass('indication');
    $('.fa-repeat').removeClass('indication');
    $('.fa-play').removeClass('indication');
    $('.fa-play-circle').addClass('indication');
    currentLoopOne = true;
    currentLoopAll = false;
    currentAutoPlay = false;
    currentNoLoop = false;
    saveExtSettings();
  });

  $('#noLoop').on('click', (e) => {
    e.stopPropagation();
    $('.fa-play-circle-o').removeClass('indication');
    $('.fa-stop-circle-o').removeClass('indication');
    $('.fa-repeat .fa-lg').removeClass('indication');
    $('.fa-play-circle').removeClass('indication');
    $('.fa-play').addClass('indication');
    currentAutoPlay = false;
    currentLoopOne = false;
    currentLoopAll = false;
    currentNoLoop = true;
    player.stop();
    saveExtSettings();
  });
});
