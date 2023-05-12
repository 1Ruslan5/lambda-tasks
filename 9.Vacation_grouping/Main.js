import fs from "fs"

let jsonArray = JSON.parse(fs.readFileSync('/lambda-task/9.Vacation_grouping/json_vacation.txt', "utf8"));
sortPackage(jsonArray);

function sortPackage(jsonArray){
  let newJSONArr = [];
  for(let i = 0; i < jsonArray.length; i++){
    jsonArray[i] = convertJSON(jsonArray[i]);
  }
  jsonArray = quickSort(jsonArray)
  if(jsonArray.length < 2){
    console.log(jsonArray)
    fs.writeFileSync("/lambda-task/9.Vacation_grouping/new_json_vacation.txt", JSON.stringify(jsonArray, null, 2));
  }else{
    let value = 0;
    newJSONArr.push(jsonArray[0]);
    for(let i = 1; i < jsonArray.length; i++){
        if(jsonArray[i].name === jsonArray[value].name){
            let length = newJSONArr.length-1;
            newJSONArr[length].weekenDates.push(jsonArray[i].weekenDates[0]);
        }else{
            value = i;
            newJSONArr.push(jsonArray[i]);
        }
    }
    console.log(newJSONArr);
    fs.writeFileSync("/lambda-task/9.Vacation_grouping/new_json_vacation.txt", JSON.stringify(newJSONArr, null, 2));
  }
}

function convertJSON(json){
    return {
        userId: json._id,
        name: json.user.name,
        weekenDates: [{startDate: json.startDate, endDate: json.endDate}]
    }
}

function quickSort(arr) {
  if (arr.length <= 1) {
    return arr;
  }

  const pivotIndex = Math.floor(arr.length / 2);
  const pivot = arr[pivotIndex];
  const left = [];
  const right = [];

  for (let i = 0; i < arr.length; i++) {
    if (i === pivotIndex) {
      continue;
    }
    if (arr[i].name < pivot.name) {
      left.push(arr[i]);
    } else {
      right.push(arr[i]);
    }
  }

  return [...quickSort(left), pivot, ...quickSort(right)];
}