var canvas = document.querySelector('canvas');
var statusText = document.querySelector('#statusText');

statusText.addEventListener('click', function() {
  statusText.textContent = 'Rotate...';
  heartRates = [];
  heartRateSensor.connect()
  .then(() => heartRateSensor.startNotificationsHeartRateMeasurement().then(handleHeartRateMeasurement))
  .catch(error => {
    statusText.textContent = error;
  });
});

function handleHeartRateMeasurement(heartRateMeasurement) {
  heartRateMeasurement.addEventListener('characteristicvaluechanged', event => {
    //var heartRateMeasurement = heartRateSensor.parseHeartRate(event.target.value);
    var heartRateMeasurement = heartRateSensor.parseHeartRate(event);
    statusText.innerHTML = heartRateMeasurement.heartRate + ' &#x2764;';
    heartRates.push(heartRateMeasurement.heartRate);
    //console.log(heartRates);
    drawWaves();
  });
}

var heartRates = [];
var mode = 'bar';

canvas.addEventListener('click', event => {
  //mode = mode === 'bar' ? 'line' : 'bar';
  mode = mode === 'bar' ? 'bar' : 'bar';
  drawWaves();
});

function drawWaves() {
  requestAnimationFrame(() => {
    canvas.width = parseInt(getComputedStyle(canvas).width.slice(0, -2)) * devicePixelRatio;//Dynamically changed
    canvas.height = parseInt(getComputedStyle(canvas).height.slice(0, -2)) * devicePixelRatio;
    var context = canvas.getContext('2d');
    var margin = 2;
    var max = Math.max(0, Math.round(canvas.width / 50));//11
    var offset = Math.max(0, heartRates.length - max);

    var height_offset = Math.max(0, Math.round(canvas.height / 3)); 
    var width_offset = Math.max(0, Math.round(canvas.height / 2));
    /**
      * Removes the first element from an heartRates array.
      */
    if(heartRates.length >= max)
    {
      heartRates.shift();
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = '#00796B';
    if (mode === 'bar') {
      //context.beginPath();
      for (var i = 0; i < Math.max(heartRates.length, max) - 1; i++) {
        //var barHeight = Math.round(heartRates[i + offset ][0] * canvas.height / 200);
        var barHeight = Math.round((heartRates[i + offset ][0]) * canvas.height / 200000);
        //console.log(barHeight);
        context.rect(11 * i + margin + width_offset, canvas.height - barHeight - height_offset - height_offset, margin, Math.max(0, barHeight - margin));
        context.stroke();
      }

      for (var i = 0; i < Math.max(heartRates.length, max)- 1; i++) {
        var barHeight = Math.round((heartRates[i + offset ][1]) * canvas.height / 200000);
        context.rect(11 * i + margin + width_offset, canvas.height - barHeight - height_offset, margin, Math.max(0, barHeight - margin));
        context.stroke();
      }

      for (var i = 0; i < Math.max(heartRates.length, max)- 1; i++) {
        var barHeight = Math.round((heartRates[i + offset ][2]) * canvas.height / 200000);
        context.rect(11 * i + margin + width_offset, canvas.height - barHeight, margin, Math.max(0, barHeight - margin));
        context.stroke();
      }

      for (var i = 0; i < Math.max(heartRates.length, max)- 1; i++) {
        var barHeight = Math.round((heartRates[i + offset ][3]) * canvas.height / 200000);
        context.rect(11 * i + margin, canvas.height - barHeight - height_offset - height_offset, margin, Math.max(0, barHeight - margin));
        context.stroke();
      }

      for (var i = 0; i < Math.max(heartRates.length, max)- 1; i++) {
        var barHeight = Math.round((heartRates[i + offset ][4]) * canvas.height / 200000);
        context.rect(11 * i + margin, canvas.height - barHeight - height_offset, margin, Math.max(0, barHeight - margin));
        context.stroke();
      }

      for (var i = 0; i < Math.max(heartRates.length, max)- 1; i++) {
        var barHeight = Math.round((heartRates[i + offset ][5]) * canvas.height / 200000);
        context.rect(11 * i + margin, canvas.height - barHeight, margin, Math.max(0, barHeight - margin));
        context.stroke();
      }
      //context.closePath();
     } //else if (mode === 'line') {
    //   context.beginPath();
    //   context.lineWidth = 6;
    //   context.lineJoin = 'round';
    //   context.shadowBlur = '1';
    //   context.shadowColor = '#333';
    //   context.shadowOffsetY = '1';
    //   for (var i = 0; i < Math.max(heartRates.length, max); i++) {
    //     var lineHeight = Math.round(heartRates[i + offset ] * canvas.height / 200);
    //     if (i === 0) {
    //       context.moveTo(11 * i, canvas.height - lineHeight);
    //     } else {
    //       context.lineTo(11 * i, canvas.height - lineHeight);
    //     }
    //     context.stroke();
    //   }
    //   context.closePath();
    // }
  });
}

window.onresize = drawWaves;

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    drawWaves();
  }
});
