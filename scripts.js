const userName = "Faheem-" + Math.floor(Math.random() * 1000)
const password = "x";

document.querySelector('#user-name').innerHTML = userName;

const socket = io.connect('https://192.168.100.152:8181/',{
    auth: {
        userName,password
    }
})


const localVideoEl = document.querySelector('#local-video');
const remoteVideoEl = document.querySelector('#remote-video');

let localStream;
let remoteStream;

let peerConnection;

let didIOffer=false;

let peerConfiguration = {
    iceServers:[
        {
            urls:[
              'stun:stun.l.google.com:19302',
              'stun:stun1.l.google.com:19302'
            ]
        }
    ]
}


const call = async e=>{
    console.log("call clicked....")
    await fetchUserMedia();
    await createPeerConnection();

    // create offer
    try{
        console.log("creating offer..")
        const offer = await peerConnection.createOffer();
        console.log(offer);
        peerConnection.setLocalDescription(offer);
        didIOffer = true;
        socket.emit('newOffer', offer);
    }catch(err){
        console.log(err);
    }

}

const addAnswer = async (offerObj)=>{
    await peerConnection.setRemoteDescription(offerObj.answer)
}
const answerOffer = async (offerObj) =>{
    console.log(offerObj);
    await fetchUserMedia();
    await createPeerConnection(offerObj);
    const answer = await peerConnection.createAnswer({});
    await peerConnection.setLocalDescription(answer);
    console.log(answer);
    // console.log(peerConnection.signalingState);


    offerObj.answer = answer;
    const offerIceCandidates = await socket.emitWithAck('newAnswer', offerObj);
    offerIceCandidates.forEach(c=>{
        peerConnection.addIceCandidate(c);
        console.log("=====================")
    })


}


const fetchUserMedia = async () =>{
    return new Promise( async(resolve, reject) =>{
        try{
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false,
            });
            localVideoEl.srcObject = stream;
            localStream = stream;
            resolve();
        }catch(err){
            console.log(err)
            reject();
        }       
    })
}

const createPeerConnection = (offerObj)=>{
    return new Promise( async(resolve, reject)=>{
        peerConnection = await new RTCPeerConnection(peerConfiguration);

        remoteStream = new MediaStream();
        remoteVideoEl.srcObject = remoteStream;


        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream)
        });

        peerConnection.addEventListener("signalingstatechange", (event) => {
            console.log(event);
            console.log("Signalling State: " + peerConnection.signalingState);
        });


        peerConnection.addEventListener('icecandidate',e=>{
            // console.log('........Ice candidate found!......')
            // console.log(e)
            if(e.candidate){
                socket.emit('sendIceCandidateToSignalingServer',{
                    iceCandidate: e.candidate,
                    iceUserName: userName,
                    didIOffer,
                    
                })
            }

        });    

        peerConnection.addEventListener('track', e=>{
            e.streams[0].getTracks().forEach(track=>{
                remoteStream.addTrack(track, remoteStream)
            
            })
        })
        
        if(offerObj){
            // console.log(peerConnection.signalingState);
            await peerConnection.setRemoteDescription(offerObj.offer);
            // console.log(peerConnection.signalingState);

        } 

        resolve();

    })
}


const addNewIceCandidate = iceCandidate=>{
    peerConnection.addIceCandidate(iceCandidate);

}

document.querySelector('#call').addEventListener('click', call);