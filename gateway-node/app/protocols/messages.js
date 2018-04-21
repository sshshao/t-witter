var message = {
    // Error Codes
    ERROR_ACCOUNT_EXISTED_CODE: "duplicate key value",

    // Success Messages
    SUCCESS_ACCOUNT_CREATED_MESSAGE: "Account Has Been Created!",
    SUCCESS_ACCOUNT_ACTIVATED_MESSAGE: "Account Has Been Activated!",
    SUCCESS_LOGIN_MESSAGE: "Login Succeeded!",
    SUCCESS_LOGOUT_MESSAGE: "You have logged out!",
    SUCCESS_PLACE_HOLDER: "",

    // Error Messages
    ERROR_ACCOUNT_EXISTED_MESSAGE: "Account Exists.",
    ERROR_ACTIVATION_FAILED_MESSAGE: "Account Activation Failed.",
    ERROR_LOGIN_FAILED_MESSAGE: "Login Failed. Check your username and password.",
    ERROR_LOGIN_FAILED_NOT_ACTIVATED_MESSAGE: "Login Failed. This account has not yet been activated.",
    ERROR_NOT_YET_LOGIN_MESSAGE: "You are not logged in yet.",
    ERROR_SESSION_EXPIRED: "Session Has Expired. Please login again.",
    ERROR_MALFORMED_JWT: "Invalid Session Token. Please login again.",
    ERROR_MALFORMED_REQUEST: "Invalid Request.",
    ERROR_UNKNOWN_MESSAGE: "Unknown Error.",

    //TWEET

    // Success Messages
    SEARCH_NO_RESULT: "No result found.",

    // Error Messages
    ERROR_POST_NO_USER: "Please log in.",
    ERROR_POST_TWEET: "Error occured on posting tweet.",
    ERROR_GET_TWEET: "Tweet ID does not exist.",
    ERROR_NO_MEDIA: "Media ID Not Found."
}

export default message;