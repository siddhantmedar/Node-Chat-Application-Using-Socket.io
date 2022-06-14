socket = io()

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('input')
const $messageFormBtn = document.querySelector('button')
const $messages = document.querySelector('#msgs')
const $sendLocationButton = document.querySelector('#loc')

//Templates
const messageTemplate = document.querySelector('#msg-template').innerHTML
const locationTemplate = document.querySelector('#loc-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () => {
    $newMessage = $messages.lastElementChild

    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    const visibleHeight = $messages.offsetHeight

    const containerHeight = $messages.scrollHeight

    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (ms) => {
    console.log(ms)
    const html = Mustache.render(messageTemplate, {
        username: ms.username,
        message:ms.text,
        createdAt: moment(ms.createdAt).format('hh:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (url) => {
    console.log('Printing location', url)
    const lochtml = Mustache.render(locationTemplate,{
        username: url.username,
        url:url.url,
        createdAt:  moment(url.createdAt).format('hh:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',lochtml)
    autoscroll()
})

socket.on('roomData', ({room, users}) => {
    const html=Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html
})

$messageForm.addEventListener('submit', (e)=>{
    e.preventDefault()
    $messageFormBtn.setAttribute('disabled','disabled')
    const msg=e.target.elements.msg.value

    socket.emit('send-message', msg, (err) => {
        $messageFormBtn.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()
         
        if(err){
            return console.log(err)
        }
        else{
            console.log('Delivered!')
        }
    })
})

$sendLocationButton.addEventListener('click',()=>{
    if (!navigator.geolocation){
        return alert('Geolocation is not supported by your browser!')
    }

    $sendLocationButton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((pos) => {
        socket.emit('loc', {
            lat: pos.coords.latitude,
            long: pos.coords.longitude
        },(msg) =>{
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared successfully!', msg)
        })
    })
})

socket.emit('join',{username, room},(err) => {
    if(err){
        alert(err)
        location.href='/'
    }
})