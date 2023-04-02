const readline = require("readline");

const rl = readline.createInterface(process.stdin, process.stdout);

rl.setPrompt("Enter words and number throw space:\n");
rl.prompt();
rl.on("line", string =>{
    rl.question("Select one of the 1-6 operations: \n\
    1.Sort words by alphabetical order;\n\
    2.Display numbers from low to high;\n\
    3.Display numbers from high to low;\n\
    4.Display words by their length;\n\
    5.Display only unique words;\n\
    6.Display all values but only unique;\n\
    To shut down the program, enter 'exit'.\n",
    options =>{    
        if(options.toLowerCase().trim() === "exit"){
            console.log("Bye!");
            rl.close();
        }else{
            console.log(interective_sort(string, options));
            rl.setPrompt("Enter words and number throw space:\n");
            rl.prompt();
        }
    });

});

function interective_sort(string, n){
    let arrayAllValue = string.split(' ');
    arrayAllValue = arrayAllValue.filter(elm => elm != "");
    let arrayNumberValue=[]; 
    let arrayWordsValue = [];
    for(let i of arrayAllValue){
        if(!isNaN(i)){
            arrayNumberValue.push(i);
        }else{
            arrayWordsValue.push(i);
        }
    }
    switch(n){
        case '1':
            return arrayWordsValue.sort((a, b)  =>
            a.toLowerCase().localeCompare(b.toLowerCase()));
        case '2':
            return arrayNumberValue.sort((a, b) => a - b);
        case '3':
            return arrayNumberValue.sort((a, b) => b - a);
        case '4':
            return arrayWordsValue.sort((a, b) => a.length - b.length);
        case '5':
            let task_five = new Set(arrayWordsValue);
            return task_five
        case '6':
            let task_six = new Set(arrayAllValue);
            return task_six
        case "exit":
            return;
        default:
            console.log("Please, select one of the 1-6 operations");
    }
};