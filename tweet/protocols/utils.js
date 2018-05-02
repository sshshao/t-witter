const uuidv4 = require('uuid/v4');

const STATUS_OK = 'OK';
const STATUS_ERROR = 'error';

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

exports.tweetInsert = function(username, content, childType, parent, media) {
    return {
        'id': uuidv4(),
        'username': username,
        'timestamp': Math.floor(Date.now()/1000),
        'content': content,
        'retweeted': 0,
        'property': {
            'likes': 0,
            'liked_by': []
        },
        'childType': childType,
        'parent': parent,
        'media': media
    };
}

exports.tweetQuery = function(id) {
    return {
        'id': id
    };
}

exports.tweetQueryWithUsername = function(id, username) {
    return {
        'id': id,
        'username': username
    };
}

exports.likeTweetUpdate = function(user) {
    return {
        '$inc': { 
            'property.likes': 1
        }, 
        '$push': {
            'property.liked_by': user
        }
    };
}

exports.unlikeTweetUpdate = function(user) {
    return {
        '$inc': { 
            'property.likes': -1
        }, 
        '$pull': {
            'property.liked_by': user
        }
    };
}

exports.searchQuery = function(timestamp, q, target, targets, parent, replies, hasMedia) {
    /*
    var query = { 
        'timestamp': {'$lte': timestamp},
        'content': {'$regex' : '.*'+q+'.*'},
        'username': username,
        'username': {'$in': targets},
        'parent': parent,
        'childType': {'$ne': 'reply'},
        'media': {'$exists': True}, '$where': 'this.media.length > 0'}
    }
    */
   
    var query = { '$and': [
        { 'timestamp': {'$lte': timestamp} }
    ]};

    if(q != null) {
        query['$and'].push({'content': {'$regex': '.*'+q+'.*'}});
    }
    if(target != null) {
        query['$and'].push({'username': target});
    }
    if(targets != null) {
        query['$and'].push({'username': {'$in': targets}});
    }
    if(parent != null) {
        query['$and'].push({'parent': parent});
    }
    if(!replies) {
        query['$and'].push({'childType': {'$ne': 'reply'}});
    }
    if(hasMedia) {
        query['$and'].push({'media': {'$exists': True}, '$where': 'this.media.length > 0'});
    }

    return query;
}

exports.searchOption = function(rank, limit) {
    if(rank == 'interest') {
        return {
            sort: [
                ['timestamp', -1],
                ['retweeted', -1],
                ['property.likes', -1]
            ],
            limit: limit
        };
    }
    else {
        return {
            sort: [
                ['timestamp', -1],
            ],
            limit: limit
        };
    }
}