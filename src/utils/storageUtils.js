function nano_promise(callback, args = []) {
    return () => {
        return new Promise((resolve, reject) => {
            args.push(resolve, reject)
            callback(...args)
        })
    }
}

async function session_set(key, value, resolve = () => { }, reject = () => { }) {
    try {
        if (!key) {
            console.error("session key can't null")
            reject()
            return false
        }
        chrome.storage.local.set({
            [key]: value,
        }, function (res) {
            //console.log('session_set',res)
            let error = chrome.runtime.lastError;
            if (error) {
                console.warn(JSON.stringify(error));
                reject(JSON.stringify(error))
            }
            resolve(res)
        })
    } catch (e) {
        reject(e)
    }
}

async function session_set_objects(object, resolve = () => { }, reject = () => { }) {
    try {
        if (!object) {
            console.error("session object can't null")
            reject()
            return false
        }
        chrome.storage.local.set(object,
            function (res) {
                resolve(object)
            })
    } catch (e) {
        reject(e)
    }
}

async function session_get(key, default_value = null, resolve = () => { }, reject = () => { }) {
    try {
        if (!key) {
            console.error("session key can't null")
            reject()
            return false
        }
        chrome.storage.local.get({
            [key]: null,
        }, function (res) {
            if (res[key]) {
                resolve(res[key])
            } else {
                resolve(default_value)
            }
        })
    } catch (e) {
        reject(e)
    }
}

async function session_get_objects(items, resolve = () => { }, reject = () => { }) {
    try {
        if (!items) {
            console.error("session items can't null")
            reject()
            return false
        }
        chrome.storage.local.get(items,
            function (res) {
                resolve(res)
            })
    } catch (e) {
        reject(e)
    }
}

async function session_remove(key, resolve = () => { }, reject = () => { }) {
    try {
        if (!key) {
            console.error("session key can't null")
            reject()
            return false
        }
        chrome.storage.local.remove(key,
            function (res) {
                resolve(res)
            }
        )
    } catch (e) {
        reject(e)
    }
}

async function session_clear(resolve = () => { }, reject = () => { }) {
    try {
        chrome.storage.local.clear(function (res) {
            resolve(res)
        })
    } catch (e) {
        reject(e)
    }
}


const storageUtils = {
    getItem: async function (key, default_value = null) {
        return await nano_promise(session_get, [key, default_value])()
    },
    get_objects: async function (object) {
        return await nano_promise(session_get_objects, [object])()
    },
    setItem: async function (key, value) {
        return await nano_promise(session_set, [key, value])()
    },
    set_objects: async function (object) {
        return await nano_promise(session_set_objects, [object])()
    },
    removeItem: async function (key) {
        return await nano_promise(session_remove, [key])()
    },
    clear: async function () {
        return await nano_promise(session_clear)()
    },
}

module.exports = storageUtils;
