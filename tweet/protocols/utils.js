const mongoose = require('mongoose');

const STATUS_OK = 'OK';
const STATUS_ERROR = 'error';

exports.generateMessage = function(status, msg) {
    if (status == STATUS_OK) {
        return {
            'status': STATUS_OK,
            'message': msg
        };
    }
    else{
        return {
            'status': status,
            'error': msg
        };
    }
}

exports.getTweetSchema = function() {
    var tweetSchema = new mongoose.Schema({
        'id': { type: String, es_indexed: true },
        'username': { type: String, es_indexed: true },
        'timestamp': { type: Number, es_indexed: true },
        'content': { type: String, es_indexed: true },
        'retweeted': { type: Number, default: 0, es_indexed: true },
        'property': {
            'likes': { type: Number, default: 0, es_indexed: true },
            'liked_by': { type: Array, default: [] }
        },
        'childType': String,
        'parent': String,
        'media': Array
    });

    return tweetSchema;
}

exports.tweetInsert = function(id, username, content, childType, parent, media) {
    return {
        'id': id,
        'username': username,
        'timestamp': Math.floor(Date.now()/1000),
        'content': content,
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

exports.searchQuery = function(limit, timestamp, q, target, targets, parent, replies, hasMedia, rank) {
    var query = {
        'size' : limit,
        'query': { 
            'bool': { 
                'must': [],
                'must_not': [],
                'filter': [
                    { 'range': { 'timestamp': {'lte': timestamp} } }
                ]
            }
        }
    };

    if(q != null) {
        query.query.bool.must.push({ 'match': { 'content': q } });
    }
    if(target != null) {
        query.query.bool.must.push({ 'match': { 'username': target } });
    }
    if(targets != null) {
        query.query.bool.filter.push({
            'terms': { 'username': targets }
        });
    }
    if(parent != null) {
        query.query.bool.must.push({ 'match': { 'parent': parent } });
    }
    if(!replies) {
        query.query.bool.must_not.push({
            'term':  { 'childType': 'reply' }
        });
    }
    if(hasMedia) {
        query.query.bool.must.push({
            'exists' : { 'field' : 'media' }
        });
    }
    if(rank == 'interest') {
        query.sort = [
            { 'timestamp': {'order': 'desc'} },
            { 'retweeted': {'order': 'desc'} },
            { 'property.likes': {'order': 'desc'} }
        ];
    }
    else {
        query.sort = [
            { 'timestamp': {'order': 'desc'} }
        ];
    }

    return query;
}