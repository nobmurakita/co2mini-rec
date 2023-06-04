'use strict';

const CO2Monitor = require('node-co2-monitor');
const schedule = require('node-schedule');

const WEBHOOK_URL = process.env.WEBHOOK_URL || '';
if (WEBHOOK_URL === '') {
  console.error('WEBHOOK_URL is empty.');
  process.exit(1);
}

const monitor = new CO2Monitor();

monitor.connect((err) => {
  if (err) {
    return console.log(err.stack);
  }
  console.log('Monitor connected.');
  monitor.transfer();
});

monitor.on('error', (err) => {
  console.error(err.stack);
  monitor.disconnect(() => {
    console.log('Monitor disconnected.');
    process.exit(1);
  });
});

schedule.scheduleJob('0 */5 * * * *', async (timestamp) => {
  const { co2, temperature } = monitor;
  if (co2 !== null && temperature !== null) {
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ timestamp, co2, temperature })
    });
    console.log(res.status, res.statusText);
  }
});
