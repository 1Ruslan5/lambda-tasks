import inquirer from "inquirer";
import {appendFileSync, readFileSync} from "fs";

const parseToBd = (textBDJson) => {
    appendFileSync('/lambda-task/2.CLI_Primitive_DB/textBD', JSON.stringify(textBDJson))
}

const search = (textBDJson) => {
    inquirer
        .prompt([
            {
                name: "question",
                message: "Do you want search user in DB?",
                type: "confirm"
            }
        ])
        .then(answer => {
            console.log(textBDJson);
            if (answer.question) {
                inquirer.prompt(
                    {
                        name: "question",
                        message: "Enter user's name, which you wanna find in DB",
                        type: "input",
                    }
                ).then(answer => {
                    let { search } = textBDJson.reduce((total, current) => {
                        if (answer.question === current.name) {
                            total.search.push(current);
                        }
                        return total
                    }, { search: [] })
                    if (search.length) {
                        console.log(search)
                        console.log(`${answer.question} was find`);
                        search.reduce((total, current) => {
                            console.log(current);
                        }, 0)
                        return
                    }
                    console.log(`${answer.question} wasn't find`);
                })
                return
            }
            console.log("Bye!");
        })
}

const user = () => {
    inquirer.prompt(
        {
            name: "name",
            message: "Enter name, for cancel press ENTER: ",
            type: "input",
        },
    ).then(answer_name => {
        let textBDJson = JSON.parse(readFileSync('/lambda-task/2.CLI_Primitive_DB/textBD', "utf8"));
        if (!answer_name.name) {
            return search(textBDJson);
        }
        inquirer.prompt([
            {
                name: "gender",
                message: "Choose your gender: ",
                type: "list",
                choices: ["male", "female"]
            },
            {
                name: "age",
                message: "Enter your age:",
                type: "input",
                validate: input => {
                    if (!isNaN(input) || !input) {
                        return true;
                    }
                    return "Please, enter valid value"
                }
            }
        ]).then(answer => {
            let name = answer_name.name.toLowerCase();
            name = name[0].toUpperCase() + name.slice(1);
            if (!answer.age) {
                let user_obj = {
                    name: name,
                    gender: answer.gender
                }
                textBDJson.push(user_obj);
                parseToBd(textBDJson);
                return search(textBDJson);
            }
            let user_obj = {
                name: name,
                gender: answer.gender,
                age: answer.age
            };
            textBDJson.push(user_obj)
            parseToBd(textBDJson);
            user();
        })
    })
}

user();