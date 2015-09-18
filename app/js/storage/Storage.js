const type = 'local',
    db = chrome.storage[type];

export default {
    setItem     : data => new Promise(resolve => { db.set(data, resolve); }),
    getItem     : names => new Promise(resolve => { db.get(names, resolve); }),
    removeItem  : name => new Promise(resolve => { db.remove(name, resolve); })
};