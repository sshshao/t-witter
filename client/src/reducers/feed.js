const feed = (state = {
    timeline: []
}, action) => {
    switch(action.type) {
        case 'TIMELINE_RESULT': {
            return {
                ...state,
                timeline: action.payload.timeline
            };
        }
        default:
            return state;
    }
};

export default feed;