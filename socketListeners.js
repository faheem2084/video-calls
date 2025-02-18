socket.on('availableOffers', offers=>{
    console.log(offers);
    createOfferEls(offers)
})


socket.on('newOfferAwaiting', offers=>{
    createOfferEls(offers)
})


socket.on('answerResponse',offerObj=>{
    console.log(offerObj);
    addAnswer(offerObj);
})

socket.on('receivedIceCandidateFromServer', iceCandidate=>{
    console.log("in receivedIceCandidateFromServer.............." )
    addNewIceCandidate(iceCandidate);
})

function createOfferEls(offers){
    // make a green answer button for this new offer
    const answerEl = document.querySelector('#answer');
    offers.forEach(o=>{
        console.log(o);
        const newOfferEl = document.createElement('div');
        newOfferEl.innerHTML = `<button class="btn btn-success col-1">Answer - ${o.offererUserName} </button>`;
        newOfferEl.addEventListener('click', ()=>answerOffer(o));
        answerEl.appendChild(newOfferEl);

    })


}