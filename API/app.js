// This is the backend API for the Performing Arts website.
// Here, we fetch simple data from the Google APIs and organize it into classes.

import { google } from 'googleapis'
import Photos from 'googlephotos'
import { DateTime } from './node_modules/luxon/build/node/luxon.js'
import express from 'express'
import fetch from 'node-fetch'
import util from 'util'

import fs from 'fs'

const { port, redirect, scopes, webhook, urgentWebhook } = JSON.parse(fs.readFileSync('./config/main.json'))
const { client } = JSON.parse(fs.readFileSync('./config/key.json'))

log("Startup", "The Performing Arts API has started and is preparing for service.")

const oauthClient = new google.auth.OAuth2(client.id, client.secret, redirect)

const url = oauthClient.generateAuthUrl({ access_type: 'offline', scope: scopes })

log("Auth", `A new auth URL has been generated: ${url}`, false)

let creds = new Object()
let albums = new Array()
let featured = new Object()
let calledAt = ''
class credentials {

    constructor(data) {
        
        this.accessToken = data?.access_token,
        this.refreshToken = data?.refresh_token,
        this.expiry = data?.expiry_date
        this.scopes = data?.scope || null
        
    }

    checkExpired() {

        if (this.expiry <= ((Date.now()) - 1000)) {

            return true

        }

        else { return false }

    }

    async refresh() { 

        oauthClient.setCredentials({ refresh_token: this.refreshToken })
        try {
            
            let resp = await oauthClient.refreshAccessToken()

            let newCreds = resp?.credentials

            this.accessToken = newCreds?.access_token
            this.expiry = newCreds?.expiry_date
            this.scopes = newCreds?.scope || this.scopes

            return true

        } catch (err) {
            log("Auth Refresh Error", err)
            return false
        }     
        
    }

    save() { 

        let inData = JSON.parse(fs.readFileSync('./config/key.json'))

        inData.oauth.refresh = this.refreshToken

        fs.writeFileSync('./config/key.json', JSON.stringify(inData, null, 2))

        return true 

    }

}

// await auth()
let photos = new Photos(creds.accessToken)
// await updateAlbums() 

async function auth() { 
    
    try {
        
        let inData = JSON.parse(fs.readFileSync('./config/key.json'))

        let refreshToken = inData.oauth.refresh

        oauthClient.setCredentials({ refresh_token: refreshToken })
        let resp = await oauthClient.refreshAccessToken()

        creds = new credentials(resp.credentials)
        
    } catch(err) { 

        log("Auth Startup Error", err)
        return false 

    }

    return true 

}

async function updateAlbums() { 

    calledAt = DateTime.now().toLocaleString(DateTime.TIME_SIMPLE)

    let preCompiled = new Array()
    let albumsResp = await photos.albums.list(50)

    preCompiled.push(...albumsResp.albums)

    while (albumsResp?.nextPageToken) { 
        
        albumsResp = await photos.albums.list(50, albumsResp?.nextPageToken)
        preCompiled.push(...albumsResp.albums)

    }

    albums = new Array()
    class album { 
        
        constructor(data) {

            this.id = data.id
            this.title = data.title
            this.size = data.mediaItemsCount 
            this.cover = data.coverPhotoBaseUrl
            this.coverID = data.coverPhotoMediaItemId

         }
        
    }

    preCompiled.forEach((apiAlbum) => { 

        let parsed = new album(apiAlbum)

        if (parsed.title.includes('_web') && !parsed.title.includes('_web-featured')) { 

            parsed.title = parsed.title.replace('_web ', '').replace('_web', '')
            albums.push(parsed)

        }

        if (parsed.title.includes('_web-featured')) { 

            parsed.title = parsed.title.replace('_web-featured ', '').replace('_web-featured', '')
            featured = parsed

        }
            
    })

    return true 
    
}

function log(title, msg, log = true, urgent = false) { 

    console.log(`${title} • ${msg}`)

    if (log) {

        try {

            let chosenHook = webhook
            if (urgent) { chosenHook = urgentWebhook }

            fetch(chosenHook, {
                method: "post",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "content": null,
                    "embeds": [
                        {
                            "title": title,
                            "description": msg,
                            "color": 5814783,
                            "author": {
                                "name": "New Log Outputted"
                            },
                            "footer": {
                                "text": "PAW-API • Performing Arts Website API",
                                "icon_url": "https://cdn.discordapp.com/attachments/863228406970712125/1053072030389518437/BDBCDEB8-34E6-4BBF-A278-EE58DA753DCC.png"
                             }
                        }
                    ],
                    "attachments": []
                })
            })

        } catch (err) { console.error(err) }
    }

}

let lastTry = Date.now()

// let interval = setInterval(async () => { 

//     if (creds?.checkExpired()) { 

//         await creds?.refresh().catch((err) => { log("Auth Refresh Error", err) })

//         if (Date.now() - lastTry < 5000) {  
//             log("Urgent Auth Error", `A refresh token could not supply a new auth token.
//             This was caught within a setInterval timed for 750ms. 
//             Failure of someone from Sprout to address this error will lead to problems.
//             \n
//             Refresh Error: ${err}`, true, true)
//             clearInterval(interval)
//         } 

//         lastTry = Date.now()

//         log("Auth", "Refreshed the access token.")
//         photos = new Photos(creds.accessToken)

//     }

// }, 750)

// setInterval(async () => { 

//     await updateAlbums().catch((err) => { log("Update Error", err) })
    
// }, 120000)

const router = express.Router()
const app = express()
app.use(router)

app.listen(port)

log("Started", "The Performing Arts API is now listening for requests.")

router.use((request, response, next) => {

    response.header("Access-Control-Allow-Origin", "*")
    next()

})

app.get('/', async function (request, response, next) {
    
    response.status(200).json({ status: 200, message: "Welcome to the Performing Arts API. If you're seeing this, you are probably good with computers. You should consider helping out the performing arts program with technical stuff!" })

})

app.get('/connect*', async function (request, response, next) { 

    const code = request.query.code

    let { tokens } = await oauthClient.getToken(code)

    creds = new credentials(tokens)

    creds.save()
    
    response.status(200).json({ status: 200, message: "The new user has been authenticated." })

})

router.get('/albums', async (request, response, next) => {

    response.status(200).json({ status: 200, message: "All available albums are displayed.", albums: albums, lastUpdated: calledAt })
    
})

router.get('/featured', async (request, response, next) => {
        
    response.status(200).json({ status: 200, message: "All available albums are displayed.", featured: featured })

})

router.get('/media*', async (request, response, next) => {

    const albumId = request.query.id
    let author = null

    if (!albumId) { return response.status(404).json({ status: 404, message: "Album not found." })}
    
    let existing = new Array()
    let toSend = new Array()

    let returnedPhotos = await photos.mediaItems.search(albumId, 50)
    
    existing.push(...returnedPhotos.mediaItems)

    while (returnedPhotos?.nextPageToken) { 
        
        returnedPhotos = await photos.mediaItems.search(albumId, 50, returnedPhotos?.nextPageToken)
        existing.push(...returnedPhotos.mediaItems)
        
    }
    class media { 
        
        constructor(data) {

            this.id = data.id
            this.link = data.productUrl
            this.description = data?.description
            this.media = {
                compressed: data.baseUrl,
                lossless: `${data.baseUrl}=w${data.mediaMetadata.width}-h${data.mediaMetadata.height}`
            }
            this.type = data.mimeType
            this.metadata = { 
                taken: DateTime.fromISO(data?.mediaMetadata?.creationTime)?.toLocaleString(DateTime.DATETIME_MED),
                dimensions: { width: data?.mediaMetadata?.width, height: data?.mediaMetadata?.height },
                camera: { make: data?.mediaMetadata?.photo?.cameraMake, model: data?.mediaMetadata?.photo?.cameraModel },
                focalLength: data?.mediaMetadata?.photo?.focalLength,
                aperture: data?.mediaMetadata?.photo?.apertureFNumber,
                iso: data?.mediaMetadata?.photo?.isoEquivalent,
                exposure: data?.mediaMetadata?.photo?.exposureTime,
                processing: data?.mediaMetadata.video?.status == 'PROCESSING' ? true : false,
            }
            this.filename = data?.filename

            if (this.type.includes('video')) { 

                this.media.lossless = `${data.baseUrl}=dv`

            }

        }
        
    }

    existing.forEach((apiPhoto) => { 

        let parsed = new media(apiPhoto)

        toSend.push(parsed)
            
    })

    let album = albums.find(album => album.id === albumId)

    toSend.forEach((photo) => {

        if (album?.coverID === photo.id) {

            if (photo.description) {
                author = photo.description
            }

        }

    }) 
    
    
    response.status(200).json({ status: 200, message: "All available media is displayed.", media: toSend, author: author })

})

router.get('/events', async (request, response, next) => { 
      
    oauthClient.setCredentials({ access_token: creds.accessToken })
    const calendar = google.calendar({ version: 'v3', auth: oauthClient })
      
    calendar.events.list({
        calendarId: 'primary',
        timeMin: (new Date()).toISOString(),
        maxResults: 20,
        singleEvents: true,
        orderBy: 'startTime',
      }, (err, res) => {
        
        if (err) {
            response.header("Access-Control-Allow-Origin", "*");
            response.status(503).json({ status: 503, message: "Something went wrong." })
            console.log('Calander Error' + err)
            console.log(err)
        }
            
        const events = res.data.items
        const organizedEvents = new Array()
        class eventStruct { 

            constructor(data) { 
                
                this.id = data?.id
                this.name = data?.summary
                this.description = data?.description || "No description"
                this.location = data?.location || "No given location"
                this.status = data?.status
                this.url = data?.htmlLink
                this.times = {
                    created: DateTime.fromISO(data?.created)?.toLocaleString(DateTime.DATETIME_MED),
                    updated: DateTime.fromISO(data?.updated)?.toLocaleString(DateTime.DATETIME_MED),
                    starts: data?.start?.date ? DateTime.fromISO(data?.start?.date).toLocaleString(DateTime.DATETIME_MED) : DateTime.fromISO(data?.start?.dateTime).toLocaleString(DateTime.DATETIME_MED),
                    ends: data?.start?.date ? DateTime.fromISO(data?.end?.date).toLocaleString(DateTime.DATETIME_MED) : DateTime.fromISO(data?.end?.dateTime).toLocaleString(DateTime.DATETIME_MED),
                    month: data?.start?.date ? DateTime.fromISO(data?.start?.date).toFormat('LLLL') : DateTime.fromISO(data?.start?.dateTime).toFormat('LLLL'),
                    day: data?.start?.date ? DateTime.fromISO(data?.start?.date).toFormat('d') : DateTime.fromISO(data?.start?.dateTime).toFormat('d'),
                    startTime: data?.start?.date ? null : DateTime.fromISO(data?.start?.dateTime).toFormat('t'),
                    endTime: data?.end?.date ? null : DateTime.fromISO(data?.end?.dateTime).toFormat('t'),
                    year: data?.start?.date ? DateTime.fromISO(data?.start?.date).toFormat('yyyy') : DateTime.fromISO(data?.start?.dateTime).toFormat('yyyy')
                }
                this.creator = data?.creator?.email || 'Unknown'
                this.type = data?.type
                this.selfCreated = data?.creator?.self
                    
            }

        }
        
        events.forEach((apiEvent) => { 
            
            organizedEvents.push(new eventStruct(apiEvent))

        })

        response.status(200).json({ status: 200, message: "All available events are displayed.", events: organizedEvents })

    })
    
})

router.get('/news', async (request, response, next) => {

    response.status(501).json({ status: 501, message: "This endpoint has not been implemented yet." });

})