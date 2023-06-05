import { readFileSync } from 'fs'
import axios from 'axios'
import { get } from 'https';

let countTrue = 0;
let countFalse = 0;
let json = []
let jsonLink = readFileSync('c:/lambda-task/10.JSON_Sort/link.txt', 'utf-8').split("\r\n");

const countTF = (tf) => {
  if (tf) {
    countTrue++;
    return
  }
  countFalse++;
}

const getLink = async (link, number) => {
  try {
    let { data } = await axios.get(link);
    json.push(data)
  } catch (err) {
    if (!number) {
      console.log(link);
      console.log(err)
    }
    if (number < 3) {
      await getLink(link, number + 1)
    }
  }
}

const getJSON = async () => {
  await Promise.all(jsonLink.map(link => getLink(link, 0)))
  let variabl = 'isDone';

  json.reduce((total, data) => {
    if (variabl in data) {
      countTF(data[variabl]);
    } else {
      Object.entries(data).forEach(([key, value]) => {
        if (typeof value == 'object' && variabl in value) {
          countTF(value);
        }
      })
    }
  }, 0)
}

await getJSON();
console.log(`Values True: ${countTrue}`);
console.log(`Values False: ${countFalse}`);