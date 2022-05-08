let walletManager = {};

const bsv = require('bsv');
let passwordAesTable = {};
/** 
let bg = chrome.extension && chrome.extension.getBackgroundPage();
if (!bg)
    window.location.reload();
*/

const {API_NET, API_TARGET, Wallet, SensibleApi,TxComposer } = require('sensible-sdk');
const config = require('../config/base');


const localManager = require('./LocalManager');
let aesUtils = require('../utils/aesUtils');
let mnemonicUtils = require('../utils/MnemonicUtils');
const passwordAesKey = 'SatoWallet#2021#d7t2';
const sensibleApi = new SensibleApi(API_NET.MAIN, API_TARGET.SENSIBLE);
const storageUtils = require('../utils/storageUtils')

async function getRootKey(fromSeed = false) {
    //console.log('getRootKey',fromSeed)
    let mRootKey = ""
    if (fromSeed)
        mRootKey = bsv.HDPrivateKey.fromSeed(await walletManager.getSeedFromLocked());
    else{
        let mnemonic = await walletManager.getMnemonic()
        let seed = await mnemonicUtils.getSeedFromMnemonic(mnemonic)
        mRootKey = bsv.HDPrivateKey.fromSeed(seed);
    }
    return mRootKey;

}

walletManager.getPrivateKeyObj = async function(path = '/0/0') {
    //console.log('1111')
    let lockInfo = await storageUtils.getItem('lockInfo')
    if (!lockInfo) {
        throw new Error('Create Wallet First')
    }
    //console.log('getPrivateKeyObj',lockInfo)
    path = (lockInfo.path ? lockInfo.path : "m/44'/236'/0'") + path
    if (lockInfo.isSinglePrivateKey) {
        return bsv.PrivateKey.fromWIF(await walletManager.getMnemonic());
    }
    else{
        let mRootKey = null
        if (lockInfo.hasPassphrase) {
            mRootKey = await getRootKey(true)
        }
        else{
            mRootKey = await getRootKey()
        }
        let dc = mRootKey.deriveChild(path)
        return dc.privateKey
    }
}

function getOneWallet(wif){
    return new Wallet(wif, API_NET.MAIN, 0.5, API_TARGET.WOC)
}


walletManager.getCurrentAccount = localManager.getCurrentAccount;
walletManager.listAccount = localManager.listAccount;

walletManager.removeAccount = localManager.removeAccount;
walletManager.chooseAccount = localManager.chooseAccount;
walletManager.saveAlias = localManager.saveAlias;
walletManager.refreshLockInfoList = localManager.refreshLockInfoList;



walletManager.reload = function () {
}
walletManager.isSinglePrivateKey = async function () {
    let lockInfo = await storageUtils.getItem('lockInfo')
    if (!lockInfo) {
        throw new Error('Create Wallet First')
    }

    return lockInfo.isSinglePrivateKey || false;
}
walletManager.getAccountMode = async function (lockInfo) {
    if (!lockInfo)
        lockInfo = await storageUtils.getItem('lockInfo')
    if (!lockInfo) {
        return ""
    }
    if (lockInfo.isSinglePrivateKey)
        return "PrivKey"

    return "HD"

}
walletManager.isMnemonicCreate = async function () {
    let lockInfo = await localManager.getCurrentAccount();
    return lockInfo !== '' && lockInfo !== null;
};

//是否需要解锁钱包
walletManager.isNeedUnlock = async function () {

    let lockInfo = await storageUtils.getItem('lockInfo')
    if (!lockInfo) {
        throw new Error('Create Wallet First')
    }

    //默认密码
    if (lockInfo.passwordHash === 'b9eb1134beb66506cbdfa320686147d297ba2f3597d772ee92e7dc83e025ac44') {

        mPassword = bsv.crypto.Hash.sha256(Buffer.from('SatoWallet#2021' + 'SatoWallet')).toString('hex');

        return false
    }
//    从bg的对象中查询
    return !passwordAesTable[lockInfo.address] && !mPassword;
};
walletManager.isDefaultPassword = async function () {
    let lockInfo = await storageUtils.getItem('lockInfo')
    if (!lockInfo) {
        throw new Error('Create Wallet First')
    }
    return lockInfo.passwordHash === 'b9eb1134beb66506cbdfa320686147d297ba2f3597d772ee92e7dc83e025ac44'
}
walletManager.checkPassword = async function (password) {
    let lockInfo = await localManager.getCurrentAccount();
    if (!lockInfo) {
        throw new Error('Create Wallet First')
    }
    password += 'SatoWallet';
    password = bsv.crypto.Hash.sha256(Buffer.from(password)).toString('hex');
    let passwordHash = bsv.crypto.Hash.sha256(Buffer.from(password + 'SatoWallet')).toString('hex');

    return passwordHash === lockInfo.passwordHash
}
walletManager.unlock = async function (password, keep) {

    let lockInfo = await localManager.getCurrentAccount();
    if (!lockInfo) {
        throw new Error('Create Wallet First')
    }
    password += 'SatoWallet';
    password = bsv.crypto.Hash.sha256(Buffer.from(password)).toString('hex');
    let passwordHash = bsv.crypto.Hash.sha256(Buffer.from(password + 'SatoWallet')).toString('hex');

    if (passwordHash === lockInfo.passwordHash) {
        await storageUtils.setItem(lockInfo.address,aesUtils.AESEncrypto(password, passwordAesKey));
        return true;
    }
    return false;
};
walletManager.getMnemonic = async function () {
    let lockInfo = await localManager.getCurrentAccount();
    if (!lockInfo) {
        throw new Error('Create Wallet First')
    }
    let mPassword = ""
    //console.log('getMnemonic-A',mPassword,lockInfo)
    if (lockInfo.passwordHash === 'b9eb1134beb66506cbdfa320686147d297ba2f3597d772ee92e7dc83e025ac44') {
        //console.log('getMnemonic-A1',mPassword,lockInfo)
        mPassword = bsv.crypto.Hash.sha256(Buffer.from('SatoWallet#2021' + 'SatoWallet')).toString('hex');
        //console.log('getMnemonic-A2',mPassword,lockInfo)
    }
    else{
        //console.log('getMnemonic-A3',mPassword,lockInfo)
        mPassword = aesUtils.AESEncrypto(await storageUtils.getItem(lockInfo.address, passwordAesKey))
        //console.log('getMnemonic-A4',mPassword,lockInfo)
    }
    
    //console.log('getMnemonic-5',mPassword,lockInfo)
    let seed = aesUtils.AESDecrypto(lockInfo.locked, mPassword)
    //console.log('getMnemonic-6',seed)
    return seed
};

walletManager.getPath = async function () {
    let lockInfo = await localManager.getCurrentAccount();
    if (!lockInfo) {
        throw new Error('Create Wallet First')
    }
    return lockInfo.path || config.path
};

walletManager.getSeedFromLocked = async function () {
    let lockInfo = await localManager.getCurrentAccount();
    if (!lockInfo) {
        throw new Error('Create Wallet First')
    }
    
    let mPassword = aesUtils.AESEncrypto(await storageUtils.getItem(lockInfo.address, passwordAesKey))
   

    let seedStr = aesUtils.AESDecrypto(lockInfo.seedLocked, mPassword);

    return Buffer.from(seedStr, 'hex')
};

walletManager.signMessage = async function (msg, noNeedAddress) {
    if (typeof msg === 'string')
        msg = Buffer.from(msg);
    let privateKey = await walletManager.getPrivateKeyObj("/0/0")
    let address = bsv.Address.fromPrivateKey(privateKey).toString();
    if (msg) {
        let hash = bsv.crypto.Hash.sha256(Buffer.from(msg)) 
        let sig = bsv.crypto.ECDSA.sign(hash, privateKey);
        //console.log(address, sig, msg)
        //let publicKey  = bsv.PublicKey.fromPrivateKey(privateKey)
        //let verified  = bsv.crypto.ECDSA.verify(hash, sig, publicKey)
        //console.log('--verified--',verified)
        return noNeedAddress ? sig : {address, sig}
    }
    return {address}
};

/*
主账户("/0/0)，用于接收 bsv、token、nft

次1账户("m/44'/0'/1'/0/0) 用于 genesis 新的nft
次2账户("m/44'/0'/1'/0/1) 用于 genesis 新nft 的metaid 树 root节点
 */
walletManager.getMainAddress = async function () {
    let mMainAddress = ""
    let account = await localManager.getCurrentAccount()
    if (account && account.address) {
        //通过本地储存获取
        mMainAddress = account.address;
    }
    //console.log('mMainAddress',mMainAddress)
    if (mMainAddress !== "")
        return mMainAddress;
    
    //通过私钥衍生
    // let rootKey = getRootKey();
    // let privateKey = rootKey.derive("/0/0").privKey;
    try {
        let privateKey = await walletManager.getPrivateKeyObj("/0/0")
        //console.log('-----privateKey-----',privateKey)
        let address = bsv.Address.fromPrivateKey(privateKey);
        mMainAddress = address.toString();

        return mMainAddress;
    } catch (e) {
        return ""
    }
};



walletManager.getMainWif = async function () {
    return await walletManager.getWif("/0/0")
};

walletManager.getMainPubKey = async function () {
    return await walletManager.getWifAndPubKey("/0/0").pubKey
};

walletManager.getPubKey = async function (path='/0/0') {
    return await walletManager.getWifAndPubKey(path).pubKey
};

walletManager.getWif = async function (path = '/0/0') {
    let privateKey = await await walletManager.getPrivateKeyObj(path)
    //console.log('privateKey',privateKey)
    return privateKey.toWIF();
};
walletManager.getWifAndPubKey = async function (path = '/0/0') {
    let privateKey = await walletManager.getPrivateKeyObj(path);
    return {wif: privateKey.toWIF(), pubKey: bsv.PublicKey.fromPrivateKey(privateKey).toString(), address: bsv.Address.fromPrivateKey(privateKey).toString()}
};
walletManager.getAddress = async function (path = '/0/0') {
    return bsv.Address.fromPrivateKey(await walletManager.getPrivateKeyObj(path)).toString();
};
walletManager.getPublicKeyAndAddress = async function (path) {
    let wifAndPubKey = await walletManager.getWifAndPubKey(path)
    delete wifAndPubKey.wif
    return wifAndPubKey
};

walletManager.getBsvBalance = async function (address) {
    if (!address)
        address = await walletManager.getMainAddress();
    //console.log('getBsvBalance0',address,sensibleApi)
    let a = await sensibleApi.getBalance(address);
    //console.log('getBsvBalance0',address,sensibleApi)
    return {
        confirmed: a.balance || 0,
        unconfirmed: a.pendingBalance || 0,
        total: (a.balance || 0) + (a.pendingBalance || 0)
    };
};

walletManager.getBsvUtxoCount = async function (address) {
    if (!address)
        address = await walletManager.getMainAddress();
    let _res = await sensibleApi.getUnspents(address)
    return _res.length;
}

walletManager.mergeBsvUtxo = async function (wif) {

    await getOneWallet(wif).merge()

    return await sleep(2000)
}
walletManager.getSendAllInfo = async function (wif) {
    let txComposer = await getOneWallet(wif).merge({
        noBroadcast: true
    })

    return {amount: txComposer.getOutput(0).satoshis, fee: txComposer.getUnspentValue()}
}

walletManager.pay = async function (to, amount, broadcast) {
    let wif = await walletManager.getMainWif();

    //发送单人
    let txComposer = await getOneWallet(wif).send(to, amount, {
        noBroadcast: !broadcast,
    });

    return {rawHex: txComposer.getRawHex(), fee: txComposer.getUnspentValue(), txid: txComposer.getTxId()};
};

walletManager.payArray = async function (receivers, broadcast, wif = null) {
    // console.log('pay array')
    if (!wif)
        wif = await walletManager.getMainWif();

    // console.log(receivers)

    //发送多人
    let txComposer = await getOneWallet(wif).sendArray(receivers, {
        noBroadcast: !broadcast,
    });

    // console.log(txComposer)
    return {rawHex: txComposer.getRawHex(), fee: txComposer.getUnspentValue(), txid: txComposer.getTxId(), tx: txComposer.tx, isInvalid: txComposer.getFeeRate() < 0.5};
};

walletManager.sendOpReturn = async function (op, wif) {
    if (!wif)
        wif = await walletManager.getMainWif();
    return getOneWallet(wif).sendOpReturn(op);
};

walletManager.checkBsvAddress = function (address) {
    return bsv.Address.isValid(address)
};
walletManager.getSeedFromMnemonic = mnemonicUtils.getSeedFromMnemonic;
walletManager.getAddressFromMnemonic = mnemonicUtils.getAddressFromMnemonic;
walletManager.createMnemonic = mnemonicUtils.createMnemonic;
walletManager.saveMnemonic = mnemonicUtils.saveMnemonic;


/*
 *
 * 以下是对单私钥模式的支持
 */
walletManager.getAddressFromWif = function (wif) {
    return bsv.Address.fromPrivateKey(bsv.PrivateKey.fromWIF(wif)).toString()
}

walletManager.deleteCurrent = async function () {
    let lockInfo = await localManager.getCurrentAccount()
    if (!lockInfo)
        return

    let lockInfoList = await localManager.listAccount()

    // 删除
    if (lockInfoList) {
        lockInfoList = lockInfoList.filter((item) => item.address !== lockInfo.address)
    }

    if (passwordAesTable[lockInfo.address]) {
        delete passwordAesTable[lockInfo.address]
    }

    await localManager.saveAccountList(lockInfoList)
    await localManager.removeAccount();
    walletManager.reload();
}

walletManager.changePassword = async function (oldPwd,newPwd){
    let lockInfo = await localManager.getCurrentAccount();
    if (!lockInfo) {
        throw new Error('Create Wallet First')
    }
    oldPwd += 'SatoWallet';
    oldPwd = bsv.crypto.Hash.sha256(Buffer.from(oldPwd)).toString('hex');
    let passwordHash = bsv.crypto.Hash.sha256(Buffer.from(oldPwd + 'SatoWallet')).toString('hex');

    if( passwordHash !== lockInfo.passwordHash){
        throw new Error('wrong password')
    }

    //change locked & passwordHash
    let mnemonic =  aesUtils.AESDecrypto(lockInfo.locked, oldPwd);

    newPwd += 'SatoWallet';
    newPwd = bsv.crypto.Hash.sha256(Buffer.from(newPwd)).toString('hex');

    lockInfo['passwordHash'] = bsv.crypto.Hash.sha256(Buffer.from(newPwd + 'SatoWallet')).toString('hex');
    lockInfo['locked'] = aesUtils.AESEncrypto(mnemonic,newPwd);

    await localManager.saveAccount(lockInfo);

    walletManager.reload();
}


walletManager.payByHdPath = async function (to, amount, broadcast,hdPath='/0/0') {
    let wifAndPubKey = await walletManager.getWifAndPubKey(hdPath)
    return await walletManager.payByWif(wifAndPubKey.wif,to,amount,broadcast)
};

walletManager.payByWif = async function (wif,to, amount, broadcast) {
    //发送单人
    let txComposer = await getOneWallet(wif).send(to, amount, {
        noBroadcast: !broadcast,
    });
    return {rawHex: txComposer.getRawHex(), fee: txComposer.getUnspentValue(), txid: txComposer.getTxId()};
};

walletManager.sendOpReturnByHdPath = async function (op,hdPath) {
    let wifAndPubKey = await walletManager.getWifAndPubKey(hdPath)
    return getOneWallet(wifAndPubKey.wif).sendOpReturn(op);
};

module.exports = walletManager;
