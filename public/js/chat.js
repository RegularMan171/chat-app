const socket = io()

//Elements
const $messageForm = document.querySelector('#msg-form')
const $mfInput = $messageForm.querySelector('input')
const $mfButton = $messageForm.querySelector('button')
const $locButton = document.querySelector('#loc')
const $msgs = document.querySelector('#msgs')

//templates
const msgTemplate = document.querySelector('#msg-template').innerHTML
const locTemplate = document.querySelector('#loc-template').innerHTML

//options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

socket.on('message', (msg) => {
    console.log(msg)
    const html = Mustache.render(msgTemplate, {
        msg: msg.text,
        createdAt: moment(msg.createdAt).format('k:mm')
    })
    $msgs.insertAdjacentHTML('beforeend', html)
})

socket.on('locationMsg', (url) => {
    const html = Mustache.render(locTemplate, {
        url,
        createdAt: moment(url.createdAt).format('k:mm')
    })
    $msgs.insertAdjacentHTML('beforeend', html)
})

$messageForm.addEventListener('submit', (e)=> {
    //to stop default page refresh
    e.preventDefault()
    //disabling the button
    $mfButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value
    socket.emit('sendMessage', message, (error) => {
        //enabling button
        $mfButton.removeAttribute('disabled', 'disabled')
        $mfInput.value=''
        $mfInput.focus()

        if(error) {
            return console.log(error)
        }
        console.log("Message delivered")
    })
})

$locButton.addEventListener('click', () => {
    if(!navigator.geolocation) {
        return alert('Browser does not support geolocation')
    }
    //disabling location button
    $locButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position)=> {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            //enabling location button
            $locButton.removeAttribute('disabled', 'disabled')
            console.log("location shared")
        })
    })
})

socket.emit('join', {username,room})

