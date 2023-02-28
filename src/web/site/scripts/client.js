"use strict"


async function onDeleteGroup(userToken, groupId) {
    try {
        const options = {
            method: "DELETE",
            headers: {
                "Content-Type" : "application/json",
                'Authorization': `Bearer ${userToken}`
            }
        }
        await fetch(`/api/groups/${groupId}`, options)
        location.href = `/groups`
    }
    catch (e) {
        console.log(e.message)
        alert('Error deleting group')
    }

}

async function onUpdateGroup(userToken, groupId, group) {

    try {
        const options = {
            method: "PUT",
            headers: {
                "Content-Type" : "application/json",
                "Accept": "application/json",
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify(group)
        }
        
        await fetch(`/api/groups/${groupId}`, options)
    }
    
    catch (e) {
        console.log(e.message)
        alert('Error updating group')
    }
}

async function onDeleteMovieFromGroup(userToken, groupId, movieId) {
    try {
        const options = {
            method: "DELETE",
            headers: {
                "Content-Type" : "application/json",
                'Authorization': `Bearer ${userToken}`
            }
        }
        await fetch(`/api/groups/${groupId}/${movieId}`, options)
        location.href = `/groups/${groupId}`
    }
    catch (e) {
        console.log(e.message)
        alert('Error deleting movie from group')
    }
    
}


async function updateElementState(elem, btn, token, groupId){

    const button = document.getElementById(btn)
    const element = document.getElementById(elem)
    const groupName = document.getElementById('groupName')
    const groupDesc = document.getElementById('groupDesc')

    if (element.contentEditable === 'true') {
        element.contentEditable = 'false'
        button.className = 'fa fa-edit'
    
        const group = { 
            name: groupName.innerText,
            description: groupDesc.innerText
        }

        await onUpdateGroup(token, groupId, group)
        
    } else {
        element.contentEditable = 'true'
        button.className = 'fa fa-save'
        element.focus()
    }
}

function validatePassword() {
            
    const password = document.getElementById("signup-password").value
    const confirmPassword = document.getElementById("confirm-password").value
    
    if (password != confirmPassword) {
        document.getElementById("error-message").innerHTML = "Passwords don't match."
        return false
    }

    const regex = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{}':"\\\;|,.<>\/?]*$/
    if (!regex.test(password)) {
        document.getElementById("error-message").innerHTML = "Invalid password."
        return false
    }

    return true
}

function togglePasswordVisibility(passwordId, buttonId){
      
    const password = document.getElementById(passwordId)
    const showHideBtn = document.getElementById(buttonId)

    if (password.type == "password") {
        password.type = "text"
        showHideBtn.className = "fa fa-eye-slash"
    } else {
        password.type = "password"
        showHideBtn.className = "fa fa-eye"
    }
}

function updateURL() {
    const limit = document.getElementById('limit').value
    if(limit > 0 && limit <= 250) {
        document.getElementById('topmovies').href = `/movies/top?limit=${limit}`
    }
}

function updateAction() {
    const id = document.getElementById('select-group').value
    document.getElementById('form').action = `/groups/${id}`
}