const Discord = require("discord.js")
const dotenv = require("dotenv")
const fs = require("fs")
const client = new Discord.Client()

dotenv.config()

client.once("ready", () => {
    console.log("ready!")
})

let alreadyEntered = []

const getRandom = (array) => {
    return array[~~((array.length -1) * Math.random())]
} 

const randomItem = (textByLine) => {
    return getRandom(textByLine)
}

let text = fs.readFileSync("prizesCopy.txt", 'utf-8')
let textByLine = text.split("\n")

const start = (message) => {
    if (textByLine.length === 1) {
        message.channel.send("Palkinnot on arvottu.")
        return
    } else {
        let randItem = randomItem(textByLine)
        let pos = textByLine.indexOf(randItem)
        let del = textByLine.splice(pos, 1)

        message.channel.send(`${message.author} palkintosi on: ${randItem}, toimitamme palkintosi yksityisviestillä.`)
        fs.writeFileSync("winnersCopy.txt", (message.author.username + ": " + `${randItem}\n`), {flag: "a+"})
        const remove = text.replace(`${randItem}\n`, "")
        fs.writeFileSync("prizesCopy.txt", remove )
    }
}

/* For testing purposes only
client.on("message", message => {
    if (message.content === "!arpa") {
        start(message)
    }
})
*/

client.on("message", message => {
    if (message.content === "!arpa") {
        if (alreadyEntered.includes(message.author)) { // Limits participant entry to one time only
            message.channel.send(`Olet jo mukana arvonnassa ${message.author}.`)
        } else {
            start(message)
            alreadyEntered.push(message.author)
        }
    }
})

client.login(process.env.TOKEN)