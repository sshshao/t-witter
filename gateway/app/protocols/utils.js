const STATUS_OK = 'OK';
const STATUS_ERROR = 'error';

const tweetKey = 'T';
const profileKey = 'P';

exports.generateMessage = function(status, msg) {
    if (status == STATUS_OK) {
        return {
            'status': STATUS_OK,
            'message': msg,
        };
    }
    else{
        return {
            'status': status,
            'error': msg,
        };
    }
}

exports.MCDtweetKey = function(tweetId) {
    return tweetKey + tweetId;
}

exports.MCDprofileKey = function(username) {
    return profileKey + username;
}