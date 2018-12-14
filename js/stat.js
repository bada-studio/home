async function fetchPlayer(url) {
  let result = new Map();
  let lower_bound = "";
  const pageSize = 100;

  while (true) {
    try {
      const response = await fetch(url + '/v1/chain/get_table_rows', {
        method: "POST",
        mode: "cors", 
        cache: "no-cache",
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({
          json: true,
          code: "eosknightsio",
          scope: "eosknightsio",
          table: "player",
          lower_bound: lower_bound,
          limit: pageSize
        })
      });

      const res = JSON.parse(await response.text());
      for (var value of res.rows) {
        result.set(value.owner, value);
        lower_bound = value.owner;
      }

      if (res.rows.length < pageSize) {
        break;
      }
    } catch (err) {
      console.log('fetch failed', err);
      break;
    }
  }

  return result;
}


async function fetchKnights(url) {
  let result = new Map();
  let lower_bound = "";
  const pageSize = 100;

  while (true) {
    try {
      const response = await fetch(url + '/v1/chain/get_table_rows', {
        method: "POST",
        mode: "cors", 
        cache: "no-cache",
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({
          json: true,
          code: "eosknightsio",
          scope: "eosknightsio",
          table: "knight",
          lower_bound: lower_bound,
          limit: pageSize
        })
      });

      const res = JSON.parse(await response.text());
      for (let value of res.rows) {
        result.set(value.owner, value);
        lower_bound = value.owner;
      }

      if (res.rows.length < pageSize) {
        break;
      }
    } catch (err) {
      console.log('fetch failed', err);
      break;
    }
  }

  return result;
}

async function run() {
  let url = "https://api.eoseoul.io";
  let players = await fetchPlayer(url);
  let knights = await fetchKnights(url);
  console.log(players);
  console.log(knights);

  let groups = new Map();

  // grouping
  for (let [key, value] of players) {
    if (value.maxfloor == 0) {
      continue;
    }

    var knt = knights.get(key);

    var level = parseInt(value.maxfloor / 100);
    if (!groups.has(level)) {
      groups.set(level, {
        key: level,
        players: [value],
        knights: [knt]
      });
    } else {
      let item = groups.get(level);
      item.players.push(value);
      item.knights.push(knt);
    }
  }

  // calculate
  for (let [key, value] of groups) {
    let stat = {
      count: 0,
      attack: 0,
      defense: 0,
      hp: 0,
      level: 0,
      luck: 0,
    };

    for (let kntset of value.knights) {
      for (let knt of kntset.rows) {
        stat.count++;
        stat.attack += knt.attack;
        stat.defense += knt.defense;
        stat.hp += knt.hp;
        stat.level += knt.level;
        stat.luck += knt.luck;
      }
    }

    stat.attack /= stat.count;
    stat.defense /= stat.count;
    stat.hp /= stat.count;
    stat.level /= stat.count;
    stat.luck /= stat.count;

    value.stat = stat;
  }

  let result = Array.from(groups.values());
  console.log(result);
  result.sort(function(a, b) {
    return a.key - b.key;
  });

  return result;
}

async function drawChart() {
  let groups = await run();
  let labels = [];
  let count = [];
  let attack = [];
  let defense = [];
  let hp = [];
  let level = [];
  let luck = [];
  let totalCount = 0;

  for (let value of groups) {
    labels.push(value.key * 100);
    count.push(value.players.length);
    level.push(value.stat.level);

    attack.push(parseInt(value.stat.attack));
    defense.push(parseInt(value.stat.defense));
    hp.push(parseInt(value.stat.hp));
    luck.push(parseInt(value.stat.luck));

    totalCount += value.players.length;
  }

  let ctx = document.getElementById("histogramChart");
  let histogramChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Count',
        data: count,
        backgroundColor: 'rgba(255, 99, 132, 0)',
        borderColor: 'rgba(255,99,132,1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero:true
          }
        }]
      }
    }
  });

  let ctx2 = document.getElementById("statChart");
  var statChart = new Chart(ctx2, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'attack',
        data: attack,
        backgroundColor: 'rgba(255, 99, 132, 0)',
        borderColor: 'rgba(255,99,132,1)',
        yAxisID: 'y-axis-1',
        borderWidth: 1
      }, {
        label: 'defense',
        data: defense,
        backgroundColor: 'rgba(54, 162, 235, 0)',
        borderColor: 'rgba(54, 162, 235, 1)',
        yAxisID: 'y-axis-1',
        borderWidth: 1
      }, {
        label: 'hp',
        data: hp,
        backgroundColor: 'rgba(255, 206, 86, 0)',
        borderColor: 'rgba(255, 206, 86, 1)',
        yAxisID: 'y-axis-1',
        borderWidth: 1
      }, {
        label: 'luck',
        data: luck,
        backgroundColor: 'rgba(75, 192, 192, 0)',
        borderColor: 'rgba(75, 192, 192, 1)',
        yAxisID: 'y-axis-1',
        borderWidth: 1
      }, {
        label: 'level',
        data: level,
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

  $("#totalCount").text(totalCount);
}

drawChart();


