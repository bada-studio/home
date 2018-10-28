
var app = new Vue({
  el: '#app',
  data: {
    adminstate: [],
    expenseslog: []
  },
  created: function () {
    var baseUrl = "https://rpc.eosys.io:443";

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
        console.log(response.data.rows[0]);
        this.adminstate = response.data.rows[0];
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
        code: "eosknightsio",
        scope: "eosknightsio",
        table: "expenseslog",
        table_key: "",
        lower_bound: "",
        upper_bound: "-1",
        limit: 100
      }
    }).then(function(response) {
        console.log(response.data.rows[0]);
        this.expenseslog = response.data.rows;
    }.bind(this))
    .catch(function(e) {
        this.errors.push(e)
    });    
  }
})