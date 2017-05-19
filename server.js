const express = require('express');
const bodyParser = require('body-parser');
const pg = require('pg');

const app = express();
// Serve files from public folder. That's where all of our HTML, CSS and Angular JS are.
app.use(express.static('public'));
// This allows us to accept JSON bodies in POSTs and PUTs.
app.use(bodyParser.json());

var pool = new pg.Pool({
  user: 'postgres',
  password: 'saladsoup',
  host: 'localhost',
  port: 5433,
  database: 'postgres',
  ssl: false
});

app.get('/api/items', function (req, res) {
  pool.query("SELECT * FROM ShoppingCart").then(function (result) {
    res.send(result.rows);
    console.log(result.rows);
  }).catch(function(error) {
    console.log(error);
  });
});

app.get('/api/items/:id', function (req, res) {
  var id = req.params.id;
  pool.query("SELECT * FROM ShoppingCart WHERE id = $1::int", [id]).then(function (result) {
    if (result.rowCount === 0) {
      res.status(404);
      res.send("NOT FOUND");
    } else {
      res.status(200);
      res.send(result.rows[0]);
    }
  });
});

app.post('/api/items', function (req, res) {
  var item = req.body;
  var sql = "INSERT INTO ShoppingCart (product, price, quantity)" +
            "VALUES ($1::text, $2::int, $3::int)";
  var values = [item.product, item.price, item.quantity];
  pool.query(sql, values).then(function () {
    res.status(201);
    res.send("INSERTED");
  }).catch(function (error) {
    console.log(error);
  });
});

app.delete('/api/items/:id', function (req, res) {
  var id = req.params.id;
  pool.query("DELETE FROM ShoppingCart WHERE id = $1::int", [id]).then(function () {
    res.status(200);
    res.send('DELETED');
  }).catch(function (error) {
    console.log(error);
  });
});

var port = process.env.PORT || 5000;
app.listen(port, function () {
  console.log('JSON Server is running on ' + port);
});
