const fetch = require("node-fetch");
const db = require("quick.db");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const chalk = require('chalk');

module.exports = async (client) => {
    console.log(`${chalk.greenBright("==>")} Logging in as \"${client.user.username}#${client.user.discriminator}\" at ${new Date().toLocaleTimeString()}\n${chalk.greenBright("==>")} Global Prefix: ${client.foundation.config.globalPrefix}\n${chalk.greenBright("==>")} Serving ${client.guilds.size} servers.`);
    await client.guilds.get(client.foundation.config.logchannel[0]).channels.get(client.foundation.config.logchannel[1]).createMessage(`Bot is going up at ${new Date().toUTCString()}. (EST: ${new Date().toLocaleTimeString()}) | Serving ${client.guilds.size} servers.`);
    fetch("https://jailbreaks.app/status.php").then(res => res.json()).then(body => {
        if (body.status == "Signed") {
            client.editStatus(`online`, {
                name: `${client.foundation.config.globalPrefix}help | Signed`,
                type: 3
            });
        } else {
            client.editStatus(`dnd`, {
                name: `${client.foundation.config.globalPrefix}help | Revoked`,
                type: 3
            });
        }
    });
    setInterval(function() {
        exec("git add ./status/status.txt; git commit -m \"Update Database\"; git pull; git push; cd ./src;", function(err, data) {});
        fetch("https://jailbreaks.app/status.php").then(res => res.json()).then(body => {
            if (body.status == "Signed") {
                client.editStatus(`online`, {
                    name: `${client.foundation.config.globalPrefix}help | Signed`,
                    type: 3
                });
            } else {
                client.editStatus(`dnd`, {
                    name: `${client.foundation.config.globalPrefix}help | Revoked`,
                    type: 3
                });
            }
            client.guilds.get(client.foundation.config.logchannel[0]).channels.get(client.foundation.config.logchannel[1]).createMessage("Update: Checking in: " + new Date().toUTCString() + ". (EST: " + new Date().toLocaleTimeString() + ")\nCurrently Serving " + client.guilds.size + " servers.");
            let dmlist = db.get("dmlist.ids");
            let listofids = Array.from(dmlist.toString().split(" "));
            listofids.toString().split(",").forEach(function (id) {
                if (id != "Bruh") {
                    var filePath = path.join(__dirname, '../status/status.txt');
                    fs.readFile(filePath, {encoding: 'utf-8'}, function(err, data) {
                        if (!err) {
                            if (data == body.status) { return; } else {
                                var newValue;
                                if (body.status == "Signed") { newValue = data.replace("Revoked", "Signed"); }
                                else { newValue = data.replace("Signed", "Revoked") }
                                fs.writeFile(filePath, newValue, {encoding: "utf-8"}, function(err, data) {});
                            }
                            msgToSend = "";
                            if (body.status == "Signed") msgToSend = "Jailbreaks.app is now signed!\nhttps://jailbreaks.app";
                            else msgToSend = "Jailbreaks.app has been revoked. :(";
                            try {
                                client.getDMChannel(id).then(channel => {
                                    channel.createMessage(msgToSend);
                                });
                            } catch (e) {
                                return;
                            }
                        } else {
                            console.log(err);
                        }
                    });
                }
            });
            let channels = db.get("statuschannels.ids");
            listofids = Array.from(channels.toString().split(" "));
            listofids.toString().split(",").forEach(function (id) {
                client.guilds.forEach((guild) => { 
                    if (guild.channels.get(id) == undefined) return db.set("dmlist.ids", channels.filter(e => e !== id));
                    guild.channels.get(id).edit({
                        name: body.status
                    })
                })
            });
        })
    }, 300000);
}