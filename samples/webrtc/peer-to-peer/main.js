var mediaParams, caller, opponent;

QB.init(QBApp.appId, QBApp.authKey, QBApp.authSecret);

$(document).ready(function() {
  $('#loginUser1').on('click', function() {
    createSession(QBUser1, QBUser2);
  });

  $('#loginUser2').on('click', function() {
    createSession(QBUser2, QBUser1);
  });

  $('#audiocall').on('click', function() {
    mediaParams = {
      audio: true,
      elemId: 'localVideo',
      options: { muted: true }
    };
    QB.webrtc.getUserMedia(mediaParams, function(err, stream) {
      if (err) {
        console.log(err);
        $('#infoMessage').text('Devices are not found');
      } else {
        $('.btn_mediacall, #hangup').removeAttr('disabled');
        $('#audiocall, #videocall').attr('disabled', 'disabled');
        $('#infoMessage').text('Calling...');
        $('#callingSignal')[0].play();
        QB.webrtc.call(opponent.id, 'audio');
      }
    });
  });

  $('#videocall').on('click', function() {
    mediaParams = {
      audio: true,
      video: true,
      elemId: 'localVideo',
      options: {
        muted: true,
        mirror: true
      }
    };
    QB.webrtc.getUserMedia(mediaParams, function(err, stream) {
      if (err) {
        console.log(err);
        $('#infoMessage').text('Devices are not found');
      } else {
        $('.btn_mediacall, #hangup').removeAttr('disabled');
        $('#audiocall, #videocall').attr('disabled', 'disabled');
        $('#infoMessage').text('Calling...');
        $('#callingSignal')[0].play();
        QB.webrtc.call(opponent.id, 'video');
      }
    });
  });

  $('#accept').on('click', function() {
    $('#incomingCall').modal('hide');
    $('#ringtoneSignal')[0].pause();
    QB.webrtc.getUserMedia(mediaParams, function(err, stream) {
      if (err) {
        console.log(err);
        $('#infoMessage').text('Devices are not found');
        QB.webrtc.reject(opponent.id);
      } else {
        $('.btn_mediacall, #hangup').removeAttr('disabled');
        $('#audiocall, #videocall').attr('disabled', 'disabled');
        QB.webrtc.accept(opponent.id);
      }
    });
  });

  $('#reject').on('click', function() {
    $('#incomingCall').modal('hide');
    $('#ringtoneSignal')[0].pause();
    QB.webrtc.reject(opponent.id);
  });

  $('#hangup').on('click', function() {
    $('.btn_mediacall, #hangup').attr('disabled', 'disabled');
    $('#audiocall, #videocall').removeAttr('disabled');
    $('video').attr('src', '');
    $('#callingSignal')[0].pause();
    $('#endCallSignal')[0].play();
    QB.webrtc.stop(opponent.id, 'manually');
  });

  $('.btn_camera_off').on('click', function() {
    var action = $(this).data('action');
    if (action === 'mute') {
      $(this).addClass('off').data('action', 'unmute');
      QB.webrtc.mute('video');
    } else {
      $(this).removeClass('off').data('action', 'mute');
      QB.webrtc.unmute('video');
    }
  });

  $('.btn_mic_off').on('click', function() {
    var action = $(this).data('action');
    if (action === 'mute') {
      $(this).addClass('off').data('action', 'unmute');
      QB.webrtc.mute('audio');
    } else {
      $(this).removeClass('off').data('action', 'mute');
      QB.webrtc.unmute('audio');
    }
  });
});

QB.webrtc.onCallListener = function(id, extension) {
  console.log(extension);
  mediaParams = {
    audio: true,
    video: extension.callType === 'video' ? true : false,
    elemId: 'localVideo',
    options: {
      muted: true,
      mirror: true
    }
  };

  $('.incoming-callType').text(extension.callType === 'video' ? 'Video' : 'Audio');
  $('.caller').text(opponent.full_name);
  $('#ringtoneSignal')[0].play();

  $('#incomingCall').modal({
    backdrop: 'static',
    keyboard: false
  });
};

QB.webrtc.onAcceptCallListener = function(id, extension) {
  console.log(extension);
  $('#callingSignal')[0].pause();
  $('#infoMessage').text(opponent.full_name + ' has accepted this call');
};

QB.webrtc.onRejectCallListener = function(id, extension) {
  console.log(extension);
  $('.btn_mediacall, #hangup').attr('disabled', 'disabled');
  $('#audiocall, #videocall').removeAttr('disabled');
  $('video').attr('src', '');
  $('#callingSignal')[0].pause();
  $('#infoMessage').text(opponent.full_name + ' has rejected this call');
};

QB.webrtc.onStopCallListener = function(id, extension) {
  console.log(extension);
  $('#infoMessage').text('Call was stoped');
  $('.btn_mediacall, #hangup').attr('disabled', 'disabled');
  $('#audiocall, #videocall').removeAttr('disabled');
  $('video').attr('src', '');
  $('#endCallSignal')[0].play();
};

QB.webrtc.onRemoteStreamListener = function(stream) {
  QB.webrtc.attachMediaStream('remoteVideo', stream);
};

function createSession(newCaller, newCallee) {
  $('.login').addClass('hidden');
  $('.connecting').removeClass('hidden');
  $('#infoMessage').text('Creating QB session...');
  QB.createSession(QBUser1, function(err, res) {
    if (res) {
      caller = newCaller;
      opponent = newCallee;
      connectChat();
    }
  });
}

function connectChat() {
  $('#infoMessage').text('Connecting to chat...');
  QB.chat.connect({
    jid: QB.chat.helpers.getUserJid(caller.id, QBApp.appId),
    password: caller.password
  }, function(err, res) {
    $('.connecting').addClass('hidden');
    $('.chat').removeClass('hidden');
    $('#infoMessage').text('Make a call to your opponent');
  })
}
