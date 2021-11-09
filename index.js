const Discord = require("discord.js")
const dotenv = require("dotenv")
const fs = require("fs")
const gdrive = require('./gdriveServer.js')
const client = new Discord.Client()
const axios = require('axios')

dotenv.config()

let alreadyEntered = []

client.once("ready", async () => {
    console.log("Ready!")
    let text = fs.readFileSync("hasEntered.txt").toString('utf-8')
    let textByLine = text.split("\n")
    //const getEntrants = await gdrive.getHasEntered()
    alreadyEntered.push(textByLine)
    console.log(alreadyEntered)
})

const start = async (message) => {
    //let text = fs.readFileSync("prizes.txt", 'utf-8')
    //let textByLine = text.split("\n")
    //if (textByLine.length === 1) {
        //message.channel.send("Palkinnot on arvottu.")
      //  return
    //} else {
        let randItem = await gdrive.getPrize()
        if (message.author.name === "simapoika")  {
            message.channel.send(`${message.author} mitä vittua? kukaaa?? hähh? ole hyvä: ${randItem} `)
        }
        message.channel.send(`${message.author} palkintosi on: ${randItem}, toimitamme palkintosi yksityisviestillä.`)
        //fs.writeFileSync("winners.txt", (message.author.username + ": " + `${randItem}\n`), {flag: "a+"})
        fs.writeFileSync("hasEntered.txt", (message.author) + "\n", {flag: "a+"})
        //let remove = text.replace(`${randItem}\n`, "")
        //fs.writeFileSync("prizes.txt", remove )
        await gdrive.postWinner(message.author.username, randItem)
   // }
}

// For testing purposes only
/*
client.on("message", message => {
    if (message.content === "!arpa") {
        start(message)
    }
})
*/

client.on("message", async (message) => {
    if (message.content === "!arpa" && (message.channel.name === 'arpajaiset' || message.channel.name === 'test' || message.channel.name === 'botti')) {
        if (!(alreadyEntered.includes(message.author))) { // Limits participant entry to one time only
            start(message)
            alreadyEntered.push(message.author) 
            fs.writeFileSync("hasEntered.txt", (message.author + "\n"), {flag: "a+"})
            //await gdrive.postHasEntered(message.author.id)  
        } else {
            message.channel.send(`Olit jo mukana arvonnassa ${message.author}.`)
        }
    }
})

client.login(process.env.TOKEN)