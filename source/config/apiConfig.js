const {exec} = require("child_process");
const createDirectory = require('../utils/createDirectory.js')
let fs = require("fs-extra");
const axios = require('axios')

const apitempalte = axios.get('https://hesediel.fr/cli-creative/template/api')

function apiConfig(answers){
    createDirectory(answers);
    fs.copy('', `${answers.name}`, function (err) {
        if (err) return console.error(err)
    });
    exec(`cd ${answers.name} && npm init --yes && npm install express`, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.log(`\x1b[32mApplication prête a l'emploi\x1b[0m`);
    });
}

module.exports = apiConfig;