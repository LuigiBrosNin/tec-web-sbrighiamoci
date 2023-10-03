let username = "admin";

function isAuthorized(user, level){
    if(user === username){
        return true;
    }
    else {
        return false;
    }
}

module.exports = {isAuthorized};