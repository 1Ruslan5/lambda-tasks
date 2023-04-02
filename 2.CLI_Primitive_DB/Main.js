import inquirer from "inquirer";
import fs from "fs";

user();

function user(){
    inquirer.prompt(
        {
            name: "name",
            message: "Enter name, for cancel press ENTER: ",
            type: "input",
        },
    ).then(answear_name=>{
        if(answear_name.name === ""){
            return search();
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
                validate: input=>{
                    if(!isNaN(input) || input === ''){
                        return true;
                    }
                    return "Please, enter valid value"
                }
            }
        ]).then(answear =>{
            let name = answear_name.name.toLowerCase();
            name = name[0].toUpperCase() + name.slice(1);
            if(answear.age === ""){
                let user_obj={
                    name: name,
                    gender: answear.gender
                }
                fs.appendFileSync('/lambda-task/2.CLI_Primitive_DB/TextBD', JSON.stringify(user_obj)+"\n");
                return search();
            }
            let user_obj = {
                name: name,
                gender: answear.gender,
                age: answear.age
            };
            fs.appendFileSync('/lambda-task/2.CLI_Primitive_DB/TextBD', JSON.stringify(user_obj)+"\n");
            user();
        })
    })
}

function search(){
    inquirer
    .prompt([
        {
            name: "question",
            message: "Are you want search user in DB?",
            type:"confirm"
        }
    ])
    .then(answear =>{
        let textBDJson = fs.readFileSync('/lambda-task/2.CLI_Primitive_DB/TextBD', "utf8")
        .toString().split("\n");
        textBDJson.pop();
        for(let i in textBDJson){
            textBDJson[i] = JSON.parse(textBDJson[i]); 
        }
        console.log(textBDJson);
        if(answear.question){
            inquirer.prompt(
                {
                    name: "question",
                    message: "Enter user's name, which you wanna find in DB",
                    type: "input",
                }).then(answear=>{
                    let search = []
                    for(let i in textBDJson){
                        if(answear.question === textBDJson[i].name){
                            search.push(textBDJson[i]);
                        }
                    }
                    if(search.length > 0){
                        console.log(`${answear.question} was find`);
                        for(let i in search){
                            console.log(search[i]);
                        }
                    }else{
                        console.log(`${answear.question} wasn't find`);
                    }
                })
        }else{
            console.log("Bye!");
        }
    })
}