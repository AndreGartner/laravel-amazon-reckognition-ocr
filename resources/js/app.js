require('./bootstrap');

// Import modules...
import { createApp, h } from 'vue';
import { createInertiaApp } from '@inertiajs/inertia-vue3';
import { InertiaProgress } from '@inertiajs/progress';


import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import {
    faCheck,
    faTimes,
    faCropAlt,
    faRedoAlt,
} from '@fortawesome/free-solid-svg-icons';

import ImageUpload from './Components/ImageUpload.vue';
import ImageRecognition from './Components/ImageRecognition.vue';

library.add(faTimes);
library.add(faCheck);
library.add(faCropAlt);
library.add(faRedoAlt);


const el = document.getElementById('app');

createInertiaApp({
    resolve: (name) => require(`./Pages/${name}`),
    setup({ el, app, props, plugin }) {
        createApp({ render: () => h(app, props) })
            .mixin({ methods: { route } })
            .use(plugin)
            .component('font-awesome-icon', FontAwesomeIcon)
            .component('image-upload', ImageUpload)
            .component('image-recognition', ImageRecognition)
            .mount(el);
    },
});

InertiaProgress.init({ color: '#4B5563' });
