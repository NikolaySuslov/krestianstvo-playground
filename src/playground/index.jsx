/* @refresh reload */
import { Router } from "solid-app-router";
import { render} from 'solid-js/web';
import { initGlobalConfig } from "krestianstvo";

import './index.css';
import Root from './Web/Root';
import 'virtual:uno.css'

import configFile from './config.json?raw'
const [config, setConfig] = initGlobalConfig(JSON.parse(configFile))


render(() => (
    <Router>
        <Root config={config} setConfig={setConfig}/>
    </Router>
), document.getElementById('root'));
