/* @refresh reload */
import { Router } from "@solidjs/router";
import { createReaction, createSignal, onMount } from 'solid-js';
import { render } from 'solid-js/web';
import { initGlobalConfig } from "krestianstvo";

import './index.css';
import Root from './Web/Root';
import 'virtual:uno.css'

import configFile from './config.json?raw'
const [config, setConfig] = initGlobalConfig(JSON.parse(configFile))
/// DEV Mode ///
import 'solid-devtools'
import { attachDevtoolsOverlay } from '@solid-devtools/overlay'

if (config.devMode)
    attachDevtoolsOverlay({
        defaultOpen: false, // or alwaysOpen
        noPadding: true,
    })
///



render(() => (
    <Router>
        <Root config={config} setConfig={setConfig} />
    </Router>
), document.getElementById('root'));
