import {} from './utils/globalUtils'

console.log('### load config');
import config from './config/base'
global.config = config;


import {createApp} from 'vue'

// import router from './router'
import store from './store'

//antd 样式相关导入
import PopConfirm from 'ant-design-vue/lib/popconfirm';
import Spin from 'ant-design-vue/lib/spin';
import Radio from 'ant-design-vue/lib/radio';
import Switch from 'ant-design-vue/lib/switch';
import Tooltip from 'ant-design-vue/lib/tooltip';
import Collapse from 'ant-design-vue/lib/collapse';
import Card from 'ant-design-vue/lib/card';
import CheckBox from 'ant-design-vue/lib/checkbox';
import Button from 'ant-design-vue/lib/button';
import Select from 'ant-design-vue/lib/select';
import Input from 'ant-design-vue/lib/input';
import Dropdown from 'ant-design-vue/lib/dropdown';
import Menu from 'ant-design-vue/lib/menu';
import Pagination from 'ant-design-vue/lib/pagination';
import antMessage from 'ant-design-vue/lib/message';
import antModal from 'ant-design-vue/lib/modal';
import 'ant-design-vue/dist/antd.less';



import {} from './config/errorCode'

import App from './App.vue'
console.log('### init app');

//引入bsv库
// const  bsv = require( 'bsv');
// global.bsv = bsv;
import localManager from './manager/LocalManager'
global.localManager = localManager;

import nftManager from './manager/NftManager'
global.nftManager = nftManager;
import bsvUtils from './utils/bsvUtils'
global.bsvUtils = bsvUtils;
import routerManager from './manager/RouterManager'
global.routerManager = routerManager;
import eventManager from './manager/EventManager'
global.eventManager = eventManager;

import walletManager from './manager/WalletManager'
global.walletManager = walletManager;
import tokenManager from './manager/tokenManager'
global.tokenManager = tokenManager;
const bsv = require('bsv');
global.bsv = bsv;

const storageUtils = require('./utils/storageUtils')
global.storageUtils = storageUtils

global.antMessage = antMessage;
global.antModal = antModal;


createApp(App).use(store)
    .use(Spin).use(Pagination).use(Collapse).use(Card).use(PopConfirm).use(Radio).use(Switch).use(CheckBox).use(Button).use(Input).use(Select).use(antModal).use(Dropdown).use(Menu).use(Tooltip)
    .mount('#app');
