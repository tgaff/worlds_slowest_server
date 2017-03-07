console.log("Sanity Check: JS is working!");
responseDelayValues = [0, 200, 500, 750, 1000, 2000, 4000, 6000, 8000, 10000, 15000, 20000]
var configuredBool = false;

$(document).ready(function(){
  // hide stuff if this is the pop-up control panel
  if (window.location.href.match('popup=true')) {
    $('.hide-if-popup').addClass('hidden');
  }

  fetchServerConfig((config) => {
    console.log('Server returned config:', config);
    sliders = buildSlider('response-delay', "Response Delay");
    sliders += buildSlider('transmit-speed', 'Transmit Speed')
    $('#here').replaceWith(sliders);

    $("#response-delay").ionRangeSlider({
      min: 0, max: 30000,
      from: config.responseDelay,
      step: 250,
      // values: responseDelayValues,
      onFinish: pushConfig,
      prettify: prettifyResponseDelay,
    });

    $("#transmit-speed").ionRangeSlider({
      min: 1000, max: 70000,
      from: config.transmitSpeed,
      onFinish: pushConfig,
      prettify: prettifyTransmitSpeed
    });
    configuredBool = true;

  })
} );

function prettifyTransmitSpeed(value) {
  if (value < 10000) {
    value = (value /8 ).toFixed(0)+ ' BPS';
  } else {
    value = (value / (8*1024)).toFixed(1) + ' KBPS';
  }
  return value;
}

function prettifyResponseDelay(value) {
  if (value < 2500) {
    value = value + ' ms';
  } else {
    value = (value / 1000) + ' sec';
  }
  return value;
}

fetchServerConfig = (callback) => {
  $.get('/api/config').done(callback);
}

buildSlider = (name,title,min,max, currentValue) => {
  return (
    "<h3>" + title + "</h3>\n"
    +"<input type='text' id='" +name+ "' name='" +name+ "' value='" +currentValue+ "' />"
  )
};

function pushConfig(slider) {
  if (configuredBool) {
    let transmitSpeed = $('#transmit-speed').data().from;
    let responseDelay = $('#response-delay').data().from;
    console.log('pushing to server: transmit, response', transmitSpeed, responseDelay);
    $.post('/api/config', { responseDelay: responseDelay, transmitSpeed: transmitSpeed });
  } else { console.log('ionRangeSlider annoyingly calls on setup')}
}

// <h3>Response Delay (ms)</h3>
// <input type="text" id="response-delay" name="response-delay" value="" />
// <h3>Transmit speed (bps)</h3>
// <input type="text" id="transmit-speed" name="transmit-speed" value="" />
