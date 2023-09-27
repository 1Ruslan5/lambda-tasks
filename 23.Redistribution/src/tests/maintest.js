import { check, sleep } from 'k6';
import http from 'k6/http';
import { generateRandomUsername, generateRandomPassword, generateInvalidPhrases } from './options.js';

const shops = JSON.parse(open('C:/lambda-task/23.Redistribution/src/files/shops.json'));

export const options = {
  scenarios: {
      generateDataAndRequest: {
          executor: 'constant-arrival-rate',
          rate: 100,
          duration: '2m',
          preAllocatedVUs: 1,
          maxVUs: 100,
          exec: 'default',
      },
  },
};

export default function () {

  const validPhrases = shops.map(shop => shop.frases).flat();

  const user_name = generateRandomUsername();
  const password = generateRandomPassword();
  const validSearchPhrase = validPhrases[Math.floor(Math.random() * validPhrases.length)];
  const invalidSearchPhrase = generateInvalidPhrases();

  const search_phrases_array = [validSearchPhrase, invalidSearchPhrase].join(',');

  const responseGet = http.get(`https://u1rvapc8l9.execute-api.eu-central-1.amazonaws.com/dev/getToken?user_name=${user_name}&password=${password}&search_phrases=[${search_phrases_array}]`);
  const response = http.post('https://u1rvapc8l9.execute-api.eu-central-1.amazonaws.com/dev/insertSearch', responseGet.body, { headers: { 'Content-Type': 'application/json', } });  
  

  check(response, {
    'Response is successful': (r) => r.status === 200,
  });

  if(response.status !== 200) return console.log(response.status_text,user_name, password, validSearchPhrase, invalidSearchPhrase);
  sleep(1);
}
