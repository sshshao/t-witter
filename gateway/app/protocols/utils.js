const STATUS_OK = 'OK';
const STATUS_ERROR = 'error';

const tweetKey = 'T';
const profileKey = 'P';
const searchKey = 'S';

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

exports.MCDsearchKey = function(payload) {
    var key = searchKey;
    key += 'u' + payload.username == null ? '' : payload.username;

    var fuzzyTime = payload.timestamp / 10;
    if(payload.timestamp % 10 < 5) {
        fuzzyTime = fuzzyTime * 10;
    }
    else {
        fuzzyTime = fuzzyTime * 10  + 10;
    }

    key += 't' + fuzzyTime;
    key += 'l' + payload.limit
    key += 'q' + payload.q == null ? '' : payload.q;
    key += 't' + payload.target == null ? '' : payload.target;
    key += 'f' + payload.following;
    key += 'r' + payload.rank;
    key += 'p' + payload.parent == null ? '' : payload.parent;
    key += 'r' + payload.replies;
    key += 'm' + payload.hasMedia;

    return key;
}