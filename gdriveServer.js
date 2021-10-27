const { google } = require('googleapis')
//const express = require('express')
const dotenv = require("dotenv")
//const app = express()
//app.use(express.json())

dotenv.config()

//const PORT = 3000

//app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

// Sheet IDs
const prizes = process.env.PRIZES
const winners = process.env.WINNERS
const hasEnteredId = process.env.HAS_ENTERED

let index = 0

// Random number generator
const getRandom = (array) => {
  return array[~~((array.length -1) * Math.random())]
} 

// Authenticates connection to Google Sheets
const authentication = async () => {
  const auth = new google.auth.GoogleAuth({
      keyFile: 'credentials.json',
      scopes: [ "https://www.googleapis.com/auth/spreadsheets", 
                "https://www.googleapis.com/auth/drive" ]
  })

  const client = await auth.getClient()
  const sheets = google.sheets({
      version: 'v4',
      auth: client
  })
  return { sheets }
}

// Read prizes from spreadsheet
const getPrize = async () => {
  try {
    const { sheets } = await authentication()

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: prizes,
      range: 'Taulukko1'
    })
    const randomPrize = await getRandom(response.data.values)
    for (let i = 0; i < response.data.values.length; i++) { // Loop through response to find prize index
      if (response.data.values[i] === randomPrize) {
        console.log(randomPrize, i)
        index = i
        console.log("Palkinto gdriveServer: ", randomPrize)
      }
    }
    return randomPrize
  } catch(e) {
    console.log(e)
  }
}

// Post winner and prize to google sheet
const postWinner = async (winner, prize) => {
  try {
    const { sheets } = await authentication()
    let values = [
      [winner, prize.toString()]
    ]
    let resource = {
      values
    }
  //const { winner, prize } = req.body // Decontructs http request
    console.log("postWinner :", resource)

    const writeReq = await sheets.spreadsheets.values.append({
      spreadsheetId: winners,
      range: 'Taulukko1',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource 
    })
    if (writeReq.status === 200) {
      //return res.json({ msg: "Success"})
      deletePrize()
    }
  } catch(e) {
    console.log("Error updating sheet", e)
  }
}

// Delete prize with given index
const deletePrize = async () => {
  try {
    const { sheets } = await authentication()

    const deletePrize = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: prizes,
      resource: {
        "requests": [
          {
            "deleteRange": {
              "range": {
                "startRowIndex": index,
                "endRowIndex": index + 1,
              },
              "shiftDimension": "ROWS"
            }
          }
        ]
      }
    })
    console.log("Deleted prize with index", index)
  } catch (e) {
    console.log(e)
  }
}

/*
// Read winners from spreadsheet
app.get('/winners', async (req, res) => {
  try {
    const { sheets } = await authentication()

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: winners,
      range: 'Taulukko1'
    })
      // arr.push(response.data.values.toString())
    console.log(response.data.values)
  } catch(e) {
    console.log(e)
    res.status(500).send()
  }
})
*/
// Read persons who have already entered raffle
const getHasEntered = async () => {
  try {
    const { sheets } = await authentication()

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: hasEnteredId,
      range: 'Taulukko1'
    })
    return response.data.values
  } catch(e) {
    console.log(e)
  }
}

// Add raffle entrant to Google Sheet
const postHasEntered = async (hasEnteredIn) => {
  try {
    const { sheets } = await authentication()
    const { enterWinner } = hasEnteredIn

    const writeReq = await sheets.spreadsheets.values.append({
      spreadsheetId: hasEnteredId,
      range: 'Taulukko1',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [
            [enterWinner],
        ] 
      }  
    })
    if (writeReq.status === 200) {
      console.log("Added entrant to sheet")
    }
  } catch(e) {
    console.log("Error updating sheet", e)
  }
}

// prints all files and folders service account has access to
/*
drive.files.list({}, (err, res) => {
    if (err) throw err
    const files = res.data.files;
    if (files.length) {
    files.map((file) => {
      console.log(file)
    })
    } else {
      console.log('No files found')
    }
  })
*/

module.exports = { getPrize, getHasEntered, postHasEntered, postWinner}