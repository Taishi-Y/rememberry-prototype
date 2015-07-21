import { EventEmitter } from 'events';

const   type = 'sync',
        db = chrome.storage[type];

class Storage extends EventEmitter {
    constructor() {
        super();

        chrome.storage.onChanged.addListener((changes, area_name) => {
            if (area_name === type) {
                const { config } = changes;

                this.emit('CHANGE', changes);

                if (config) {
                    this.emit('CONFIG_CHANGE', config.newValue, config.oldValue);
                }
            }
        });
    }
}

export const StorageModel = new Storage();

export default {
    setItem     : data => new Promise(resolve => { db.set(data, resolve); }),
    getItem     : names => new Promise(resolve => { db.get(names, resolve); }),
    removeItem  : name => new Promise(resolve => { db.remove(name, resolve); })
};