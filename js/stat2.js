async function fetchRevenue(url) {
  let result = new Map();
  let lower_bound = "";
  const pageSize = 100;

  let loadingCount = 0;
  while (true) {
    loadingCount++;
    $("#progress").text(loadingCount);

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
          table: "revenue",
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

  let revenue = await fetchRevenue(url);
  let groups = new Map();
  
  // grouping
  for (let [key, value] of revenue) {

    var lv = parseInt(parseFloat(value.spending.replace(" EOS","")) / 10);
    if (!groups.has(lv)) {
      groups.set(lv, {
        key: lv,
        revenue: [value]
      });
    } else {
      let item = groups.get(lv);
      item.revenue.push(value);
    }
  }

  let result = Array.from(groups.values());
  console.log(result);
  result.sort(function(a, b) {
    return a.key - b.key;
  });

  return {result: result};
}

async function drawChart() {
  let groups = await run();
  let labels = [];
  let totalCount = 0;
  let count = [];
  let sellingCount = [];
  let sellingAmount = [];
  let buyingCount = [];
  let buyingAmount = [];
  let totalSpending = 0;
  let share = [];
  let spendingShare = [];
  let spendingShareAcc = [];
  let acc = 0;

  for (let value of groups.result) {
    console.log(value.key);
    labels.push((value.key * 10) + " EOS");
    count.push(value.revenue.length);
    totalCount += value.revenue.length;

    let sc = 0; 
    let bc = 0; 
    let selling = 0;
    let buying = 0;
    for (let lv of value.revenue) {
      sc += lv.selling_count;
      bc += lv.buying_count;
      selling += parseFloat(lv.selling.replace(" EOS",""));
      buying += parseFloat(lv.buying.replace(" EOS",""));
      totalSpending += parseFloat(lv.spending.replace(" EOS",""));
    }

    sellingCount.push(sc / value.revenue.length);
    buyingCount.push(bc / value.revenue.length);
    sellingAmount.push(selling / value.revenue.length);
    buyingAmount.push(buying / value.revenue.length);
  }

  for (let value of groups.result) {
    share.push(value.revenue.length / parseFloat(totalCount));

    let spending = 0;
    for (let lv of value.revenue) {
      spending += parseFloat(lv.spending.replace(" EOS",""));
    }
    
    let nowss = (spending / totalSpending) * 100;
    acc += nowss;
    spendingShare.push(nowss);
    spendingShareAcc.push(acc);
  }

  let ctx = document.getElementById("histogramChart");
  let histogramChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Count',
        data: count,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255,99,132,1)',
        borderWidth: 1,
        yAxisID: 'y-axis-1',
      }, {
        label: 'Spending Share',
        data: spendingShare,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        yAxisID: 'y-axis-2',
        borderWidth: 1
      }, {
        label: 'Spending Share Acc',
        data: spendingShareAcc,
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
        borderColor: 'rgba(255, 206, 86, 1)',
        yAxisID: 'y-axis-3',
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
          stacked: false,
          ticks: {
            beginAtZero:true
          }
        }, {
          id: 'y-axis-3',
          position: 'right',
          stacked: false,
          display: false,
          ticks: {
            min: 0,
            max: 100,
            beginAtZero:true
          }
        }]
      }
    }
  });

  let ctx2 = document.getElementById("histogramChart2");
  let histogramChart2 = new Chart(ctx2, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'SellingCount',
        data: sellingCount,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        yAxisID: 'y-axis-1',
        borderWidth: 1
      }, {
        label: 'BuyingCount',
        data: buyingCount,
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
        borderColor: 'rgba(255, 206, 86, 1)',
        yAxisID: 'y-axis-1',
        borderWidth: 1
      }, {
        label: 'SellingAmount',
        data: sellingAmount,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        yAxisID: 'y-axis-2',
        borderWidth: 1
      }, {
        label: 'BuyingAmount',
        data: buyingAmount,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
          display: false,
          ticks: {
            beginAtZero:true
          }
        }]
      }
    }
  });

  $("#loading").css("display", "none")
  $("#app").css("display", "block")
}

$("#app").css("display", "none");
drawChart();


