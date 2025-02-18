
const fs=require('fs');

const https = require('https');

const express = require('express');
const app = express();
const socketio = require('socket.io');


app.use(express.static(__dirname));

const key = fs.readFileSync('certs/cert.key');
const cert = fs.readFileSync('certs/cert.crt');

const expressServer = https.createServer({key, cert}, app);
const io = socketio(expressServer);

expressServer.listen(8181);

const offers=[
    // offererUserName
    // offer
    // iceCandidates
    // AnswererUserName
    //answer
    // answerericeCandidates
];

const connectedSockets = [
    // userName, socket
]


io.on('connection', (socket)=>{
    const userName = socket.handshake.auth.userName
    const password = socket.handshake.auth.password

    connectedSockets.push({
        socketId: socket.id,
        userName,
    })

    socket.on('newOffer', newOffer=>{
        offers.push({
            offererUserName : userName,
            offer: newOffer, 
            iceCandidates: [],
            answererUserName: null,
            answer: null,
            answererIceCandidates: []
        })
        socket.broadcast.emit('newOfferAwaiting', offers.slice(-1));

    })

    socket.on('sendIceCandidateToSignalingServer', iceCandidateObj=>{
        const {didIOffer, iceUserName, iceCandidate} = iceCandidateObj;
        console.log("here1...")
        console.log("Ice Username: " + iceUserName);

        if(didIOffer){
            console.log("here 2....")
            const offerInOffers = offers.find ( o=> o.offererUserName === iceUserName)
            if(offerInOffers){
                console.log("here 4......")
                offerInOffers.offerIceCandiates.push(iceCandidate);
                console.log("-------------->"+ iceCandidate )
            }
        }
        console.log(offers)
    })


} )