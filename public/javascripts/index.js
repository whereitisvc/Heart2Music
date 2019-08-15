//var const1 = [0,1,2,3];
var timeData = [];
var heartBPMData = [];
var tapBPMData = [];
var reactupdate = false;

$(document).ready(function () {
  
  var data = {
    labels: timeData,
    datasets: [
      {
        fill: false,
        label: 'Heart BPM',
        yAxisID: 'Heart',
        borderColor: "rgba(255, 204, 0, 1)",
        pointBoarderColor: "rgba(255, 204, 0, 1)",
        backgroundColor: "rgba(255, 204, 0, 0.4)",
        pointHoverBackgroundColor: "rgba(255, 204, 0, 1)",
        pointHoverBorderColor: "rgba(255, 204, 0, 1)",
        data: heartBPMData
      },
      {
        fill: false,
        label: 'Tap BPM',
        yAxisID: 'Tap',
        borderColor: "rgba(24, 120, 240, 1)",
        pointBoarderColor: "rgba(24, 120, 240, 1)",
        backgroundColor: "rgba(24, 120, 240, 0.4)",
        pointHoverBackgroundColor: "rgba(24, 120, 240, 1)",
        pointHoverBorderColor: "rgba(24, 120, 240, 1)",
        data: tapBPMData
      }
    ]
  }

  var basicOption = {
    title: {
      display: true,
      text: 'Heart & Tap BPM Data',
      fontSize: 36
    },
    scales: {
      yAxes: [{
        id: 'Heart',
        type: 'linear',
        scaleLabel: {
          labelString: 'BPM',
          display: true
        },
        position: 'left',
      }, {
          id: 'Tap',
          type: 'linear',
          scaleLabel: {
            labelString: 'BPM',
            display: true
          },
          position: 'right'
        }]
    }
  }

  //Get the context of the canvas element we want to select
  var ctx = document.getElementById("myChart").getContext("2d");
  var optionsNoAnimation = { animation: false }
  var myLineChart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: basicOption
  });

  var ws = new WebSocket('wss://' + location.host); // 'wss://'
  ws.onopen = function () {
    console.log('Successfully connect WebSocket');
  }
  ws.onmessage = function (message) {
    console.log('receive message' + message.data);
    try {
      var obj = JSON.parse(message.data);
      if(!obj.time || !obj.heartBPM) {
        return;
      }
      timeData.push(obj.messageId);
      heartBPMData.push(obj.heartBPM);
      // only keep no more than 50 points in the line chart
      const maxLen = 50;
      var len = timeData.length;
      if (len > maxLen) {
        timeData.shift();
        heartBPMData.shift();
      }

      if (obj.tapBPM) {
        tapBPMData.push(obj.tapBPM);
      }
      if (tapBPMData.length > maxLen) {
        tapBPMData.shift();
      }
      myLineChart.update();

      reactupdate = true;
      ReactDOM.render(React.createElement(App, { context: $('body') }), document.getElementById('App'));

    } catch (err) {
      console.error(err);
    }
  }
 
});
