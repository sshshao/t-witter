const STATUS_OK = 'OK';
const STATUS_ERROR = "error";

export function generate_message(status, msg) {
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