const { dbName, squealCollection, profileCollection, mongoClient } = require("./const.js");

const typeOfProfile = {
    user: "user",
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
    } finally {
        await mongoClient.close();
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
    } finally {
        await mongoClient.close();
    }
}

async function isAuthorized(user, level) {
    const userFromDB = await searchProfileInDB(user);
    console.log(userFromDB);
    if (userFromDB !== null && userFromDB !== undefined && userFromDB.account_type === level) {
        return true;
    }
    else {
        return false;
    }
}

async function isAuthorizedOrHigher(user, level) {
    if (level === typeOfProfile.user) {
        return isAuthorized(user, typeOfProfile.user) || isAuthorized(user, typeOfProfile.premium) || isAuthorized(user, typeOfProfile.smm) || isAuthorized(user, typeOfProfile.admin);
    } else if (level === typeOfProfile.premium) {
        return isAuthorized(user, typeOfProfile.premium) || isAuthorized(user, typeOfProfile.admin);
    } else if (level === typeOfProfile.smm) {
        return isAuthorized(user, typeOfProfile.smm) || isAuthorized(user, typeOfProfile.admin);
    } else { // level === typeOfProfile.admin
        return isAuthorized(user, level);
    }
}

async function canLogIn(username, password) {
    if (username === null || username === undefined) {
        return false;
    }

    const userFromDB = await searchProfileInDB(username);
    if (userFromDB !== null && userFromDB !== undefined && !userFromDB.is_banned) {
        return isPasswordCorrect(username, password);
    } else if (userFromDB.is_banned) {
        let now = new Date();
        if (userFromDB.banned_until <= now.getTime()) {
            await updateProfileInDB(username, { is_banned: false, banned_until: -1 });
            return isPasswordCorrect(username, password);
        } else {
            return false;
        }
    } else {
        return false;
    }
}

async function isPasswordCorrect(user, password) {
    return password === user.password;
}

module.exports = { typeOfProfile, isAuthorized, isAuthorizedOrHigher, canLogIn };