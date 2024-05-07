// shorten things a little bit
const el = (id) => document.querySelector("#" + id)
const showLoader = () => el("loader").style.visibility = "visible"
const hideLoader = () => el("loader").style.visibility = "hidden"


const  handleResponse  = (response) => {
    if (response.status === 401) {
        showLogin();
        return {};
    } else {
        hideLogin();
        return response.json();
    }
}

const handleJson = json => {
    
    if (json.success) {
        Tasks = json.data
        redrawTasks()
    }
    else {
        console.log(json.errors)
    }

}


const showLogin = () => {
    el("loginDialog").style.display = "block"
    el("dataDialog").style.display = "none"
}

const hideLogin = () => {
    el("loginDialog").style.display = "none"
    el("dataDialog").style.display = "block"
}


const authenticate = function () {
    showLoader()
    fetch('https://littledataapi.com/Users/Authenticate', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: el("username").value,
            password: el("password").value,
            expireInDays: el("expire").value,
        })
    })
        .then(response => response.json())
        .then(json => {

            if (json.succeeded) {
                localStorage.setItem("_lda_token", json.message)
                hideLogin()
                getTasks()
            }
            else {
                alert(json.errors.map(e => e.description).join('; '))
            }

        })
        .finally(
            () => hideLoader()
        );
}

let Tasks = []



const addTask = () => {
    const newTaskText = el("newTask").value

    
        showLoader()
        fetch('https://littledataapi.com/api/LittleData/PostStringData', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('_lda_token')
            },
            body: JSON.stringify({
                name: 'MyTasks',
                values: [newTaskText]
            })
        })
            .then(handleResponse)
            .then(handleJson)
            .finally(
                () => hideLoader()
            );
    
    


}


const updateTask = (id) => {
    const value = el(`v_${id}`).value
    showLoader()
    fetch(`https://littledataapi.com/api/LittleData/UpdateStringById?id=${id}&value=${value}`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('_lda_token')
        }
    })
        .then(handleResponse)
        .then(handleJson)
        .finally(() => hideLoader())
}

const deleteTask = (id) => {
    showLoader()
    fetch(`https://littledataapi.com/api/LittleData/DeleteStringById?id=${id}`, {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('_lda_token')
        }
    })
        .then(handleResponse)
        .then(handleJson)
        .finally(() => hideLoader())
}

const redrawTasks = () => {
    const tasksHtml = Tasks.map(t => `
    <div class="dataItem">
        <div class="dataContainer"><input id="v_${t.id}" type="text" name="${t.value}" value="${t.value}"></div>
        <div><button style="color: red; padding: 0.5rem" onclick="deleteTask('${t.id}')">delete</button> <button style="color: green; padding: 0.5rem" onclick="updateTask('${t.id}')">update</button></div>
    </div>
            `).join('')

    el("dataOutput").innerHTML = tasksHtml
    el("newTask").value = ""
    el("newTask").focus()
}


const getTasks = function () {
    showLoader()
    fetch('https://littledataapi.com/api/LittleData/GetStrings?listName=MyTasks', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('_lda_token')
        }
    })
        .then(handleResponse)
        .then(handleJson)
        .finally(
            () => hideLoader()
        )
}

getTasks()