const Discord = require("discord.js")
const dotenv = require("dotenv")
const fs = require("fs")
const gdrive = require('./gdriveServer.js')
const client = new Discord.Client()
const axios = require('axios')

dotenv.config()

let alreadyEntered = []

client.once("ready", async () => {
    console.log("ready!")
    const getEntrants = await gdrive.getHasEntered()
    alreadyEntered.push(getEntrants)
    console.log(getEntrants)
})

const start = async (message) => {
    //let text = fs.readFileSync("prizes.txt", 'utf-8')
    //let textByLine = text.split("\n")
    //if (textByLine.length === 1) {
        //message.channel.send("Palkinnot on arvottu.")
      //  return
    //} else {
        let randItem = await gdrive.getPrize()
        console.log("PALKINTO: ", randItem)
        message.channel.send(`${message.author} palkintosi on: ${randItem}, toimitamme palkintosi yksityisviestillä.`)
        //fs.writeFileSync("winners.txt", (message.author.username + ": " + `${randItem}\n`), {flag: "a+"})
        //fs.writeFileSync("hasEntered.txt", (message.author) + "\n", {flag: "a+"})
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
        alreadyEntered = JSON.stringify(alreadyEntered)
        const checkArray = alreadyEntered.indexOf(message.author.id)
        if (checkArray !== -1) { // Limits participant entry to one time only
            start(message)
            //alreadyEntered.push(message.author) LAITA TAKAS PÄÄLLE!
            await gdrive.postHasEntered(message.author.id)  
        } else {
            message.channel.send(`Olit jo mukana arvonnassa ${message.author}.`)
        }
    }
})

client.login(process.env.TOKEN)