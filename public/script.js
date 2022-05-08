//用于给网站提供接口
if (!window.diskWallet)
    window.diskWallet = {};

window.diskWallet.postMessage = (message, callback) => {
    const listener = (event) => {
        if (event.detail.id === message.id) {

            window.removeEventListener('sato_contentscript_message_disk', listener);
            if (callback && typeof callback === "function") {
                callback(event.detail)
            }
        }
        // console.log(event, 'script.js listener')
    };

    window.addEventListener('sato_contentscript_message_disk', listener);

    window.dispatchEvent(
        new CustomEvent('sato_injected_script_message_disk', {detail: message}),
    );
};
window.diskWallet.on =  (eventName,callback)=>{
    let id = eventName+ Date.now() + "" + Math.floor(Math.random() * 1000000);
    //注册事件响应
    window.addEventListener('sato_contentscript_event_disk', (event)=>{
        if (event.detail.id === id) {
            if (callback && typeof callback === "function") {
                callback(event.detail)
            }
        }
    },{once:false});

    //向bg注册事件
    window.dispatchEvent(
        new CustomEvent('sato_injected_script_message_disk', {detail:{
            id,
            method:"addEvent",
            detail: eventName
        }}),
    );

    //页面刷新、关闭时移除事件
    window.addEventListener("unload",(event)=>{
        //console.log("on unload, remove event listener")
        window.dispatchEvent(
            new CustomEvent('sato_injected_script_message_disk', {detail:{
                    id,
                    method:"removeEvent",
                    detail: eventName
                }}),
        );
    })

}

function action(actionName, params) {
    return new Promise((resolve, reject) => {
        if (!params)
            params = {};
// console.log(params,'params');
        window.diskWallet.postMessage({
            method: actionName,
            params,
            id: actionName + Date.now() + "" + Math.floor(Math.random() * 1000000),
        }, (result) => {
            if (result.result === 'success') {
                // console.log(result)
                resolve(result.data)
            } else {
                // console.log(result)
                reject(new Error(result.msg || result.result))
            }
        })
    })
}

window.diskWallet.requestAccount = (params) => {
    return action('connect', params)
};
window.diskWallet.exitAccount = (params) => {
    return action('disConnect', params)
};
window.diskWallet.isConnect = (params) => {
    return action('isConnect', params)
};
window.diskWallet.getAccount = window.diskWallet.requestAccount

window.diskWallet.getBsvBalance = (params) => {
    return action('getBsvBalance', params)
};
window.diskWallet.getSensibleFtBalance = (params) => {
    return action('getTokenBalance', params)
};

/**
 *
 * @param receivers Array<{address : string,amount : number}>
 * @param broadcast boolean 是否广播
 */
window.diskWallet.transferBsv = ({receivers, broadcast}) => {
    if (broadcast === undefined || broadcast == null)
        broadcast = true
    return action('pay', {broadcast, receivers})
};


window.diskWallet.transferSensibleFt = ({genesis,codehash, rabinApis, broadcast, receivers}) => {
    if (broadcast === undefined || broadcast == null)
        broadcast = true
    return action('payToken', {broadcast, genesis,codehash, rabinApis, receivers})
};

window.diskWallet.signTx = ({list}) => {
    return action('signTx', {list})
};
window.diskWallet.signMsg = ({msg}) => {
    return action('signMsg', {msg})
};
window.diskWallet.checkTokenUtxoCount = ({genesis,codehash}) => {
    return action('checkTokenUtxoCount', {genesis,codehash})
};
/*
const transferAll = await bsv.transferAll()
*/
window.diskWallet.transferAll = async (params) => {
    let result = [];
    for (let i = 0; params && i < params.length; i++) {
        if(i>0 &&result[i-1].utxo ){
            params[i].utxo = result[i-1].utxo;
        }
        result[i] = await action(params[i].genesis ? 'payToken' : 'pay', params[i])
    }
    return result;
}


window.diskWallet.payWithoutBroadcast = ({receivers}) => {
    return action('pay', {
        receivers,
        broadcast: false,
    })
};


window.diskWallet.getVersion = ()=>{
    return action('getVersion', {})
}

window.diskWallet.isHDAccount = ()=>{
    return action('isHDAccount', {})
}

window.diskWallet.getPublicKeyAndAddress =(hdPath)=>{
    return action('getPublicKeyAndAddress', {hdPath})
}

// 以下是nft部分
window.diskWallet.genesis = (params) => {
    return action('genesis', params)
};
window.diskWallet.issue = (params) => {
    return action('issue', params)
};
/**
 *
 * @param params
 */
window.diskWallet.transferNft = (params) => {
    return action('transferNft', params)
};

window.diskWallet.listGenesis = (params) => {
    return action('listGenesis', params)
};
window.diskWallet.listNft = (params) => {
    return action('listNft', params)
};


// 以下是web3 支持
window.diskWallet.getAddress =(hdPath)=>{
    return action('getAddress', {path:hdPath})

}
window.diskWallet.getPublicKey =(hdPath)=>{
    return action('getPublicKey', {path:hdPath})
}


window.diskWallet.signTransaction =(txHex,inputInfos)=>{
    return action('signTransaction', {txHex,inputInfos})
}

window.diskWallet.signMessage =(msg)=>{
    return action('signMsg', {msg,noNeedAddress:true})
}


/** diskwallet扩展功能 */

window.diskWallet.signPopAuthorize =(params)=>{
    return action('signPopAuthorize', params)
}

window.diskWallet.clearPopAuthorize =(params)=>{
    return action('clearPopAuthorize', params)
}

window.diskWallet.getPopAuthorizeStatus =(params)=>{
    return action('getPopAuthorizeStatus', params)
}
window.diskWallet.signTransactionEx =(params)=>{
    return action('signTransactionEx', params)
}


console.log('diskWallet script loaded #');
