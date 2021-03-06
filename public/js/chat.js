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
const sideTemplate = document.querySelector('#side-template').innerHTML

//options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoScroll = () => {
    //new message elmt
    const $newMsg = $msgs.lastElementChild
    //height of the new message
    const newMsgStyles = getComputedStyle($newMsg)
    const newMsgMargin = parseInt(newMsgStyles.marginBottom)
    const newMsgHeight = $newMsg.offsetHeight + newMsgMargin
    //visible height
    const visibleHeight = $msgs.offsetHeight
    //height of msgs container
    const containerHeight = $msgs.scrollHeight
    //how far scrolled
    const scrollOffset = $msgs.scrollTop+visibleHeight

    if(containerHeight - newMsgHeight <= scrollOffset) {
        $msgs.scrollTop = $msgs.scrollHeight
    }

}

socket.on('message', (msg) => {
    //console.log(msg)
    const html = Mustache.render(msgTemplate, {
        username: msg.username,
        msg: msg.text,
        createdAt: moment(msg.createdAt).format('k:mm')
    })
    $msgs.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('locationMsg', (msg) => {
    const html = Mustache.render(locTemplate, {
        username: msg.username,
        url: msg.url,
        createdAt: moment(msg.createdAt).format('k:mm')
    })
    $msgs.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sideTemplate, {
        room, 
        users
    })
    document.querySelector('#sidebar').innerHTML = html
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
        //console.log("Message delivered")
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
            //console.log("location shared")
        })
    })
})

socket.emit('join', {username,room}, (error) => {
    if(error) {
        alert(error)
        location.href = '/'
    }
})

