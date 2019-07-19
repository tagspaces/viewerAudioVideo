/* Copyright (c) 2013-present The TagSpaces Authors.
 * Use of this source code is governed by the MIT license which can be found in the LICENSE.txt file. */

/* globals plyr, initI18N, getParameterByName, $, sendMessageToHost */

//$(document).ready(() => {
document.addEventListener('DOMContentLoaded', () => {
    const locale = getParameterByName('locale');
    const filePath = getParameterByName('file') || 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4';
    const ext = filePath.split('.').pop().toLowerCase();
    const extensionSupportedFileTypesAudio = ['mp3', 'ogg', 'flac'];
    // const extensionSupportedFileTypesVideo = ['mp4', 'webm', 'ogv', 'm4v'];
    let resume;
    let autoPlayEnabled = true;
    let loop = 'loopAll'; // loopOne, noLoop, loopAll
    let player;

    initI18N(locale, 'ns.viewerAudioVideo.json');

    loadExtSettings();
    initPlayer();
    initMenu();

    //loadSprite($(document).find('body'));

    /*window.addEventListener('resume', (e) => {
      // console.log('Receive resume event', e);
      if (resume) { //  && e.detail === true
        resume = false;
        player.play();
      } else {
        resume = true;
        player.pause();
      }
    });*/

    /*function loadSprite(body) {
      const jqxhr = $.get('./libs/plyr/dist/plyr.svg', () => {
        const $el = $('<div/>')
          .css('display', 'none')
          .html(jqxhr.responseText);
        body.prepend($el);
      });
    }*/

    function initPlayer() {
        /*const controls = `<div class="plyr__controls">
    <button type="button" class="plyr__control" data-plyr="restart">
        <svg role="presentation"><use xlink:href="#plyr-restart"></use></svg>
        <span class="plyr__tooltip" role="tooltip">Restart</span>
      </button>
    <button type="button" class="plyr__control" data-plyr="rewind">
        <svg role="presentation"><use xlink:href="#plyr-rewind"></use></svg>
        <span class="plyr__tooltip" role="tooltip">Rewind {seektime} secs</span>
      </button>
    <button type="button" class="plyr__control" aria-label="Play, {title}" data-plyr="play">
        <svg class="icon--pressed" role="presentation"><use xlink:href="#plyr-pause"></use></svg>
        <svg class="icon--not-pressed" role="presentation"><use xlink:href="#plyr-play"></use></svg>
        <span class="label--pressed plyr__tooltip" role="tooltip">Pause</span>
        <span class="label--not-pressed plyr__tooltip" role="tooltip">Play</span>
      </button>
    <button type="button" class="plyr__control" data-plyr="fast-forward">
        <svg role="presentation"><use xlink:href="#plyr-fast-forward"></use></svg>
        <span class="plyr__tooltip" role="tooltip">Forward {seektime} secs</span>
      </button>
    <div class="plyr__progress">
        <input data-plyr="seek" type="range" min="0" max="100" step="0.01" value="0" aria-label="Seek">
        <progress class="plyr__progress__buffer" min="0" max="100" value="0">% buffered</progress>
        <span role="tooltip" class="plyr__tooltip">00:00</span>
    </div>
    <div class="plyr__time plyr__time--current" aria-label="Current time">00:00</div>
    <div class="plyr__time plyr__time--duration" aria-label="Duration">00:00</div>
    <button type="button" class="plyr__control" aria-label="Mute" data-plyr="mute">
        <svg class="icon--pressed" role="presentation"><use xlink:href="#plyr-muted"></use></svg>
        <svg class="icon--not-pressed" role="presentation"><use xlink:href="#plyr-volume"></use></svg>
        <span class="label--pressed plyr__tooltip" role="tooltip">Unmute</span>
        <span class="label--not-pressed plyr__tooltip" role="tooltip">Mute</span>
      </button>
    <div class="plyr__volume">
        <input data-plyr="volume" type="range" min="0" max="1" step="0.05" value="1" autocomplete="off" aria-label="Volume">
    </div>
    <button type="button" class="plyr__control" data-plyr="captions">
        <svg class="icon--pressed" role="presentation"><use xlink:href="#plyr-captions-on"></use></svg>
        <svg class="icon--not-pressed" role="presentation"><use xlink:href="#plyr-captions-off"></use></svg>
        <span class="label--pressed plyr__tooltip" role="tooltip">Disable captions</span>
        <span class="label--not-pressed plyr__tooltip" role="tooltip">Enable captions</span>
    </button>
    <button type="button" class="plyr__control" data-plyr="fullscreen">
        <svg class="icon--pressed" role="presentation"><use xlink:href="#plyr-exit-fullscreen"></use></svg>
        <svg class="icon--not-pressed" role="presentation"><use xlink:href="#plyr-enter-fullscreen"></use></svg>
        <span class="label--pressed plyr__tooltip" role="tooltip">Exit fullscreen</span>
        <span class="label--not-pressed plyr__tooltip" role="tooltip">Enter fullscreen</span>
      </button>
    </div>`;*/

        const options = {
            //controls,
            controls: [
                //'play-large', // The large play button in the center
                'restart', // Restart playback
                'rewind', // Rewind by the seek time (default 10 seconds)
                'play', // Play/pause playback
                'fast-forward', // Fast forward by the seek time (default 10 seconds)
                'progress', // The progress bar and scrubber for playback and buffering
                'current-time', // The current time of playback
                'duration', // The full duration of the media
                'mute', // Toggle mute
                'volume', // Volume control
                'captions', // Toggle captions
                //'settings', // Settings menu
                //'pip', // Picture-in-picture (currently Safari only)
                //'airplay', // Airplay (currently Safari only)
                //'download', // Show a download button with a link to either the current source or a custom URL you specify in your options
                //'fullscreen', // Toggle fullscreen
            ],
            title: 'TagSpaces',
            tooltips: {
                controls: false
            },
            autoplay: autoPlayEnabled,
            captions: {
                defaultActive: true
            },
            hideControls: false,
            //keyboardShortcuts: { focused: true, global: false }
            fullscreen: { enabled: false }
        };

        let fileSource = $('<video controls id="player">');
        if (extensionSupportedFileTypesAudio.indexOf(ext) !== -1) {
            fileSource = $('<audio controls id="player">');
        }
        fileSource.append('<source>').attr('src', filePath);
        $(document).find('.js-plyr').append(fileSource);

        player = new Plyr('#player', options); // plyr.setup('.js-plyr', options)[0];

        player.on('ended', event => {
            if (loop === 'loopOne') {
                player.play();
            } else if (loop === 'noLoop') {
                // player.stop();
            } else {
                sendMessageToHost({ command: 'playbackEnded', filepath: filePath });
            }
        });
        /*document.querySelector('.js-plyr').addEventListener('ended', () => {
          if (loop === 'loopOne') {
            // player.play(); // player.fullscreen.enter();
          } else if (loop === 'noLoop') {
            // player.stop();
          } else {
            sendMessageToHost({ command: 'playbackEnded', filepath: filePath });
          }
        });*/
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
