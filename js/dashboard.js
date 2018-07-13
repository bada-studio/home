function toEos(text) {
    return parseFloat(text.replace(" EOS","")); 
}


var app = new Vue({
  el: '#app',
  data: {
    adminstate: [],
    balance: [],
    total: []
  },
  created: function () {
    var baseUrl = "http://testnet01.eoseoul.io:8801";

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
        this.total = toEos(row.player_deposit) 
                   + toEos(row.revenue);
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
  }
})