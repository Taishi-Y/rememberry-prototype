import rb from 'js/utils/common';
import Storage from './Storage';
import JSON_Storage from './JSON_Storage';
import contentAPI from 'js/utils/contentAPI';

let init = () => getIt().then(
        config => setIt(!config ?
            'default' :
            rb.override(config, JSON_Storage.getDefaultConfig(), { new_only: true })
        )
    ),

    extendIt = ext_config => getIt().then(
        old_config => setIt(rb.override(old_config, ext_config, { concat_arrays: true }))
    ),

    setIt = new_config => new Promise(resolve => {
        let config = new_config === 'default' ?
                JSON_Storage.getDefaultConfig() :
                new_config;

        Storage.setItem({ config }).then(() => {
            resolve();
            contentAPI.send('config', config);
        });
    }),

    getIt = () => Storage.getItem('config').then(data => data.config);

export default {
    init,
    setIt,
    getIt,
    extendIt
};