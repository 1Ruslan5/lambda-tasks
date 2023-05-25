import fs from 'fs'
import axios from 'axios'

console.time("function");
let countTrue = 0;
let countFalse = 0;
let jsonLink = fs.readFileSync('c:/lambda-task/10.JSON_Sort/link.txt', 'utf-8').toString().split("\r\n");

Promise.all(jsonLink.map(jsonGet))
  .then(() => {
    console.log(`Values True: ${countTrue}`);
    console.log(`Values False: ${countFalse}`);
    console.timeEnd("function")
  })

async function jsonGet(link, attempt = 1) {
  try {
    const response = await axios.get(link);

    let obj = response.data;
    let key = 'isDone';

    if (key in obj) {
      countTF(obj[key]);
    } else {
      for (let value in obj) {
        if (typeof obj[value] === 'object' && key in obj[value]) {
          countTF(obj[value].isDone);
          return;
        }
      }
    }
  } catch (error) {
    if(attempt < 3){
        await jsonGet(link, attempt + 1);
    }else{
        console.error('Error:', error.code);
        console.log(`Exeption ${link}`);
        return;
    }
  }
}

function countTF(tf) {
  if (tf) {
    countTrue++;
  } else {
    countFalse++;
  }
}
