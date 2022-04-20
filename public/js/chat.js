const socket = io()

document.querySelector('#msg-form').addEventListener('submit', (e)=> {
    //to stop default page refresh
    e.preventDefault()
    const message = e.target.elements.message.value
    socket.emit('sendMessage', message, (error) => {
        if(error) {
            return console.log(error)
        }
        console.log("Message delivered")
    })
})

document.querySelector('#loc').addEventListener('click', () => {
    if(!navigator.geolocation) {
        return alert('Browser does not support geolocation')
    }
    navigator.geolocation.getCurrentPosition((position)=> {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            console.log("location shared")
        })
    })
})

socket.on('message', (msg) => {
    console.log(msg)
})