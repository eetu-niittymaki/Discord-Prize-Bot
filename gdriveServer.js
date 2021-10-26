const { google } = require('googleapis')
const express = require('express')
const dotenv = require("dotenv")
const app = express()
app.use(express.json())
const credentials = require('./credentials.json')

dotenv.config()

const PORT = 3000

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

const prizes = process.env.PRIZES
const winners = process.env.WINNERS
const hasEntered = process.env.HAS_ENTERED

const getRandom = (array) => {
  return array[~~((array.length -1) * Math.random())]
} 

const randomItem = (textByLine) => {
  return getRandom(textByLine)
}

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
app.get('/prizes', async (req, res) => {
  try {
    const { sheets } = await authentication()

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: prizes,
      range: 'Taulukko1'
    })
    //console.log(response.data.values)
    const randomPrize = randomItem(response.data.values)
    // console.log(randomPrize)
    for (let i = 0; i < response.data.values.length; i++) { // Loop through response to find prize index
      if (response.data.values[i] === randomPrize) {
        console.log(randomPrize, i)
        deletePrize(i)
        break
      }
    }
  } catch(e) {
    console.log(e)
    res.status(500).send()
  }
})

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

// Read persons who have already entered raffle
app.get('/has-entered', async (req, res) => {
  try {
    const { sheets } = await authentication()

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: hasEntered,
      range: 'Taulukko1'
    })
      // arr.push(response.data.values.toString())
    console.log(response.data.values)
  } catch(e) {
    console.log(e)
    res.status(500).send()
  }
})


// Post winner and prize to google sheet
app.post('/winners', async (req, res) => {
  try {
    const { winner, prize } = req.body // Decontructs http request
    const { sheets } = await authentication()

    const writeReq = await sheets.spreadsheets.values.append({
      spreadsheetId: winners,
      range: 'Taulukko1',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [
            [winner, prize],
        ] 
      }  
    })

    if (writeReq.status === 200) {
      return res.json({ msg: "Success"})
    }
    return res.json({ msg: "Something went wrong"})
  } catch(e) {
    console.log("Error updating sheet", e)
    res.status(500).send()
  }
})
// Delete prize with given index
const deletePrize = async (i) => {
  try {
    const { sheets } = await authentication()

    const deletePrize = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: prizes,
      resource: {
        "requests": [
          {
            "deleteRange": {
              "range": {
                "startRowIndex": i,
                "endRowIndex": i + 1,
              },
              "shiftDimension": "ROWS"
            }
          }
        ]
      }
    })
    console.log("Deleted prize with index", i)
  } catch (e) {
    res.status(500).send()
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
