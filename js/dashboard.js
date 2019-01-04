function parseEos(text) {
    return parseFloat(text.replace(" EOS","")); 
}

var app = new Vue({
  el: '#app',
  data: {
    adminstate: [],
    balance: [],
    total: "",
    connectionUserCount: 0
  },
  created: function () {
    var baseUrl = "https://rpc.eosys.io:443";
    let connectionUrl = "https://connection.eosknights.io"

    axios({
      method: 'POST',
      url: baseUrl + '/v1/chain/get_table_rows',
      headers: {
        'Content-Type': 'text/plain',
      },
      data: {
        json: true,
        code: "eosknightsio",
        scope: "eosknightsio",
        table: "adminstate",
        table_key: "",
        lower_bound: "",
        upper_bound: "",
        limit: 1
      }
    }).then(function(response) {
        var row = response.data.rows[0];
        this.adminstate = row;
        var all = parseEos(row.expenses) 
                  + parseEos(row.revenue)
                  + parseEos(row.dividend);
        this.total = Number(all).toFixed(4) + " EOS";
    }.bind(this))
    .catch(function(e) {
        this.errors.push(e)
    });

    axios({
      method: 'POST',
      url: baseUrl + '/v1/chain/get_table_rows',
      headers: {
        'Content-Type': 'text/plain',
      },
      data: {
        json: true,
        code: "eosio.token",
        scope: "eosknightsio",
        table: "accounts",
        table_key: "",
        lower_bound: "",
        upper_bound: "",
        limit: 1
      }
    }).then(function(response) {
        console.log(response.data.rows[0]);
        this.balance = response.data.rows[0];
    }.bind(this))
    .catch(function(e) {
        this.errors.push(e)
    });

    axios({
        method: 'GET',
        url: connectionUrl + '/v1/users/count'
    }).then(function(response) {
        console.log(response.data);
        this.connectionUserCount = response.data;
    }.bind(this))
    .catch(function(e) {
        this.errors.push(e)
    });
  }
})


async function drawChart() {
  let shapshot = [];
  let delta = [];

  try {
    const response = await fetch('https://api.eosknights.io/api/v1/revenue/revenues/hourly-snapshots', {
      method: "POST",
      mode: "cors", 
      cache: "no-cache",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({from:0, size:720})
    });

    shapshot = JSON.parse(await response.text());
  } catch (err) {
    console.log('fetch failed', err);
  }

  try {
    const response = await fetch('https://api.eosknights.io/api/v1/revenue/revenues/hourly-variations', {
      method: "POST",
      mode: "cors", 
      cache: "no-cache",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({from:0, size:720})
    });
  
    delta = JSON.parse(await response.text());
  } catch (err) {
    console.log('fetch failed', err);
  }


  var ssLogs = [];
  for (i = 0; i < shapshot.length; i++) { 
    if (ssLogs.length == 0 || ssLogs[ssLogs.length-1].created != shapshot[i].created) {
      ssLogs.push({
        created: shapshot[i].created,
        itemIventoryUp: parseFloat(shapshot[i].itemIventoryUp),
        itemTax: parseFloat(shapshot[i].itemTax),
        knight: parseFloat(shapshot[i].knight),
        matIventoryUp: parseFloat(shapshot[i].matIventoryUp),
        materialTax: parseFloat(shapshot[i].materialTax),
        mp: parseFloat(shapshot[i].mp),
        userCount: parseInt(shapshot[i].userCount)
      });
    } else {
      ssLogs[ssLogs.length-1].itemIventoryUp = parseFloat(shapshot[i].itemIventoryUp);
      ssLogs[ssLogs.length-1].itemTax = parseFloat(shapshot[i].itemTax);
      ssLogs[ssLogs.length-1].knight = parseFloat(shapshot[i].knight);
      ssLogs[ssLogs.length-1].matIventoryUp = parseFloat(shapshot[i].matIventoryUp);
      ssLogs[ssLogs.length-1].materialTax = parseFloat(shapshot[i].materialTax);
      ssLogs[ssLogs.length-1].mp = parseFloat(shapshot[i].mp);
      ssLogs[ssLogs.length-1].userCount = parseInt(shapshot[i].userCount);
    }
  }
  
  var itemIventoryUp = [];
  var itemTax = [];
  var knight = [];
  var matIventoryUp = [];
  var materialTax = [];
  var mp = [];
  var labels = [];
  var userCount = [];
  var sum = [];

  for (i = 0; i < ssLogs.length; i++) { 
    labels.push(ssLogs[i].created.substring(5));
    itemIventoryUp.push(parseInt(ssLogs[i].itemIventoryUp));
    itemTax.push(parseInt(ssLogs[i].itemTax));
    knight.push(parseInt(ssLogs[i].knight));
    matIventoryUp.push(parseInt(ssLogs[i].matIventoryUp));
    materialTax.push(parseInt(ssLogs[i].materialTax));
    mp.push(parseInt(ssLogs[i].mp));
    userCount.push(parseInt(ssLogs[i].userCount));
    sum.push(parseInt(
      ssLogs[i].itemIventoryUp +
      ssLogs[i].itemTax +
      ssLogs[i].knight +
      ssLogs[i].matIventoryUp +
      ssLogs[i].materialTax + 
      ssLogs[i].mp));
  }


  var dtLogs = [];
  var dt24Created = [];
  var dt24ItemIventoryUp = [];
  var dt24ItemTax = [];
  var dt24Knight = [];
  var dt24MatIventoryUp = [];
  var dt24MaterialTax = [];
  var dt24Mp = [];
  var dt24Sum = [];
  var dt48Sum = [];

  for (i = 0; i < delta.length; i++) { 
    const vitemIventoryUp = parseFloat(delta[i].itemIventoryUp);
    const vitemTax = parseFloat(delta[i].itemTax);
    const vknight = parseFloat(delta[i].knight);
    const vmatIventoryUp = parseFloat(delta[i].matIventoryUp);
    const vmaterialTax = parseFloat(delta[i].materialTax);
    const vmp = parseFloat(delta[i].mp);
    const vsum = vitemIventoryUp + vitemTax + vknight + vmatIventoryUp + vmaterialTax + vmp;

    if (i >= delta.length - 24) {
      dt24Created.push(delta[i].created);
      dt24ItemIventoryUp.push(vitemIventoryUp);
      dt24ItemTax.push(vitemTax);
      dt24Knight.push(vknight);
      dt24MatIventoryUp.push(vmatIventoryUp);
      dt24MaterialTax.push(vmaterialTax);
      dt24Mp.push(vmp);
      dt24Sum.push(parseInt(vsum));
    } else if (i >= delta.length - 48) {
      dt48Sum.push(parseInt(vsum));
    }

    if (dtLogs.length == 0 || dtLogs[dtLogs.length-1].created != delta[i].created) {
      dtLogs.push({
        created: delta[i].created,
        itemIventoryUp: vitemIventoryUp,
        itemTax: vitemTax,
        knight: vknight,
        matIventoryUp: vmatIventoryUp,
        materialTax: vmaterialTax,
        mp: vmp,
        userCount: parseInt(delta[i].userCount)
      });
    } else {
      dtLogs[dtLogs.length-1].itemIventoryUp += vitemIventoryUp;
      dtLogs[dtLogs.length-1].itemTax += vitemTax;
      dtLogs[dtLogs.length-1].knight += vknight;
      dtLogs[dtLogs.length-1].matIventoryUp += vmatIventoryUp;
      dtLogs[dtLogs.length-1].materialTax += vmaterialTax;
      dtLogs[dtLogs.length-1].mp += vmp;
      dtLogs[dtLogs.length-1].userCount += parseInt(delta[i].userCount);
    }
  }
  
  var itemIventoryUp = [];
  var itemTax = [];
  var knight = [];
  var matIventoryUp = [];
  var materialTax = [];
  var mp = [];
  var labels = [];
  var userDelta = [];
  var dailySum = [];

  for (i = 0; i < dtLogs.length; i++) { 
    labels.push(dtLogs[i].created.substring(5));
    itemIventoryUp.push(parseInt(dtLogs[i].itemIventoryUp));
    itemTax.push(parseInt(dtLogs[i].itemTax));
    knight.push(parseInt(dtLogs[i].knight));
    matIventoryUp.push(parseInt(dtLogs[i].matIventoryUp));
    materialTax.push(parseInt(dtLogs[i].materialTax));
    mp.push(parseInt(dtLogs[i].mp));
    dailySum.push(parseInt(
      dtLogs[i].itemIventoryUp +
      dtLogs[i].itemTax +
      dtLogs[i].knight +
      dtLogs[i].matIventoryUp +
      dtLogs[i].materialTax + 
      dtLogs[i].mp));
    userDelta.push(parseInt(dtLogs[i].userCount));
  }

  $("#todayRevenue").text(dailySum[dailySum.length-1]);
  $("#todayPlayer").text(userDelta[userDelta.length-1]);

  var ctx = document.getElementById("deltaChart");
  var deltaChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Cumulated',
        data: sum,
        backgroundColor: 'rgba(0, 0, 0, 0)',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        pointRadius: 0,
        yAxisID: 'y-axis-2',
      }, {
        label: 'Sum',
        data: dailySum,
        backgroundColor: 'rgba(0, 0, 0, 0)',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        pointRadius: 0,
        yAxisID: 'y-axis-3',
      }, {
        label: 'M-Water',
        data: mp,
        backgroundColor: 'rgba(255, 99, 132, 1)',
        borderColor: 'rgba(255,99,132,1)',
        borderWidth: 1,
        pointRadius: 0,
        yAxisID: 'y-axis-1',
      }, {
        label: 'Knight',
        data: knight,
        backgroundColor: 'rgba(54, 162, 235, 1)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        pointRadius: 0,
        yAxisID: 'y-axis-1',
      }, {
        label: 'Tax-Item',
        data: itemTax,
        backgroundColor: 'rgba(255, 206, 86, 1)',
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 1,
        pointRadius: 0,
        yAxisID: 'y-axis-1',
      }, {
        label: 'Tax-Mat',
        data: materialTax,
        backgroundColor: 'rgba(75, 192, 192, 1)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        pointRadius: 0,
        yAxisID: 'y-axis-1',
      }, {
        label: 'Ivn-Item',
        data: itemIventoryUp,
        backgroundColor: 'rgba(153, 102, 255, 1)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
        pointRadius: 0,
        yAxisID: 'y-axis-1',
      }, {
        label: 'Ivn-Mat',
        data: matIventoryUp,
        backgroundColor: 'rgba(255, 159, 64, 1)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1,
        pointRadius: 0,
        yAxisID: 'y-axis-1',
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        yAxes: [{
          id: 'y-axis-1',
          position: 'left',
          stacked: true,
          ticks: {
            beginAtZero:true
          }
        }, {
          id: 'y-axis-2',
          position: 'right',
          display: true,
          ticks: {
            beginAtZero:true
          }
        }, {
          id: 'y-axis-3',
          position: 'right',
          display: false,
          ticks: {
            beginAtZero:true
          }
        }]
      }
    }
  });

  var ctx2 = document.getElementById("accountDeltaChart");
  var accountDeltaChart = new Chart(ctx2, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Newly Registerd',
        data: userDelta,
        backgroundColor: 'rgba(255, 99, 132, 1)',
        borderColor: 'rgba(255,99,132,1)',
        borderWidth: 1,
        pointRadius: 0,
        yAxisID: 'y-axis-1',
      }, {
        label: 'Cumulated',
        data: userCount,
        backgroundColor: 'rgba(255, 255, 255, 0)',
        yAxisID: 'y-axis-2',
        borderColor: 'rgba(0, 0, 0, 0.5)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        yAxes: [{
          id: 'y-axis-1',
          position: 'left',
          stacked: false,
          ticks: {
            beginAtZero:true
          }
        }, {
          id: 'y-axis-2',
          position: 'right',
          display: true,
          ticks: {
            beginAtZero:true
          }
        }]
      }
    }
  });  

  const revenueLabel = [];
  const d = new Date();
  const hour = d.getHours();

  for (let index = 0; index < 24; index++) {
    let value = hour - 24 + index + 1;
    if (value < 0) {
      value += 24;
    }
    revenueLabel.push(value);
  }


  var ctx3 = document.getElementById("revenue");
  var revenueChart = new Chart(ctx3, {
    type: 'line',
    data: {
      labels: revenueLabel,
      datasets: [{
        label: 'Sum',
        data: dt24Sum,
        backgroundColor: 'rgba(0, 0, 0, 0)',
        borderColor: 'rgba(0, 0, 0, 0.3)',
        borderWidth: 1,
        pointRadius: 0,
        yAxisID: 'y-axis-2',
      }, {
        label: 'Yesterday',
        data: dt48Sum,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderColor: 'rgba(0, 0, 0, 0.3)',
        borderWidth: 1,
        pointRadius: 0,
        yAxisID: 'y-axis-2',
      }, {
        label: 'M-Water',
        data: dt24Mp,
        backgroundColor: 'rgba(255, 99, 132, 1)',
        borderColor: 'rgba(255,99,132,1)',
        borderWidth: 1,
        pointRadius: 0,
        yAxisID: 'y-axis-1',
      }, {
        label: 'Knight',
        data: dt24Knight,
        backgroundColor: 'rgba(54, 162, 235, 1)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        pointRadius: 0,
        yAxisID: 'y-axis-1',
      }, {
        label: 'Tax-Item',
        data: dt24ItemTax,
        backgroundColor: 'rgba(255, 206, 86, 1)',
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 1,
        pointRadius: 0,
        yAxisID: 'y-axis-1',
      }, {
        label: 'Tax-Mat',
        data: dt24MaterialTax,
        backgroundColor: 'rgba(75, 192, 192, 1)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        pointRadius: 0,
        yAxisID: 'y-axis-1',
      }, {
        label: 'Ivn-Item',
        data: dt24ItemIventoryUp,
        backgroundColor: 'rgba(153, 102, 255, 1)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
        pointRadius: 0,
        yAxisID: 'y-axis-1',
      }, {
        label: 'Ivn-Mat',
        data: dt24MatIventoryUp,
        backgroundColor: 'rgba(255, 159, 64, 1)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1,
        pointRadius: 0,
        yAxisID: 'y-axis-1',
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        yAxes: [{
          id: 'y-axis-1',
          position: 'left',
          stacked: true,
          ticks: {
            beginAtZero:true,
            min: 0,
            max: 150,
          }
        }, {
          id: 'y-axis-2',
          position: 'right',
          display: true,
          ticks: {
            beginAtZero:true,
            min: 0,
            max: 150,
          }
        }]
      }
    }
  });
}

drawChart();

// Define a plugin to provide data labels
Chart.plugins.register({
  afterDatasetsDraw: function(chart) {
    var ctx = chart.ctx;

    chart.data.datasets.forEach(function(dataset, i) {
      if (chart.data.datasets.length > 2 && dataset.label != "Cumulated" && dataset.label != "Sum") {
        return;
      }

      var meta = chart.getDatasetMeta(i);
      if (!meta.hidden) {
        meta.data.forEach(function(element, index) {
          if (dataset.label == "Cumulated" || chart.data.datasets.length <= 2) {
            if ((index % 3) != 1 && index < meta.data.length - 1) {
              return;
            }
          } else if (dataset.label == "Sum") {
            if ((index % 3) != 2) {
              return;
            }
          }

          // Draw the text in black, with the specified font
          if (dataset.label == "Sum") {
            ctx.fillStyle = 'rgb(0, 51, 204)';
          } else {
            ctx.fillStyle = 'rgb(0, 0, 0)';
          }

          var fontSize = '10';
          var fontStyle = 'normal';
          var fontFamily = 'Helvetica Neue';
          ctx.font = Chart.helpers.fontString(fontSize, fontStyle, fontFamily);

          // Just naively convert to string for now
          var dataString = dataset.data[index].toString();

          // Make sure alignment settings are correct
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          var padding = 5;
          var position = element.tooltipPosition();
          ctx.fillText(dataString, position.x, position.y - (fontSize / 2) - padding);
        });
      }
    });
  }
});
