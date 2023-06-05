const express = require('express');
const { connect } = require('ngrok');
const { readFileSync } = require('fs');
require('dotenv').config();

let { PORT, NGROK_TOKEN } = process.env
let arrayIP = [];
let array;
let app = express();

const server = async () => {
  try {
    app.listen(PORT, () => {
      console.log('Server started');
    });
    const url = await connect({
      addr: PORT,
      authtoken: NGROK_TOKEN,
    });
    console.log('ngrok URL:', url);
  } catch (err) {
    console.log(err);
  }
}

const readCSV = () => {
  array = readFileSync('C:/lambda-task/11.Geoposition_by_IP/IP2LOCATION-LITE-DB1.CSV', 'utf8').trim().split("\r\n")
  array.reduce((trim, current) => {
    let [line] = current.split(',');
    arrayIP.push(line.replace(/"/g, ''));
  }, 0)
}

const formatJSON = (string) => {
  let line = string.split(',')
  let json = {
    firstIP: Number(line[0].replace(/"/g, '')),
    lastIP: Number(line[1].replace(/"/g, '')),
    code: line[2].replace(/"/g, ''),
    country: line[3].replace(/"/g, '')
  }
  return json
}

const ipToNumber = (ip) => {
  const parts = ip.split(".");
  return parts.reduce((result, part) => ((result << 8) + parseInt(part, 10)) >>> 0, 0);
}

const searchIP = (array, item) => {
  let left = 0;
  let right = array.length - 1;

  if (item >= array[array.length - 1]) {
    return array.length - 1
  }
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (array[mid] === item) {
      return mid;
    } else if (array[mid] < item) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  if (item > array[right] && item < array[left]) {
    return right;
  }
}

app.set('trust proxy', true);

app.get('/', (req, res) => {
  let ip = ipToNumber(req.ip);
  const index = searchIP(arrayIP, ip);
  const json = formatJSON(array[index])
  console.log(json);
  res.send(
    `User IP: ${ip} <br>` +
    `Country code: ${json.code} <br>` +
    `Country: ${json.country}`
  )
});

server();
readCSV();