const readline = require("readline");
const { describing } = require("./strings");

const rl = readline.createInterface(process.stdin, process.stdout);

const interective_sort = (string, options) => {
    let arrayAllValue = string.split(' ');
    arrayAllValue = arrayAllValue.filter(elm => elm);
    const {words, numbers} = arrayAllValue.reduce((total, current) => {
        if (!isNaN(current)) {
            total.numbers.push(current);
            return total
        }
        total.words.push(current);
        return total
    }, { words: [], numbers: [] })
    switch (options) {
        case '1':
            return words.sort((a, b) =>
                a.toLowerCase().localeCompare(b.toLowerCase()));
        case '2':
            return numbers.sort((a, b) => a - b);
        case '3':
            return numbers.sort((a, b) => b - a);
        case '4':
            return words.sort((a, b) => a.length - b.length);
        case '5':
            let task_five = new Set(words);
            return task_five
        case '6':
            let task_six = new Set(arrayAllValue);
            return task_six
        case "exit":
            return;
        default:
            console.log("Please, select one of the 1-6 operations");
    }
}

rl.setPrompt("Enter words and number throw space:\n");
rl.prompt();
rl.on("line", string => {
    rl.question(describing,
        options => {
            if (options.toLowerCase().trim() === "exit") {
                console.log("Bye!");
                rl.close();
                return
            }
            console.log(interective_sort(string, options));
            rl.setPrompt("Enter words and number throw space:\n");
            rl.prompt();
        });

});