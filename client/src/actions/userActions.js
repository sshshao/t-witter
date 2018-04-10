export function login(values) {
    return function (dispatch) {
        return fetch('http://sheshao.cse356.compas.cs.stonybrook.edu/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify(values)
        }).then(
            result => result.json(),
            error => console.log('ERROR: ', error)
        ).then(
            response => dispatch(receiveLoginResult(response))
        );
    }
}

export function receiveLoginResult(res) {
    if(res.status == 'OK') {
        return {
            type: 'LOGIN_RESULT',
            payload: {
                username: res.username
            }
        }
    }
    else {
        return {
            type: 'LOGIN_RESULT',
            payload: {
                username: null
            }
        }
    }
}

export function register(values) {
    return function (dispatch) {
        return fetch('http://sheshao.cse356.compas.cs.stonybrook.edu/adduser', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify(values)
        }).then(
            result => result.json(),
            error => console.log('ERROR: ', error)
        ).then(
            response => dispatch(receiveRegisterResult(response))
        );
    }
}

export function receiveRegisterResult(res) {
    return {
        type: 'LOGIN_RESULT',
        payload: {
            username: res.username
        }
    }
}