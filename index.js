const Discord = require('discord.js');
const fs = require('fs');
const env = require('dotenv').config();
const path = require('path');
const dbFileName = process.env.TD_DB ? process.env.TD_DB : path.join(__dirname, 'db', 'todos.json');
const prefix = process.env.TD_PREFIX ? process.env.TD_PREFIX : 'todos';
const color = process.env.TD_COLOR ? process.env.TD_COLOR : '#0099ff';
const token = process.env.TD_AUTH_TOKEN;
const username = process.env.TD_USERNAME ? process.env.TD_USERNAME : 'Todo Bot';
const messageFormatFileName = path.join(__dirname, 'messages.json');
let messageFormats;
let client;

function loadMessageFormats() {
    return new Promise(resolve => {
        fs.readFile(messageFormatFileName, 'utf-8', (err, data) => {
            if (!err && data) {
                messageFormats = JSON.parse(data);
                return resolve();
            }
            return reject("Message formats file is missing!");
        });
    });
}

loadMessageFormats()
    .then(() => {
        if (!token) {
            throw new Error(messageFormats.errors.botAuthTokenRequired);
        }

        const check = require("check-node-version");
        check({ node: "<12", }, (error, result) => {
            if (error) {
                console.error(error);
                return;
            }

            if (result.isSatisfied) {
                require('array-flat-polyfill');
                return readFile().then(start);
            }
        });
    })
    .catch(e => {
        console.error(e);
    });

function readFile() {
    return new Promise(resolve => {
        fs.readFile(dbFileName, 'utf-8', (err, data) => {
            if (!err && data) {
                return resolve(JSON.parse(data));
            }
            return resolve({});
        });
    });
}

function writeFile(todos) {
    return new Promise(resolve => {
        fs.writeFile(dbFileName, JSON.stringify(todos), (err) => {
            if (err) {
                console.error(err);
                return resolve(false);
            }
            return resolve(true);
        });
    });
}

function start(todos) {
    try {
        const helpEmbed = new Discord.MessageEmbed()
            .setColor(color)
            .setTitle(messageFormats.help.title)
            .addField(prefix + ' add <description>', messageFormats.help.add, false)
            .addField(prefix + ' remove <number>', messageFormats.help.remove, false)
            .addField(prefix + ' help', messageFormats.help.help, false)
            .addField(prefix, messageFormats.help.current, false);
        client = new Discord.Client();

        client.once('ready', () => {
        	console.log(messageFormats.console.ready);
        });

        client.on('guildCreate', guild => {
            guild.systemChannel.send(helpEmbed);
        });

        client.on('message', message => {
            if (!message.content.startsWith(prefix) || message.author.bot) return;
            const args = message.content.slice(prefix.length + 1).split(' ');
            const command = args.shift().toLowerCase();
            if (command) {
                let help = false;
                if (command === 'add' || command === 'a') {
                    if (!todos[message.guild.id]) {
                        todos[message.guild.id] = [];
                        todos[message.guild.id][message.channel.id] = [];
                    } else if (!todos[message.guild.id][message.channel.id]) {
                        todos[message.guild.id][message.channel.id] = [];
                    }
                    const newTodo = args.join(' ');
                    if (newTodo) {
                        todos[message.guild.id][message.channel.id].push(newTodo);
                        writeFile(todos);
                        let respondText = messageFormats.responds.addSuccess;
                        respondText = respondText.replace('{0}', newTodo);
                        message.channel.send(respondText);
                    } else {
                        help = true;
                    }
                } else if (command === 'remove' || command === 'r') {
                    if (todos[message.guild.id] && todos[message.guild.id][message.channel.id] && todos[message.guild.id][message.channel.id].length > 0) {
                        let idx = args.shift();
                        if (idx) {
                            idx = Number(idx);
                            idx--;
                            if (idx >= 0 && idx<todos[message.guild.id][message.channel.id].length) {
                                const deleted = todos[message.guild.id][message.channel.id].splice(idx, 1);
                                writeFile(todos);
                                let respondText = messageFormats.responds.removeSuccess;
                                respondText = respondText.replace('{0}', deleted);
                                message.channel.send(respondText);
                            } else {
                                message.channel.send(messageFormats.responds.removeNotFound);
                            }
                        } else {
                            help = true;
                        }
                    } else {
                        message.channel.send(messageFormats.responds.removeEmptyList);
                    }
                } else {
                    help = true;
                }
                if (help) {
                    message.channel.send({ embed: helpEmbed });
                }
            } else {
                if (todos[message.guild.id] && todos[message.guild.id][message.channel.id] && todos[message.guild.id][message.channel.id].length > 0) {
                    let descriptions = [];
                    let description = '';
                    for (let i=0; i<todos[message.guild.id][message.channel.id].length; i++) {

                        let newLine = messageFormats.responds.descriptionLine + '\n';
                        newLine = newLine.replace('{0}', (i+1)).replace('{1}', todos[message.guild.id][message.channel.id][i]);
                        if (description.length + newLine.length > 2048) {
                            descriptions.push(description);
                            description = newLine;
                        } else {
                            description += newLine;
                        }
                    }
                    descriptions.push(description);
                    for (let i=0; i<descriptions.length; i++) {
                        let title = message.channel.name;
                        title = descriptions.length > 1 ? title + '(' + (i+1) + '/' + descriptions.length + ')' : title;
                        const exampleEmbed = new Discord.MessageEmbed()
                        	.setColor(color)
                        	.setTitle(title)
                            .setDescription(descriptions[i]);
                        message.channel.send({ embed: exampleEmbed });
                    }
                } else {
                    message.channel.send(messageFormats.responds.showEmptyList);
                }
            }
        });

        client.login(token);
    } catch (e) {
        console.error(e);
    }
}

function end() {
    if (client) {
        client.destroy();
        client = null;
        console.log(messageFormats.console.bye);
    }
}

process.on('exit', end);
process.on('SIGINT', end);
process.on('SIGUSR1', end);
process.on('SIGUSR2', end);
process.on('uncaughtException', end);
