import express from 'express';
import ngrok from 'ngrok';
import fs from 'fs';

let app = express();
let arrayIP = [];
let array;

async function server(){
      app.listen(3000, () => {
        console.log('Server started');
      });
      const url = await ngrok.connect({
        addr: 3000,
        authtoken: '2QI7yrnQqWhlFa7EoWUlEeJsG4S_6JmgDT2GD4qRkMn1xsdg5',
       });
      console.log('ngrok URL:', url);
};

function readCSV(){
  array = fs.readFileSync('C:/lambda-task/11.Geoposition_by_IP/IP2LOCATION-LITE-DB1.CSV', 'utf8')
  .trim()
  .split("\r\n")
  for(let i of array){
    let line = i.split(',')
    arrayIP.push(line[0].replace(/"/g, ''));
  }
}

function formatJSON(string){
  let line = string.split(',')
  let json = {
    firstIP: Number(line[0].replace(/"/g, '')),
    lastIP: Number(line[1].replace(/"/g, '')),
    code: line[2].replace(/"/g, ''),
    country: line[3].replace(/"/g, '')
  }
  return json
}

function ipToNumber(ip){
  const parts = ip.split(".");
  return parts.reduce((result, part) => ((result << 8) + parseInt(part, 10))>>> 0, 0);
}

function searchIP(array, item) {
  let left = 0;
  let right = array.length - 1;

  if(item >= array[array.length-1]){
    return array.length-1
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

server();
readCSV();
app.set('trust proxy', true);
app.get('/', (req, res) => {
    let ip = ipToNumber(req.ip);
    const index = searchIP(arrayIP, ip);
    const json = formatJSON(array[index])
    console.log(json);
    res.send(
      `User IP: ${ip} <br>`+
      `Country code: ${json.code} <br>`+
      `Country: ${json.country}`
    )
});
