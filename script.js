let client;
let testTimeout;
let timelineInSeconds = [];

//Register to player events
let audio = document.getElementById('audio');
audio.load();
audio.onended = function () {
  stop();
};
audio.ontimeupdate = function () {
  if (!audio.paused) {
    checkVibration(audio.currentTime);
  }
};
audio.onpause = function () {
  stopAllToys();
};

ConvertTimelineToSeconds();

//Hide UI Elements
$("#sctnCalibration").hide();
$("#sctnToys").hide();
$("#sctnPodcast").hide();
$("#btnTestStop").hide();
$("#btnTestReady").hide();

//Convert millisecondes from Funscript to seconds to match with player unities
function ConvertTimelineToSeconds() {
  let actions = data.actions;
  timelineInSeconds = [];
  for (let i = 0; i < actions.length; i++) {
    timelineInSeconds.push({ "timespan": actions[i].at / 1000, "vibration": actions[i].pos / 100 });
  }
}

function launchTest() {
  $("#btnTestStart").hide();
  $("#btnTestStop").show();
  client._devices.forEach(async function (d) {
    Vibrate(d, 0.4);
    testTimeout = setTimeout(() => stopTest(), 2500);
  });
}

function stopTest() {
  $("#btnTestStart").show();
  $("#btnTestStop").hide();
  $("#btnTestReady").show();
  if (testTimeout) {
    clearTimeout(testTimeout);
  }
  client._devices.forEach(async function (d) {
    Vibrate(d, 0.0);
  });
}

function ready() {
  $("#sctnCalibration").hide();
  $("#sctnPodcast").show();
}

function checkVibration(currentTimeInSeconds) {
  if (timelineInSeconds) {
    let progression = timelineInSeconds.filter((i) => i.timespan <= currentTimeInSeconds);
    if (progression && progression.length > 0) {
      progression = progression[progression.length - 1];
      let vibration = progression.vibration;
      client._devices.forEach(async function (d) {
        Vibrate(d, vibration);
      });
    }
  }
}

function Vibrate(device, power) {
  device.vibrate(power);
}

function stopAllToys() {
  client._devices.forEach(async function (d) {
    Vibrate(d, 0.0);
  });
}

function generateDeviceLi(device) {
  let li = document.createElement("li");
  li.appendChild(document.createTextNode(device.Name));
  return li;
}

async function connectToys() {
  await Buttplug.buttplugInit();
  const connector = new Buttplug.ButtplugEmbeddedConnectorOptions();
  client = new Buttplug.ButtplugClient("Client");

  client.addListener('deviceadded', async (device) => {
    $("#button-enterRoom").prop("disabled", false);
    li = generateDeviceLi(device);

    ul.append(li);    
    $("#sctnSync").hide();
    $("#sctnToys").show();
    $("#sctnCalibration").show();
    
    await client.stopScanning();
  });

  try {
    await client.connect(connector);
  } catch (e) {
    console.log(e);
    return;
  }
  let ul = $('#yourdevices');
  ul.empty();

  await client.startScanning();
};