const Discord = require("discord.js")
const dotenv = require("dotenv")
const client = new Discord.Client()

dotenv.config()

client.once("ready", () => {
    console.log("ready!")
})

let usedNumbers = []
let alreadyEntered = []

const randNum = () => {
    return Math.floor((Math.random() * 69) +1)
}

const start = (message) => {
    let randomNumber = randNum()
    validate(message, randomNumber)
}

const validate = (message, randomNumber) => {
    if (usedNumbers.length >= 69) {
        message.channel.send("Numerot on arvottu.")
        return
    } else if (usedNumbers.includes(randomNumber)) {
        start(message)
    } else {
        message.channel.send(`${message.author} numerosi on: ${randomNumber}, toimitamme palkintosi yksityisviestillä.`)
        usedNumbers.push(randomNumber)
        console.log(usedNumbers.sort())
        console.log(usedNumbers.length)
        //console.log(message.author.username)
    }
}

/*
client.on("message", message => {
    if (message.content === "!arpa") {
        start(message)
    }
})
*/

client.on("message", message => {
    if (message.content === "!arpa") {
        if (alreadyEntered.includes(message.author)) {
            message.channel.send(`Olet jo mukana arvonnassa ${message.author}.`)
        } else {
            start(message)
            alreadyEntered.push(message.author)
        }
    }
})

client.login(process.env.TOKEN)