const { dbName, squealCollection, profileCollection, mongoClient } = require("./const.js");

const typeOfProfile = {
    user: "normal",
    premium: "premium",
    smm: "smm",
    admin: "admin"
}

async function searchProfileInDB(username) {
    try {
        await mongoClient.connect();
        const database = mongoClient.db(dbName);
        const collection = database.collection(profileCollection);
        const profile = await collection.findOne({ name: username });
        return profile;
    } catch (error) {
        return null;
    }
}

async function updateProfileInDB(username, updateObject) {
    try {
        await mongoClient.connect();
        const database = mongoClient.db(dbName);
        const collection = database.collection(profileCollection);
        await collection.updateOne({ id: username }, { $set: updateObject });
    } catch (error) {
        // do nothing
    }
}

async function isAuthorized(user, level) {
    const userFromDB = await searchProfileInDB(user);
    if (userFromDB !== null && userFromDB !== undefined && userFromDB.account_type === level) {
        return true;
    }
    else {
        return false;
    }
}

async function isAuthorizedOrHigher(user, level) {
    if (level === typeOfProfile.user) {
        return await isAuthorized(user, typeOfProfile.user) || await isAuthorized(user, typeOfProfile.premium) || await isAuthorized(user, typeOfProfile.smm) || await isAuthorized(user, typeOfProfile.admin);
    } else if (level === typeOfProfile.premium) {
        return await isAuthorized(user, typeOfProfile.premium) || await isAuthorized(user, typeOfProfile.admin);
    } else if (level === typeOfProfile.smm) {
        return await isAuthorized(user, typeOfProfile.smm) || await isAuthorized(user, typeOfProfile.admin);
    } else { // level === typeOfProfile.admin
        return await isAuthorized(user, level);
    }
}

async function canLogIn(username, password) {
    if (username === null || username === undefined) {
        return false;
    }

    const userFromDB = await searchProfileInDB(username);
    if (userFromDB !== null && userFromDB !== undefined && !userFromDB.is_banned) {
        return isPasswordCorrect(userFromDB, password);
    } else if(userFromDB === null){
        return false;
    } else if (userFromDB.is_banned) {
        let now = new Date();
        if (userFromDB.banned_until <= now.getTime()) {
            await updateProfileInDB(username, { is_banned: false, banned_until: null });
            return isPasswordCorrect(userFromDB, password);
        } else {
            return false;
        }
    } else {
        return false;
    }
}

async function isPasswordCorrect(user, password) { // user is NOT the username, but the object returned from the database quesry
    return password === user.password;
}

module.exports = { typeOfProfile, isAuthorized, isAuthorizedOrHigher, canLogIn };