/** @type {RTCPeerConnection} */

const localVideoEl = document.querySelector('#local-video');
const remoteVideoEl = document.querySelector('#remote-video');

let localStream;
let remoteStream;

let peerConnection;

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
    const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
    });

    localVideoEl.srcObject = stream;
    localStream = stream;

    await createPeerConnection();

    // create offer
    try{
        console.log("creating offer..")
        const offer = await peerConnection.createOffer();
        console.log(offer);
    }catch(err){
        console.log(err);
    }

}

const createPeerConnection = ()=>{
    return new Promise( async(resolve, reject)=>{
        peerConnection = await new RTCPeerConnection(peerConfiguration);
        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream)
        });
        peerConnection.addEventListener('icecandidate',e=>{
            console.log("ICE Candidate found.....");
            console.log(e);

        });

        resolve();

    })
}


document.querySelector('#call').addEventListener('click', call);