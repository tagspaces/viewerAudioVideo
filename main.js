/* Copyright (c) 2013-present The TagSpaces Authors.
 * Use of this source code is governed by the MIT license which can be found in the LICENSE.txt file. */

/* globals marked, plyr */
'use strict';

var isCordova;
var isWin;
var isWeb = (document.URL.startsWith('http') && !document.URL.startsWith('http://localhost:1212/'));

$(document).ready(function() {
  function getParameterByName(name) {
    name = name.replace(/[\[]/ , "\\\[").replace(/[\]]/ , "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)") ,
            results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g , " "));
  }

  var locale = getParameterByName("locale");
  var filePath = getParameterByName("file");

  var extSettings;
  loadExtSettings();

  isCordova = parent.isCordova;
  isWin = parent.isWin;

  // var extensionSupportedFileTypesVideo = ["mp4", "webm", "ogv", "m4v"];
  var extensionSupportedFileTypesAudio = ["mp3", "ogg"];
  loadSprite($(this).contents().find("body"));
  var ext = filePath.split(".").pop().toLowerCase();
  var controls = $("<video controls>");
  var controlsHTML = ["<div class='plyr__controls'>",
    "<button type='button' data-plyr='restart'>",
    "<svg><use xlink:href='#plyr-restart'></use></svg>",
    "<span class='plyr__sr-only'>Restart</span>",
    "</button>",
    "<button type='button' data-plyr='rewind'>",
    "<svg><use xlink:href='#plyr-rewind'></use></svg>",
    "<span class='plyr__sr-only'>Rewind</span>",
    "</button>",
    "<button type='button' data-plyr='play'>",
    "<svg><use xlink:href='#plyr-play'></use></svg>",
    "<span class='plyr__sr-only'>Play</span>",
    "</button>",
    "<button type='button' data-plyr='pause'>",
    "<svg><use xlink:href='#plyr-pause'></use></svg>",
    "<span class='plyr__sr-only'>Pause</span>",
    "</button>",
    "<button type='button' data-plyr='fast-forward'>",
    "<svg><use xlink:href='#plyr-fast-forward'></use></svg>",
    "<span class='plyr__sr-only'>Forward</span>",
    "</button>",
    "<span class='plyr__progress'>",
    "<label for='seek{id}' class='plyr__sr-only'></label>",
    "<input id='seek{id}' class='plyr__progress--seek' type='range' min='0' max='100' step='0.1' value='0' data-plyr='seek'>",
    "<progress class='plyr__progress--played' max='100' value='0' role='presentation'></progress>",
    "<progress class='plyr__progress--buffer' max='100' value='0'>",
    "<span>0</span>% buffered",
    "</progress>",
    "</span>",
    "<span class='plyr__time'>",
    "<span class='plyr__sr-only'></span>",
    "<span class='plyr__time--current'></span>",
    "</span>",
    "<span class='plyr__time'>",
    "<span class='plyr__sr-only'></span>",
    "<span class='plyr__time--duration'></span>",
    "</span>",
    "<button type='button' data-plyr='mute'>",
    "<svg class='icon--muted'><use xlink:href='#plyr-muted'></use></svg>",
    "<svg><use xlink:href='#plyr-volume'></use></svg>",
    "<span class='plyr__sr-only'>Mute</span>",
    "</button>",
    "<span class='plyr__volume'>",
    "<label for='volume{id}' class='plyr__sr-only'></label>",
    "<input id='volume{id}' class='plyr__volume--input' type='range' min='0' max='10' value='5' data-plyr='volume'>",
    "<progress class='plyr__volume--display' max='10' value='0' role='presentation'></progress>",
    "</span>",
    "<button type='button' data-plyr='captions'>",
    "<svg class='icon--captions-on'><use xlink:href='#plyr-captions-on'></use></svg>",
    "<svg><use xlink:href='#plyr-captions-off'></use></svg>",
    "<span class='plyr__sr-only'>Captions</span>",
    "</button>",
    "<button type='button' data-plyr='fullscreen'>",
    "<svg class='icon--exit-fullscreen'><use xlink:href='#plyr-exit-fullscreen'></use></svg>",
    "<svg><use xlink:href='#plyr-enter-fullscreen'></use></svg>",
    "<span class='plyr__sr-only'>Fullscreen</span>",
    "</button>",
    "</div>"].join("");
  var options = {
    html: controlsHTML,
    title: 'TagSpaces',
    tooltips: {
      controls: false
    },
    captions: {
      defaultActive: true
    },
    hideControls: false
  };
  if (extensionSupportedFileTypesAudio.indexOf(ext) !== -1) {
    controls = $("<audio controls>");
  }
  controls.append("<source>").attr("src", filePath);
  $(this).contents().find(".js-plyr").append(controls);

  var player = plyr.setup('.js-plyr', options)[0];
  player.play();
  var resume;
  //Listen to audio custom event
  window.addEventListener('resume', function(e) {
    if (resume === true && e.detail === true) {
      resume = false;
      player.play();
    } else {
      resume = true;
      player.pause();
    }
  });

  function loadSprite(body) {
    var jqxhr = $.get("./libs/plyr/dist/plyr.svg", function() {
      var $el = $("<div/>").css("display", "none").html(jqxhr.responseText);
      body.prepend($el);
    });
  }

  // Init internationalization
  i18next.init({
    ns: {namespaces: ['ns.viewerAudioVideo']} ,
    debug: true ,
    lng: locale ,
    fallbackLng: 'en_US'
  } , function() {
    jqueryI18next.init(i18next, $);
    $('[data-i18n]').localize();
  });

  function saveExtSettings() {
    var settings = {};
    localStorage.setItem('viewerAudioVideoSettings', JSON.stringify(settings));
  }

  function loadExtSettings() {
    extSettings = JSON.parse(localStorage.getItem("viewerAudioVideoSettings"));
  }

  document.querySelector('.js-plyr').addEventListener('ended', function(event) {
    handleVideoEnded();
  });

  function handleVideoEnded() {
    sendMessageToHost({command: 'playbackEnded', filepath: filePath});
  }
});
