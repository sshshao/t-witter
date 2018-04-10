const user = (state = {
    username: null
}, action) => {
    switch(action.type) {
        case 'LOGIN_RESULT': {
            return {
                ...state,
                username: action.payload.username
            };
        }
        case 'REGISTER_RESULT': {
            return {
                ...state,
            };
        }
        default:
            return state;
    }
};

export default user;