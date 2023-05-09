import fs  from "fs";

console.time('myFunction1');
let array = [];
let map = new Map();

for(let i = 0; i < 20; i++){
    array = mergeSort(fs.readFileSync(`/lambda-task/8.Instagram_Giveaway/words/out${i}.txt`, "utf8").toString().split('\n'));
    for(let value of array){
        if(map.has(value)){
            let count = map.get(value)
            map.set(value, count+1);
        }else{
            map.set(value, 0);
        }    
    }    
}

uniqueValues(map);
existInAllFiles(map);
existInAllLeastTen(map);

function uniqueValues(map){
    console.log(map.size);
}

function existInAllFiles(map){
    let count = 0;
    for(let value of map.values()){
        if(value === 19){
            count++;
        }
    }
    console.log(count);
}

function existInAllLeastTen(map){
    let count = 0;
    for(let value of map.values()){
        if(value >= 9){
            count++;
        }
    }
    console.log(count);
}
  
function mergeSort(a){
    if (a.length < 2) return a
    const middle = Math.floor(a.length / 2)
    const sorted_l = mergeSort(a.slice(0, middle))
    const sorted_r = mergeSort(a.slice(middle, a.length))
    return mergeSortedArrays(sorted_l, sorted_r)
}

function mergeSortedArrays(a, b) {
    const result = [];
    let i = 0;
    let j = 0;
    while (i < a.length && j < b.length) {
        if(a[i] === b[j]){
            j++;
        }else{
            if(a[i] < b[j]){
                result.push(a[i]);
                i++;
            } else {
                result.push(b[j]);
                j++;
            }
        }  
    }
    while (i < a.length) {
      result.push(a[i]);
      i++;
    }
    while (j < b.length) {
      result.push(b[j]);
      j++;
    }
    return result;
}
console.timeEnd('myFunction1');