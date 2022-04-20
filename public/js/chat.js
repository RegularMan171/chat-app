const socket = io()

document.querySelector('#msg-form').addEventListener('submit', (e)=> {
    //to stop default page refresh
    e.preventDefault()
    const message = e.target.elements.message
    socket.emit('sendMessage', message)
})

socket.on('message', (msg) => {
    console.log(msg)
})