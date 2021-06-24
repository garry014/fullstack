'use strict'
var fd;

let log = console.log.bind(console),
  id = val => document.getElementById(val),
  ul = id('ul'),
  gUMbtn = id('gUMbtn'),
  start = id('startaudio'),
  stop = id('stop'),
  submitSect = id('submitSect'),
  btns = id('btns'),
  recordmsg = id('recordmsg'),
  recordWarning = id('recordWarning'),
  stream,
  recorder,
  counter=1,
  chunks,
  media;


gUMbtn.onclick = e => {
  restartRec();
  let mv = id('mediaVideo'),
      mediaOptions = {
        video: {
          tag: 'video',
          type: 'video/webm',
          ext: '.mp4',
          gUM: {video: true, audio: true}
        },
        audio: {
          tag: 'audio',
          type: 'audio/ogg',
          ext: '.ogg',
          gUM: {audio: true}
        }
      };
  media = mv.checked ? mediaOptions.video : mediaOptions.audio;
  navigator.mediaDevices.getUserMedia(media.gUM).then(_stream => {
    stream = _stream;
    btns.style.display = 'inherit';
    start.removeAttribute('disabled');
    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = e => {
      chunks.push(e.data);
      if(recorder.state == 'inactive')  makeLink();
    };
    log('got media successfully');
  }).catch(log);
}


start.onclick = e => {
  start.disabled = true;
  stop.removeAttribute('disabled');
  stop.style.display = "block";
  start.style.display = "none";
  recordmsg.innerHTML = 'Recording...';
  chunks=[];
  startTimer();
  recorder.start();
}


stop.onclick = e => {
  stop.disabled = true;
  start.style.display = "block";
  stop.style.display = "none";
  submitSect.style.display = "block";
  btns.style.display = "none";
  recorder.stop();
  start.removeAttribute('disabled');
  stopTimer();
}

function makeLink(){
  var lis = $("#ul li");
  if(lis.length > 0) {
    lis.eq(lis.length - 1).remove();
  }
  let blob = new Blob(chunks, {type: media.type })
    , url = URL.createObjectURL(blob)
    , li = document.createElement('li')
    , mt = document.createElement(media.tag)
  ;
  mt.controls = true;
  mt.src = url;
  li.appendChild(mt);
  ul.appendChild(li);

  document.getElementById("audiourl").value = url;
  
  //console.log(blob);
  var myBlob = new Blob(["This is my blob content"], {type : "text/plain"});
  fd = new FormData();
  fd.append('upl', myBlob, url);

  //alert(url);
}

function sendAud(){
  fetch('/inbox/uploadaud',
  {
      method: 'post',
      body: fd
  }); 
}

var currentmic;
navigator.permissions.query({name:'microphone'}).then(function(result) {
  currentmic = result.state;
  result.onchange = function() {
    currentmic = result.state;
    restartRec();
  };
});

// Timer Counter
var minutesLabel = document.getElementById("minutes");
var secondsLabel = document.getElementById("seconds");
var totalSeconds = 0;
var timerContinue = false;
setInterval(setTime, 1000);

function setTime() {
  if(timerContinue){
    ++totalSeconds;
    secondsLabel.innerHTML = pad(totalSeconds % 60);
    minutesLabel.innerHTML = pad(parseInt(totalSeconds / 60));
  }
}

function pad(val) {
  var valString = val + "";
  if (valString.length < 2) {
    return "0" + valString;
  } else {
    return valString;
  }
}

function startTimer(){
  totalSeconds = 0;
  timerContinue = true;
  var lis = $("#ul li");
  if(lis.length > 0) {
    lis.eq(lis.length - 1).remove();
  }
}

function stopTimer(){
  timerContinue = false;
}

function restartRec(){
  if(currentmic == "granted"){
    totalSeconds = 0;
    timerContinue = false;
    secondsLabel.innerHTML = "00";
    minutesLabel.innerHTML = "00";
    stop.style.display = "none";
    start.style.display = "block";
    submitSect.style.display = "none";
    btns.style.display = "block";
    recordmsg.innerHTML = 'Press start button to start recording.';
    recordWarning.style.display = "none";
  }
  else {
    stop.style.display = "none";
    start.style.display = "none";
    submitSect.style.display = "none";
    btns.style.display = "none";
    recordWarning.innerHTML = '<h3>Allow Microphone permission to continue.</h3>';
    recordWarning.style.display = "block";
  }
}