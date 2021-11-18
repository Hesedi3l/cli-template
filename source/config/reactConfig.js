const { Listr } = require('listr2');
const fs = require("fs");
const { exec } = require("child_process");
const path = require('path');

function reactConfig(answers) {
    const tasks = new Listr(
        [
            {
                title: 'Build react-app ...',
                task: (context, task)=> {
                    return task.newListr([
                        {
                            title: 'Clone repositories',
                            task: async () => {
                                try {
                                    return await cloneRepo(answers);
                                } catch (err) {
                                    console.log(err)
                                }
                            }
                        },
                        {
                            title: 'Delete all files',
                            task: async () => {
                                try {
                                    return await deleteFiles(answers);
                                } catch (err) {
                                    console.log(err)
                                }
                            }
                        },
                        {
                            title: 'Create package.json',
                            task: async () => {
                                try {
                                    return await createPackageJson(answers);
                                } catch (err) {
                                    console.log(err)
                                }
                            }
                        },
                        {
                            title: 'Copy files',
                            task: async () => {
                                try {
                                    return await copyFiles(answers);
                                } catch (err) {
                                    console.log(err)
                                }
                            }
                        },
                        {
                            title: 'Remove packages',
                            task: async () => {
                                try {
                                    await wait(2);
                                    return await fs.rmdirSync(path.join(process.cwd(), `${answers.name}/packages`), {recursive: true});
                                } catch (err) {
                                    console.log(err)
                                }
                            }
                        }
                    ],{
                        concurrent: false
                    })
                }
            },
            {
                title: 'Install dependencies',
                task: async () => {
                    try {
                        return await installDependencies(answers);
                    } catch (err) {
                        console.log(err)
                    }
                }
            }
        ],
        {
            concurrent: false
        }
    )
    tasks.run();
}
/******************************************
 * Function Tasks - installDependencies
 ******************************************/
function installDependencies(answers){
    return new Promise((resolve, reject) => {
        exec(`&& cd ${answers.name} && npm install react react-router-dom react-scripts`, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return reject(error);
            }
            if (stderr) {
                return reject(error);
            }
            console.log(`stdout: ${stdout}`);
            resolve();
        });
    })
}
/******************************************
 * Function Tasks - cloneRepo
 ******************************************/
function cloneRepo(answers){
    return new Promise((resolve, reject) => {
        exec(`git clone --filter=blob:none --no-checkout --depth 1 --sparse https://github.com/facebook/create-react-app ${answers.name} && cd ${answers.name} && git sparse-checkout init --cone && git sparse-checkout add packages/cra-template/template && git checkout`, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return reject(error);
            }
            if (stderr) {
                return reject(error);
            }
            console.log(`stdout: ${stdout}`);
            resolve();
        });
    })
}
/******************************************
 * Function Tasks - deleteFiles
 ******************************************/
function deleteFiles(answers){
    return new Promise((resolve, reject) => {
       fs.readdir(answers.name, (err, files)=>{
           if (err) {
               return reject(err);
           }
           console.log(process.cwd())
           files.forEach(file => {
               if (file !== `packages` && file !== `.git`){
                   fs.unlinkSync(path.join(process.cwd(), `${answers.name}/${file}`))
               }
           })
           fs.readdir(`${answers.name}/packages/cra-template`, (err, files)=>{
               if (err) {
                   return reject(err);
               }
               console.log(process.cwd())
               files.forEach(file => {
                   if (file === 'README.md' && file === 'template.json')
                       fs.unlinkSync(path.join(process.cwd(), `${answers.name}/packages/cra-template/${file}`))
               })
               resolve();
           })
       })
    })
}
/******************************************
 * Function Tasks - createPackageJson
 ******************************************/
function createPackageJson(answers){
    return new Promise((resolve, reject) => {
        exec(`cd ${answers.name} && npm init --yes`, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return reject(error);
            }
            if (stderr) {
                return reject(error);
            }
            resolve();
        });
    })
}
/******************************************
 * Function Tasks - copyFiles
 ******************************************/
function copyFiles(answers, filePath, outputPath){
    return new Promise((resolve, reject) => {
        const chemin = filePath || path.join(process.cwd(), `${answers.name}/packages/cra-template/template`);
        const output = outputPath || path.join(process.cwd(), `${answers.name}`);
        fs.readdir(chemin, (err, files) => {
            if (err) {
                return reject(err);
            }
            files.forEach(async file => {
                const stats = await fs.statSync(path.join(chemin, file));
                if (stats.isDirectory()) {
                    await fs.mkdirSync(path.join(output, file));
                    copyFiles(answers, path.join(chemin, file), path.join(output, file))
                } else{
                    await fs.renameSync(path.join(chemin, file), path.join(output, file));
                }
            })
            resolve();
        })
    })
}
/******************************************
 * Function Tasks - wait
 ******************************************/
function wait(nbSeconds){
    return new Promise((resolve, reject) => {
     setTimeout(resolve,nbSeconds * 1000)
    })
}


module.exports = reactConfig;