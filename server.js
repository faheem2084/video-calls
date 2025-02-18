
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

    if(offers.length){
        socket.emit('availableOffers', offers);
    }


    socket.on('newOffer', newOffer=>{
        offers.push({
            offererUserName : userName,
            offer: newOffer, 
            offerIceCandidates: [],
            answererUserName: null,
            answer: null,
            answererIceCandidates: []
        })
        socket.broadcast.emit('newOfferAwaiting', offers.slice(-1));

    })


    socket.on('newAnswer', (offerObj, ackFunction)=>{
        // console.log(offerObj);
        const socketToAnswer = connectedSockets.find(s=>s.userName === offerObj.offererUserName)
        if(!socketToAnswer){
            return
        }
        const socketIdToAnswer = socketToAnswer.socketId;
        const offerToUpdate = offers.find(o=>o.offererUserName === offerObj.offererUserName);
        if(!offerToUpdate){
            console.log('No matching offer.');
            return;
        }

        ackFunction(offerToUpdate.offerIceCandidates);
        offerToUpdate.answer = offerObj.answer;
        offerToUpdate.answererUserName = userName;
        console.log("------- here1 in newAnswer()");
        socket.to(socketIdToAnswer).emit('answerResponse', offerToUpdate);
        console.log("------- here 2 in newAnswer()");


    })

    socket.on('sendIceCandidateToSignalingServer', iceCandidateObj=>{
        const {didIOffer, iceUserName, iceCandidate} = iceCandidateObj;

        if(didIOffer){
            const offerInOffers = offers.find(o=>o.offererUserName === iceUserName);
            if(offerInOffers){
                offerInOffers.offerIceCandidates.push(iceCandidate);
                if(offerInOffers.answererUserName){
                    // pass it to the other socket..
                    const socketToSendTo = connectedSockets.find(s=>s.userName ===offerInOffers.answererUserName);
                    if(socketToSendTo){
                        consol
                        socket.to(socketToSendTo.socketId).emit('receivedIceCandidateFromServer', iceCandidate);
                    }else{
                        console.log("ice found, but answer not found")
                    }
                }
            }    
        }else{
            // ice is coming from answerer
            const offerInOffers = offers.find(o=>o.answererUserName === iceUserName);
            const socketToSendTo = connectedSockets.find(s=>s.userName ===offerInOffers.offererUserName);
            if(socketToSendTo){
                socket.to(socketToSendTo.socketId).emit('receivedIceCandidateFromServer', iceCandidate);
            }else{
                console.log("ice candidate found, but offerer not found")
            }

        }
        
        // console.log(offers)
    })


} )