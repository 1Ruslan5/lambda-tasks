const readline = require("readline");

const rl = readline.createInterface(process.stdin, process.stdout);

const rewriteWithPoints = (str) => {
    let value;
    let array = [str];
    let word = str;
    if (!str.length) {
        return "Empty string";
    }
    for (let i = 1; i < array[0].length; i++) {
        word = str = [str.slice(0, i) + "." + str.slice(i)].join('');
        array.push(str);
        value = i;
        for (let j = 1; j < value; j++) {
            str = [str.slice(0, j) + "." + str.slice(j)].join('');
            array.push(str);
            if (value - 1 > j) {
                str = word;
            } else {
                word = str;
                j = 0;
                value -= 1;
            }
        }
        str = array[0];
    }
    return array;
}

rl.question("Please, enter a symbols combination like 'abcde' and press enter:\n",
    string => {
        let s = string.trim();
        console.log(points(s));
        rl.close();
    });

