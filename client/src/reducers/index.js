import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';

import user from './user';
import feed from './feed';

const reducer = combineReducers({
    user,
    feed,
    form: formReducer
});

export default reducer;
