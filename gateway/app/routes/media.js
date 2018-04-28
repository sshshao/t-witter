const uuidv4 = require('uuid/v4');
const cassandra = require('cassandra-driver');

const utils = require('../protocols/utils');
const CASS_HOST = require('../config').cassandra.Cass_Host;
const CASS_NAMESPACE = require('../config').cassandra.Cass_Namespace;
const ERROR_NO_MEDIA = require('../protocols/messages').ERROR_NO_MEDIA;

const STATUS_OK = 'OK';
const STATUS_ERROR = 'error';

const distance = cassandra.types.distance;
const options = {
    contactPoints: [CASS_HOST],
    keyspace: CASS_NAMESPACE,
    pooling: {
        coreConnectionsPerHost: {
            [distance.local]: 2,
            [distance.remote]: 1
        }
    }
};
const client = new cassandra.Client(options);

exports.post = function(req, res) {
    var mediaId = uuidv4();
    var type = req.file.mimetype;
    var content = req.file.buffer.toString('base64');

    var query = 'INSERT INTO media (id, type, content) VALUES (?, ?, textAsBlob(?))';
    var params = [mediaId, type, content];
    client.execute(query, params, {prepare: true}, function(err, result) {
        if(err) {
            res.send(utils.generateMessage(STATUS_ERROR, err.message));
        }
        else {
            res.send({
                'status': STATUS_OK,
                'id': mediaId
            });
        }
    });
}

exports.get = function(req, res) {
    var mediaId = req.params.id;
    var query = 'SELECT id, type, content FROM media WHERE id = ?';
    client.execute(query, [mediaId], {hints: ['text']}, function(err, result) {
        if(err) {
            res.send(utils.generateMessage(STATUS_ERROR, err.message));
            return;
        }

        if(result.rows.length == 1) {
            var mimetype = result.rows[0].type;
            var content = result.rows[0].content.toString('binary');

            res.setHeader('content-type', mimetype);
            res.send(new Buffer(content, 'base64'));
        }
        else {
            res.send(utils.generateMessage(STATUS_ERROR, ERROR_NO_MEDIA));
        }
    });
}

exports.remove = function(mediaIds) {
    for(var i = 0; i < mediaIds.length; i++) {
        var mediaId = mediaIds[i];
        var query = 'DELETE FROM media WHERE id = ?';
        client.execute(query, [mediaId], {hints: ['text']}, function(err, result) {
            if(err) {
                utils.generateMessage(STATUS_ERROR, err.message);
            }
        })
    }
}