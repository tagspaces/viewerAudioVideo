/* Copyright (c) 2015-2016 The TagSpaces Authors.
 * Use of this source code is governed by the MIT license which can be found in the LICENSE.txt file. */

define(function(require , exports , module) {
  "use strict";

  var extensionID = "viewerAudioVideo";  // ID should be equal to the directory name where the ext. is located
  var extensionSupportedFileTypesVideo = ["mp4" , "webm" , "ogv" , "m4v"];
  var extensionSupportedFileTypesAudio = ["mp3" , "ogg"];

  console.log("Loading " + extensionID);

  var TSCORE = require("tscore");
  var extensionDirectory = TSCORE.Config.getExtensionPath() + "/" + extensionID;
  var UI , containerElID , currentFilePath , $containerElement;

  function init(filePath , elementID) {
    console.log("Initalization Audio Video Viewer...");

    filePath = (isCordova || isWeb) ? filePath : "file://" + filePath;

    var $containerElement = $('#' + elementID);
    $containerElement.empty();
    $containerElement.css("background-color" , "white");

    var extPath = extensionDirectory + "/index.html";
    $containerElement.append($('<iframe>' , {
      id: "iframeViewer" ,
      sandbox: "allow-same-origin allow-scripts" ,
      type: "content" ,
      //scrolling: "no",
      style: "background-color: white; overflow: hidden;" ,
      src: extPath ,
      "nwdisable": "" ,
      "nwfaketop": "" ,
      "allowFullScreen": ""
    }).load(function() {
      loadSprite($(this).contents().find("body"));
      var ext = filePath.split(".").pop().toLowerCase();
      var controls = $("<video controls>");
      if (extensionSupportedFileTypesAudio.indexOf(ext) !== -1) {
        controls = $("<audio controls>");
      }
      controls.append("<source>").attr("src" , filePath);
      $(this).contents().find(".js-plyr").append(controls);

      var player = this.contentWindow.plyr.setup('.js-plyr')[0];
      player.play();
    }));
  }

  function loadSprite(body) {
    var jqxhr = $.get(extensionDirectory + "/libs/plyr/dist/sprite.svg" , function() {
      var $el = $("<div/>").css("display" , "none").html(jqxhr.responseText);
      body.prepend($el);
    });
  }

  function viewerMode(isViewerMode) {

    console.log("viewerMode not supported on this extension");
  }

  function setContent(content) {

    console.log("setContent not supported on this extension");
  }

  function getContent() {

    console.log("getContent not supported on this extension");
  }

  exports.init = init;
  exports.getContent = getContent;
  exports.setContent = setContent;
  exports.viewerMode = viewerMode;
  //exports.setFileType = setFileType;

});