const STATUS_OK = 'OK';
const STATUS_ERROR = "error";

exports.generate_message = function(status, msg) {
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