const users = []

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({  id,username,room  }) => {
    //clean the data
    username=username.trim().toLowerCase()
    room=room.trim().toLowerCase()

    //validate
    if(!username || !room){
        return{
            error: 'Username and room are required!'
        }
    }

    //check for existing user
    const existingUser=users.find( (user) => {
        return user.room === room && user.username === username
    })

    if(existingUser){
        return {
            error:'Username is in use!'
        }
    }

    //store user
    const user= { id,username,room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const idx = users.findIndex((user) => user.id ===id)

    if(idx != -1){
        return users.splice(idx, 1)[0] 
    }
}

const getUser = (id) => {
    return users.find((user) => user.id === id)
}

const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room)
}

// addUser({
//     id:1,
//     username:'sid',
//     room:'1'
// })

// addUser({
//     id:2,
//     username:'vicky',
//     room:'1'
// })
// addUser({
//     id:3,
//     username:'xyz',
//     room:'12'
// })
// console.log(users)

// console.log(getUser(2))

// console.log(getUsersInRoom('1'))
// console.log(users)

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}