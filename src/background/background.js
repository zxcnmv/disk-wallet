const responseHandlers = new Map();
const eventHandlers = {};
const sensibleSdk = require("sensible-sdk");
//
require('../utils/globalUtils')
require('../config/errorCode')
import txUtils from "../utils/txUtils"
const config = require('../config/base')
const walletManager = require("../manager/WalletManager");
const tokenManager = require("../manager/tokenManager");
const connectManager = require('../manager/ConnectManager');
const storageUtils = require('../utils/storageUtils')
/**
 const bsv = require('bsv');

window.bsv = bsv;
window.sensibleSdk = sensibleSdk;
window.walletManager = walletManager;
window.tokenManager = tokenManager;

window.passwordAesTable = {};
 */


//触发一次
try {
   // walletManager.isNeedUnlock();
} catch (e) {
}

const SensibleNFTObj = new sensibleSdk.SensibleNFT({
    network: "mainnet", //mainnet or testnet
    feeb: 0.5,
    // signers
});


browser.runtime.onInstalled.addListener(details => {
    if (details.reason === 'install') {
        //window.open('/popup.html')
        let url = chrome.runtime.getURL("popup.html");
        chrome.tabs.create({ url });
        /** 
        chrome.windows.getLastFocused((focusedWindow) => {
            chrome.windows.create({
                url: 'popup.html#',
                type: 'popup',
                width: 391,
                height: 640,
                top: focusedWindow.top,
                left: focusedWindow.left + (focusedWindow.width - 391),
                setSelfAsOpener: false,
                focused: true,
            });
        });
        */
    }
    if (details.reason === 'update') {
        // 更新事件
        //处理一个图片错误
        //tokenManager.fixPic();
    }
});

async function launchPopup2(){
    let url = chrome.runtime.getURL("popup.html");
    let tab = await chrome.tabs.create({ url });
    console.log(`Created tab ${tab.id}`);
}

async function createHandler(message, sender, sendResponse, handler) {
    try {
        await handler(message, sender, sendResponse);
    } catch (e) {
        sendResponse({
            id: message.data.id,
            msg: e && e.message || e,
            result: "fail"
        })
    }
}
async function launchUploading(message, sender, sendResponse, checkConnected = true) {
    console.log('--launchPopup--',message, sender, sendResponse, checkConnected)
    console.log('---localStorage_-launchPopup',global.localStorage)

    if (checkConnected && !await checkConnect(sender)) {
        return sendResponse({
            result: "denied",
            id: message.data.id,
            msg: "Permission denied, connect first"
        });
    }
    console.log('sender',sender)

    if (message.data.method === 'signTx') {      //对于signTX，其参数可能过大(>10M)而不适合放在连接上，通过内存直接传递
        //window.signTxList = message.data.params.list;
        //message.data.params.list = []
    }

    const searchParams = new URLSearchParams();
    searchParams.set('origin', sender.origin);
    searchParams.set('network', message.data.params.network);
    searchParams.set('request', JSON.stringify(message.data));
    console.log('searchParams',searchParams)
    // TODO consolidate popup dimensions
    let uploadingWindowId = await storageUtils.getItem('uploadingWindowId')
    console.log('uploadingWindow--------',uploadingWindowId)
    
    chrome.windows.getLastFocused((focusedWindow) => {
        if(uploadingWindowId){
            chrome.windows.remove(uploadingWindowId)
        }
        chrome.windows.create({
                url: 'uploading.html#' + searchParams.toString(),
                type: 'popup',
                width: 391,
                height: 640,
                top: focusedWindow.top,
                left: focusedWindow.left + (focusedWindow.width - 391),
                setSelfAsOpener: false,
                focused: true,
            })
    });
    responseHandlers.set(message.data.id, sendResponse);
}

async function launchPopup(message, sender, sendResponse, checkConnected = true) {

    if (checkConnected && !await checkConnect(sender)) {
        return sendResponse({
            result: "denied",
            id: message.data.id,
            msg: "Permission denied, connect first"
        });
    }
    if (message.data.method === 'signTx') {      //对于signTX，其参数可能过大(>10M)而不适合放在连接上，通过内存直接传递
        //window.signTxList = message.data.params.list;
        //message.data.params.list = []
    }

    const searchParams = new URLSearchParams();
    searchParams.set('origin', sender.origin);
    searchParams.set('network', message.data.params.network);
    searchParams.set('request', JSON.stringify(message.data));
    //console.log('searchParams',searchParams)
    // TODO consolidate popup dimensions
    chrome.windows.getLastFocused((focusedWindow) => {
        chrome.windows.create({
            url: 'popup.html#' + searchParams.toString(),
            type: 'popup',
            width: 391,
            height: 640,
            top: focusedWindow.top,
            left: focusedWindow.left + (focusedWindow.width - 391),
            setSelfAsOpener: false,
            focused: true,
        });
    });
    responseHandlers.set(message.data.id, sendResponse);
}



async function checkConnect(sender) {
    let address = await walletManager.getMainAddress();
    return connectManager.isConnected(address, sender.origin)
}

async function handleConnect(message, sender, sendResponse) {
    let address = await walletManager.getMainAddress()
    if (await connectManager.isConnected(address, sender.origin)) {
        sendResponse({
            result: "success",
            id: message.data.id,
            data: address
        });

    } else
        return launchPopup(message, sender, sendResponse, false);

}


async function handleDisconnect(message, sender, sendResponse) {
    let address = walletManager.getMainAddress();

    await connectManager.disconnect(address, sender.origin)
    sendResponse({result: "success", id: message.data.id})
}

async function handleGetVersion(message, sender, sendResponse) {

    sendResponse({
        result: "success", data: {
            version: config.version,
            versionCode: config.versionCode,
        }, id: message.data.id
    })
}

async function handleIsHDAccount(message, sender, sendResponse) {

    if (!await checkConnect(sender)) {
        return sendResponse({
            result: "denied",
            id: message.data.id,
            msg: "Permission denied, connect first"
        });
    }

    let mode = walletManager.getAccountMode();
    sendResponse({result: "success", data: mode === 'account.mode_HD', id: message.data.id})
}

async function handleListGenesis(message, sender, sendResponse) {
    if (!await checkConnect(sender)) {
        return sendResponse({
            result: "denied",
            id: message.data.id,
            msg: "Permission denied, connect first"
        });
    }

    let address = message.data.params.address;
    let data = await SensibleNFTObj.getSummary(address);
    sendResponse({
        id: message.data.id,
        data,
        result: "success"
    })
}

async function handleIsConnect(message, sender, sendResponse) {
    if (!await checkConnect(sender)) {
        return sendResponse({
            result: "success",
            id: message.data.id,
            data: false
        });
    } else
        sendResponse({
            result: "success",
            id: message.data.id,
            data: true
        });
}

async function handleListNft(message, sender, sendResponse) {
    if (!await checkConnect(sender)) {
        return sendResponse({
            result: "denied",
            id: message.data.id,
            msg: "Permission denied, connect first"
        });
    }
    let {address, genesis, codehash} = message.data.params;
    let data = await SensibleNFTObj.getSummaryDetail(codehash, genesis, address);
    sendResponse({
        id: message.data.id,
        data,
        result: "success"
    })
}

async function handleGetBsvBalance(message, sender, sendResponse) {
    if (!await checkConnect(sender)) {
        return sendResponse({
            result: "denied",
            id: message.data.id,
            msg: "Permission denied, connect first"
        });
    }

    let {} = message.data.params;
    let address = await walletManager.getMainAddress();
    let balance = await walletManager.getBsvBalance(address)
    sendResponse({
        id: message.data.id,
        data: {
            address,
            balance
        },
        result: "success"
    })
}

async function handleGetTokenBalance(message, sender, sendResponse) {
    if (!await checkConnect(sender)) {
        return sendResponse({
            result: "denied",
            id: message.data.id,
            msg: "Permission denied, connect first"
        });
    }
    let {} = message.data.params;
    let tokenList = await tokenManager.listUserTokens(true);
    sendResponse({
        id: message.data.id,
        data: tokenList,
        result: "success"
    })
}

async function handleCheckTokenUtxo(message, sender, sendResponse) {
    if (!await checkConnect(sender)) {
        return sendResponse({
            result: "denied",
            id: message.data.id,
            msg: "Permission denied, connect first"
        });
    }

    let {genesis, codehash} = message.data.params;
    let utxoCount = await tokenManager.sensibleFt.getUtxoCount(genesis, codehash, walletManager.getMainAddress());


    let bsvUtxoCount = await walletManager.getBsvUtxoCount();
    // console.log(utxoCount, bsvUtxoCount, 'utxo check')
    if (utxoCount < 20 && bsvUtxoCount <= 3) {
        sendResponse({
            id: message.data.id,
            result: "success",
            data: true,
        })
    } else {
        launchPopup(message, sender, sendResponse)
    }
}


async function handleGetAddress(message, sender, sendResponse) {
    if (!await checkConnect(sender)) {
        return sendResponse({
            result: "denied",
            id: message.data.id,
            msg: "Permission denied, connect first"
        });
    }

    let {path} = message.data.params;
    let data = path ? await walletManager.getAddress(path) : await walletManager.getMainAddress()
    sendResponse({
        id: message.data.id,
        data,
        result: "success"
    })
}

async function handleGetPublicKey(message, sender, sendResponse) {
    if (!await checkConnect(sender)) {
        return sendResponse({
            result: "denied",
            id: message.data.id,
            msg: "Permission denied, connect first"
        });
    }

    let {path} = message.data.params;
    sendResponse({
        id: message.data.id,
        data: path ? walletManager.getPubKey(path) : walletManager.getMainPubKey(),
        result: "success"
    })

}


async function handleGetPublicKeyAndAddress(message, sender, sendResponse) {
    if (!await checkConnect(sender)) {
        return sendResponse({
            result: "denied",
            id: message.data.id,
            msg: "Permission denied, connect first"
        });
    }
    if (await walletManager.isSinglePrivateKey()) {
        return sendResponse({
            result: "fail",
            id: message.data.id,
            msg: "User account is single private key mode"
        });
    }
    // console.log('hdPath', message)
    let {hdPath} = message.data.params;
    let data = await walletManager.getPublicKeyAndAddress(hdPath)
    console.log('handleGetPublicKeyAndAddress---',hdPath,data)
    sendResponse({
        id: message.data.id,
        data,
        result: "success"
    })
}

async function handleSendOpReturnByHdPath(message, sender, sendResponse) {
    console.log('-----handleSendOpReturnByHdPath:',message,sender,sendResponse)
    if (!await checkConnect(sender)) {
        return sendResponse({
            result: "denied",
            id: message.data.id,
            msg: "Permission denied, connect first"
        });
    }
    if (await walletManager.isSinglePrivateKey()) {
        return sendResponse({
            result: "fail",
            id: message.data.id,
            msg: "User account is single private key mode"
        });
    }
    let rtData = await walletManager.sendOpReturnByHdPath(message.data.params.op,message.data.params.hdPath,message.data.params.receivers)
    //console.log('rtData',rtData)
    return sendResponse({
        result: "success",
        id: message.data.id,
        data:rtData
    });
}

async function handleSignTransactionEx(message, sender, sendResponse) {
    //console.log('----handleSignTransactionEx-')
    if (!await checkConnect(sender)) {
        return sendResponse({
            result: "denied",
            id: message.data.id,
            msg: "Permission denied, connect first"
        });
    }
    if (await walletManager.isSinglePrivateKey()) {
        return sendResponse({
            result: "fail",
            id: message.data.id,
            msg: "User account is single private key mode"
        });
    }

    //return launchUploading(message, sender, sendResponse, false);

    let outputs = txUtils.getTxInfo(message.data.params.txHex).outputs;
    console.log('OUTPUTS:',outputs)
    outputs = outputs.filter(output=>output.type<3)
    console.log('OUTPUTS2:',outputs)

    let rootAddress = await walletManager.getMainAddress()
    let popAuthorizeKey = "pop_authorize:"+rootAddress
    let authData = await storageUtils.getItem(popAuthorizeKey)

    let authAddresses = []
    //console.log(authData)
    if(authData){
        authData.forEach(item=>{
            //console.log(item)
            authAddresses.push(item.address)
        })
    }
    console.log('authAddresses',authAddresses)
    message.data.params.receivers
    let isAuthed = false
    if(authAddresses.length>0 && outputs.length>0){
        outputs.forEach(output=>{
            if(authAddresses.indexOf(output.address)==-1){
                isAuthed = true
            }
        })
    }
    if(outputs.length==1 && outputs[0].address == rootAddress){
        isAuthed = true   
    }
    console.log('isAuthed',isAuthed)
    //如果不在签约收款地址，则弹窗
    if(!isAuthed){
        //console.log(message.data)
        message.data.method = 'signTransaction'
        //console.log(message.data)
        createHandler(message, sender, sendResponse, launchPopup);
        return true
    }
    else{
        let rtData = await txUtils.signTransaction(message.data.params.txHex, message.data.params.inputInfos)
        //let rtData = await walletManager.signTransaction(message.data.params.txHex, message.data.params.inputInfos)
        //console.log(rtData)
        
        return sendResponse({
            result: "success",
            id: message.data.id,
            data:rtData
        });
    }
}


async function handleSignReceiveAddressToWhiteList(message, sender, sendResponse) {
    if (!await checkConnect(sender)) {
        return sendResponse({
            result: "denied",
            id: message.data.id,
            msg: "Permission denied, connect first"
        });
    }
    if (await walletManager.isSinglePrivateKey()) {
        return sendResponse({
            result: "fail",
            id: message.data.id,
            msg: "User account is single private key mode"
        });
    }

    let rootAddress = await walletManager.getMainAddress()
    let _whliteListKey = "_whliteListKey_"+rootAddress
    await storageUtils.setItem(_whliteListKey,message.data.params.receiveAddressList)
    
    return sendResponse({
        result: "success",
        id: message.data.id,
        data:true
    });
}

async function handleGetPopAuthorizeStatus(message, sender, sendResponse) {
    if (!await checkConnect(sender)) {
        return sendResponse({
            result: "denied",
            id: message.data.id,
            msg: "Permission denied, connect first"
        });
    }
    if (await walletManager.isSinglePrivateKey()) {
        return sendResponse({
            result: "fail",
            id: message.data.id,
            msg: "User account is single private key mode"
        });
    }

    let rootAddress = await walletManager.getMainAddress()
    let popAuthorizeKey = "pop_authorize:"+rootAddress
    let authData = await storageUtils.getItem(popAuthorizeKey)
    
    return sendResponse({
        result: "success",
        id: message.data.id,
        data:authData
    });
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // console.log(message, sender.origin, "onMessage");

    if (message.channel === 'sato_contentscript_background_channel_disk') {
        if (message.data.method === 'addEvent') {
            let eventName = message.data.detail;
            if (!eventHandlers[eventName])
                eventHandlers[eventName] = [];
            // console.log(message.data.id, eventName, '###')
            eventHandlers[eventName].push({
                id: message.data.id,
                tabId: sender.tab.id,
                origin: sender.origin,
            })

        } else if (message.data.method === 'removeEvent') {
            let eventName = message.data.detail;
            if (!eventHandlers[eventName])
                return false
            eventHandlers[eventName] = eventHandlers[eventName].filter(item => item.id !== message.data.id)
        } else if (message.data.method === 'connect') {
            createHandler(message, sender, sendResponse, handleConnect);
        } else if (message.data.method === 'listGenesis') {
            createHandler(message, sender, sendResponse, handleListGenesis);
        } else if (message.data.method === 'listNft') {
            createHandler(message, sender, sendResponse, handleListNft);
        } else if (message.data.method === 'disConnect') {
            createHandler(message, sender, sendResponse, handleDisconnect);
        } else if (message.data.method === 'isConnect') {
            createHandler(message, sender, sendResponse, handleIsConnect);
        } else if (message.data.method === 'getBsvBalance') {
            createHandler(message, sender, sendResponse, handleGetBsvBalance);
        } else if (message.data.method === 'getTokenBalance') {
            createHandler(message, sender, sendResponse, handleGetTokenBalance);
        } else if (message.data.method === 'checkTokenUtxoCount') {
            createHandler(message, sender, sendResponse, handleCheckTokenUtxo);
        } else if (message.data.method === 'getAddress') {
            createHandler(message, sender, sendResponse, handleGetAddress);
        } else if (message.data.method === 'getPublicKey') {
            createHandler(message, sender, sendResponse, handleGetPublicKey);
        } else if (message.data.method === 'getPublicKeyAndAddress') {
            createHandler(message, sender, sendResponse, handleGetPublicKeyAndAddress);
        } else if (message.data.method === 'getVersion') {
            createHandler(message, sender, sendResponse, handleGetVersion);
        } else if (message.data.method === 'isHDAccount') {
            createHandler(message, sender, sendResponse, handleIsHDAccount);
        } else if (message.data.method === 'sendOpReturnByHdPath') {
            createHandler(message, sender, sendResponse, handleSendOpReturnByHdPath);
        } else if (message.data.method === 'signTransactionEx') {
            createHandler(message, sender, sendResponse, handleSignTransactionEx);
        } else if (message.data.method === 'getPopAuthorizeStatus') {
            createHandler(message, sender, sendResponse, handleGetPopAuthorizeStatus);
        }
        else {
            createHandler(message, sender, sendResponse, launchPopup);
        }
        // keeps response channel open
        return true;
    } else if (message.channel === 'sato_extension_background_channel_disk') {
        const responseHandler = responseHandlers.get(message.data.id);
        //console.log('connected...',message,responseHandler)
        if (responseHandler) {
            responseHandlers.delete(message.data.id);
            responseHandler(message.data);
        }
    } else if (message.channel === 'sato_extension_background_event_channel_disk') {
        //    事件通道
        let eventName = message.eventName;
        // console.log(eventHandlers[eventName],'###')
        if (eventHandlers[eventName]) {
            for (let i = 0; i < eventHandlers[eventName].length; i++) {
                let {tabId, id, origin} = eventHandlers[eventName][i]
                if (!message.data || !message.data.origin || origin === message.data.origin) { //如果传了origin，则需要相等
                    // console.log('aaa')
                    chrome.tabs.sendMessage(tabId, {
                        channel: "sato_background_event_channel_disk",
                        id,
                        data: message.data
                    })
                }
            }
        }

    }
})
;