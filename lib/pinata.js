
// this is a demo hacked together not production code 

// creates QR code from ticketId
// comoposits QR code on source image and uploads the result to Pinata
// uploads contract metadata Json to Pinata

// TODO: handle errors  
// TODO: rewrite async/await  


const PINATA_PUBLIC_KEY = '';
const PINATA_PRIVATE_KEY = '';

const QRCode = require('qrcode');
const pinataSDK = require('@pinata/sdk');
const sharp = require('sharp');
const path = require('path');

const pinata = pinataSDK(PINATA_PUBLIC_KEY, PINATA_PRIVATE_KEY);

const sourceImage = `${__dirname}/assets/source.png`;
const qrImage = `${__dirname}/assets/qr.png`;
const ticketImage = `${__dirname}/assets/ticket.png`;

const options = {
    pinataMetadata: {
        name: 'My Awesome NFT Ticket',
        keyvalues: {
            ticketId: 'ticketId',
            eventId: 'eventId'
        }
    },
    pinataOptions: {
        cidVersion: 0
    }
};

const contractMetaData = {
    "name": "My test NFT",
    "description": "A test!",
    "artifactUri": "ipfs://QmZ4Fxd9SnpGgf9wcPoZvpYpFo6kFKCdFLm1b6biV9KpFB",
    "creators": [],
    "formats": [
        {
            "uri": "ipfs://QmZ4Fxd9SnpGgf9wcPoZvpYpFo6kFKCdFLm1b6biV9KpFB",
            "mimeType": "image/png"
        }
    ],
    "rights": "© ",
    "royalties": {
        "decimals": 1,
        "shares": {
            "tz1WRfbUNC3Pnq3nUp6TwJLFtkWdddB8di1X": 1
        }
    },
    "thumbnailUri": "ipfs://QmZ4Fxd9SnpGgf9wcPoZvpYpFo6kFKCdFLm1b6biV9KpFB",
    "decimals": 0,
    "isBooleanAmount": false
};

const ticketId = `${options.pinataMetadata.keyvalues.eventId} ${options.pinataMetadata.keyvalues.ticketId}`;

// connect
pinata.testAuthentication().then((result) => {
    console.log(`pinata connection: ${result.authenticated}`);
}).catch((err) => {
    console.log(err);
});

// create qr code
QRCode.toFile(qrImage, ticketId, {}, (err) => {
    if (err) throw err;
    console.log('done');
    sharp(sourceImage)
        .resize(300)
        .flatten({ background: '#ff6600' })
        .composite([{ input: qrImage, gravity: 'southeast' }])
        .withMetadata()
        .png()
        .toFile(ticketImage, (err, info) => {

            if (err) { console.log(err); }

            console.log(sourceImage);
            console.log(qrImage);
            console.log(ticketImage);

            pinata.pinFromFS(ticketImage, null).then((result) => {
                const ipfsHash = result.IpfsHash;
                const ipfsUri = `ipfs://${ipfsHash}`;
                contractMetaData.artifactUri = ipfsUri;
                contractMetaData.formats.uri = ipfsUri;
                contractMetaData.thumbnailUri = ipfsUri; // TODO thumbnail
                console.log(`image hash: ${ipfsHash}`);

                pinata.pinJSONToIPFS(contractMetaData, null).then((result) => {
                    const ipfsHash = result.IpfsHash;
                    console.log(`metadata hash: ${ipfsHash}`);
                }).catch((err) => {
                    console.log(err);
                });

            }).catch((err) => {
                console.log(err);
            });

        });
});











