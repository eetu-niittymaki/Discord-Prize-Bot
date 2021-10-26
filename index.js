const Discord = require("discord.js")
const dotenv = require("dotenv")
const fs = require("fs")
const gdrive = require('./gdriveServer.js')
const axios = require('axios')
const client = new Discord.Client()

dotenv.config()

let alreadyEntered = []

client.once("ready", () => {
    console.log("ready!")
    let hasEntered = fs.readFileSync("hasEntered.txt", "utf-8")
    let enteredByLine = hasEntered.split("\n")
    alreadyEntered.push(enteredByLine)
})

const getRandom = (array) => {
    return array[~~((array.length -1) * Math.random())]
} 

const randomItem = (textByLine) => {
    return getRandom(textByLine)
}

const start = (message) => {
    let text = fs.readFileSync("prizes.txt", 'utf-8')
    let textByLine = text.split("\n")
    if (textByLine.length === 1) {
        message.channel.send("Palkinnot on arvottu.")
        return
    } else {
        let randItem = randomItem(textByLine)
        message.channel.send(`${message.author} palkintosi on: ${randItem}, toimitamme palkintosi yksityisviestillä.`)
        fs.writeFileSync("winners.txt", (message.author.username + ": " + `${randItem}\n`), {flag: "a+"})
        fs.writeFileSync("hasEntered.txt", (message.author) + "\n", {flag: "a+"})
        let remove = text.replace(`${randItem}\n`, "")
        fs.writeFileSync("prizes.txt", remove )
    }
}

// For testing purposes only
/*
client.on("message", message => {
    if (message.content === "!arpa") {
        start(message)
    }
})
*/

client.on("message", message => {
    if (message.content === "!arpa" && (message.channel.name === 'arpajaiset' || message.channel.name === 'test' || message.channel.name === 'botti')) {
        if (alreadyEntered.includes(message.author)) { // Limits participant entry to one time only
            message.channel.send(`Olit jo mukana arvonnassa ${message.author}.`)
        } else {
            start(message)
            alreadyEntered.push(message.author)
        }
    }
})

client.login(process.env.TOKEN)