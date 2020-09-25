const keys = require('./keys');
const { select, insert } = require('./dbUtils');

// Express App Setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

(async () => {
  await select(
    'CREATE TABLE IF NOT EXISTS indexes(number INT NOT NULL DEFAULT 0)'
  );
})();

// Redis Client Setup
const redis = require('redis');
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000,
});
const redisPublisher = redisClient.duplicate();

// Express route handlers
app.get('/', (req, res) => {
  res.send('Hi from worker');
});

app.get('/values/all', async (req, res) => {
  let values = await select('SELECT * FROM indexes');
  res.send(values);
});

app.get('/values/current', async (req, res) => {
  redisClient.hgetall('values', (err, values) => {
    res.send(values);
  });
});

app.post('/values', async (req, res) => {
  const index = req.body.index;
  if (parseInt(index) > 40) {
    return res.status(422).send('Index too high');
  }

  redisClient.hset('values', index, 'Nothing yet!');
  redisPublisher.publish('insert', index);

  const rows = await insert('indexes', index);

  res.send({ ...rows });
});

app.listen(5000, err => {
  console.log('Server listening on port 5000');
});
