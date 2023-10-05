const typeOfProfile = {
    user : "user",
    premium : "premium",
    smm: "smm",
    admin: "admin"
}

async function isAuthorized(user, level){
    const userFromDB = await db.Profiles.findOne({ name: user });
    if(userFromDB !== null && userFromDB !== undefined && userFromDB.account_type === level){
        return true;
    }
    else {
        return false;
    }
}

async function isAuthorizedOrHigher(user, level){
    if(level === typeOfProfile.user){
        return isAuthorized(user, typeOfProfile.user) || isAuthorized(user, typeOfProfile.premium) || isAuthorized(user, typeOfProfile.smm) || isAuthorized(user, typeOfProfile.admin);
    } else if(level === typeOfProfile.premium){
        return isAuthorized(user, typeOfProfile.premium) || isAuthorized(user, typeOfProfile.admin);
    } else if(level === typeOfProfile.smm){
        return isAuthorized(user, typeOfProfile.smm) || isAuthorized(user, typeOfProfile.admin);
    } else { // level === typeOfProfile.admin
        return isAuthorized(user, level); 
    }
}

async function canLogIn(username, password){
    if(username === null || username === undefined){
        return false;
    }

    const userFromDB = await db.Profiles.findOne({ name: username });
    if(userFromDB !== null && userFromDB !== undefined && !userFromDB.is_banned){
        return isPasswordCorrect(username, password);
    } else if(userFromDB.is_banned){
        let now = new Date();
        if(userFromDB.banned_until <= now.getTime()){
            await collection.updateOne({id: username}, {$set: {is_banned: false, banned_until: -1}});
            return isPasswordCorrect(username, password);
        } else {
            return false;
        }
    } else {
        return false;
    }
}

async function isPasswordCorrect(user, password){
    return password === user.password;
}

module.exports = {typeOfProfile, isAuthorized, isAuthorizedOrHigher, canLogIn};