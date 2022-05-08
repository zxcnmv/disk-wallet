let utils = {};
// import {Bip39} from 'bsv/lib/bip-39'
const bsv = require('bsv');
const Mnemonic = require('bsv/lib/mnemonic/mnemonic') //引用“助记词”库
let aesUtils = require('../utils/aesUtils');


utils.createMnemonic = function () {

    return Mnemonic.fromRandom().toString();
};


utils.saveMnemonic = async function (mnemonic, password, isSinglePrivateKey = false, passphrase = '', path = "m/44'/236'/0'") {

    //加盐
    password += 'SatoWallet';
    //计算hash，使用此hash作为秘钥
    password = bsv.crypto.Hash.sha256(Buffer.from(password)).toString('hex');

    //对于有passphrase的情况，加密储存的是助记词和passphrase

    //加密
    let locked = aesUtils.AESEncrypto(mnemonic, password);

    //加盐
    let password2 = password + 'SatoWallet';
    //计算hash，使用此hash确认用户是否输入了正确的密码
    let passwordHash = bsv.crypto.Hash.sha256(Buffer.from(password2)).toString('hex');

    let seed = isSinglePrivateKey ? "" : utils.getSeedFromMnemonic(mnemonic, passphrase);


    let privateKey = isSinglePrivateKey
        ? bsv.PrivateKey.fromWIF(mnemonic)
        : bsv.HDPrivateKey.fromSeed(seed).deriveChild(path+'/0/0').privateKey;
    let address = bsv.Address.fromPrivateKey(privateKey).toString();


    let lockInfoList = await storageUtils.getItem('lockInfoList') || [];
    //console.log('saveMnemonic-aa-0',lockInfoList)
    //检查是否已经存在
    for (let i = 0; i < lockInfoList.length; i++) {
        if (lockInfoList[i].address === address) {
            console.log('saveMnemonic-aa-2',lockInfoList[i])
            return false;
        }
    }
    //console.log('saveMnemonic-bb',lockInfoList)
    let saveInfo = {
        passwordHash,
        locked,
        address,
        alias: 'Account '+(lockInfoList.length + 1),
        isSinglePrivateKey, path,
    };
    //console.log('saveMnemonic-cc',saveInfo)
    if (passphrase !== "") {
        saveInfo.seedLocked = aesUtils.AESEncrypto(seed.toString('hex'), password);
        saveInfo.hasPassphrase = true;
    }
    //console.log('saveMnemonic-dd',saveInfo)
    //本地保存
    //localStorage.setItem('lockInfo', JSON.stringify(saveInfo));
    //console.log('saveMnemonic-added-lockInfo-0',saveInfo)
    await storageUtils.setItem('lockInfo', saveInfo);
    //console.log('saveMnemonic-added-lockInfo-1',saveInfo)

    lockInfoList.push(saveInfo);
    //console.log('saveMnemonic-added-lockInfoList-0',lockInfoList)
    //localStorage.setItem('lockInfoList', JSON.stringify(lockInfoList));
    await storageUtils.setItem('lockInfoList', lockInfoList);
    //console.log('saveMnemonic-added-lockInfoList-1',lockInfoList)

    return true
};


utils.getSeedFromMnemonic = function (mnemonic, passphrase = '') {
    return Mnemonic.fromString(mnemonic).toSeed(passphrase);
};

utils.getAddressFromMnemonic = function (mnemonic, passphrase = '',path="m/44'/236'/0'") {
    let seed = utils.getSeedFromMnemonic(mnemonic, passphrase);
    return bsv.HDPrivateKey.fromSeed(seed).deriveChild(path+'/0/0').privateKey;
};

module.exports = utils;
