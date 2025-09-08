import fs from 'fs';
import path from 'path';

const filePath = path.resolve("userData.json");

export function getLatestUser() {
    const users = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return users[users.length - 1];
}

export function updateLatestUserPassword(newPassword) {
    const users = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    users[users.length - 1].password = newPassword;
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2), 'utf-8');
}
export function getLatestUserId() {
    const latestUser = getLatestUser();
    if (!latestUser || !latestUser.userId) {
        throw new Error("No valid userId found in latest user entry");
    }
    return latestUser.userId;
}

export function removeLatestUserFromFile() {
    const users = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    if (users.length > 0) {
        users.pop(); // Remove last user
        fs.writeFileSync(filePath, JSON.stringify(users, null, 2), 'utf-8');
        console.log("🗑️ Latest user removed from local file.");
    } else {
        console.warn("⚠️ No users found in file to remove.");
    }
}