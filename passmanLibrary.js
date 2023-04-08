const axios = require('axios');

const host = 'http://localhost:80'; // Replace this with your desired host
axios.defaults.withCredentials = true

async function register(username, email, passwordHash) {
    try {
        await axios.post(`${host}/register`, { username, email, passwordHash });
    } catch (error) {
        throw new Error(`Error registering: ${error.response.statusText}`);
    }
}

async function login(username, passwordHash) {
    try {
        const response = await axios.post(`${host}/login`, { username, passwordHash }, { withCredentials: true });
        // get Set-Cookie header from response
        const cookie = response.headers['set-cookie'][0];
        // set session id in cookie
        return cookie
    } catch (error) {
        console.error(error);
        throw new Error(`Error logging in: ${error.response.statusText}`);
    }
}

async function getPasswordEntries(session_cookie) {
    try {
        // do axios get with session cookie
        const response = await axios.get(`${host}/getPasswordEntries`, { withCredentials: true, headers: { Cookie: session_cookie } });
        return response.data;
    } catch (error) {
        console.log(session_cookie)
        throw new Error(`Error fetching password entries: ${error.response.statusText}`);
    }
}

async function addPasswordEntry(domain, username, passwordEncrypted, annotation, session_cookie) {
    try {
        await axios.post(`${host}/addPasswordEntry`, { domain, username, passwordEncrypted, annotation }, { withCredentials: true, headers: { Cookie: session_cookie } });
    } catch (error) {
        throw new Error(`Error adding password entry: ${error.response.statusText}`);
    }
}

async function searchPasswordEntries(domain) {
    try {
        const response = await axios.post(`${host}/searchPasswordEntries`, { domain }, { withCredentials: true, headers: { Cookie: session_cookie } });
        return response.data;
    } catch (error) {
        throw new Error(`Error searching password entries: ${error.response.statusText}`);
    }
}

async function getPasswordById(id, session_cookie) {
    try {
        const response = await axios.post(`${host}/getPasswordById`, { id }, { withCredentials: true, headers: { Cookie: session_cookie } });
        return response.data;
    } catch (error) {
        throw new Error(`Error fetching password entry: ${error.response.statusText}`);
    }
}

async function deletePasswordEntry(id, session_cookie) {
    try {
        await axios.post(`${host}/deletePasswordEntry`, { id }, { withCredentials: true, headers: { Cookie: session_cookie } });
    } catch (error) {
        throw new Error(`Error deleting password entry: ${error.response.statusText}`);
    }
}

function deleteCookie(name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/;';
}

function logout() {
    deleteCookie('SESSION');
}

module.exports = {
    register,
    login,
    getPasswordEntries,
    addPasswordEntry,
    searchPasswordEntries,
    getPasswordById,
    deletePasswordEntry,
    logout
};

