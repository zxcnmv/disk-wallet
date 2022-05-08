const apiUtils = require("./apiUtils");
const httpUtils = require("@/utils/httpUtils");
const txUtils = {};

//const BN = require('bn.js')

/** 
let bg = chrome.extension && chrome.extension.getBackgroundPage();
if (!bg)
    window.location.reload();
*/
const sensibleSdk = require("sensible-sdk");

const TxDecoder = sensibleSdk.TxDecoder;
const API_NET = sensibleSdk.API_NET;
//const bsv156 = sensibleSdk.bsv;
const bsv156 = require("bsv");
//require('bsv/lib/crypto/bn.js') //引用“助记词”库

const config = require('../config/base')
const walletManager = require("../manager/WalletManager");

txUtils.txTypeWord = {
    0: "NFT",
    1: "TOKEN",
    2: "BSV",
    3: "OP_RETURN",
    4: "UNKNOWN",
}

txUtils.txType = {
    "SENSIBLE_NFT": 0,
    "SENSIBLE_FT": 1,
    "P2PKH": 2,
    "OP_RETURN": 3,
    "UNKNOWN": 4,
}

txUtils.getTxInfo = function (rawHex) {
    return TxDecoder.decodeTx(new bsv156.Transaction(rawHex), API_NET.MAIN)
};

txUtils.getInputsInfo= function (script,satoshis){
    return TxDecoder.decodeOutput(new bsv156.Transaction.Output({
        satoshis,script
    }), API_NET.MAIN)
}

txUtils.sign = (wif, {txHex, scriptHex, address, inputIndex, satoshis, sigtype,}) => {
    if (!sigtype)
        sigtype = bsv156.crypto.Signature.SIGHASH_ALL | bsv156.crypto.Signature.SIGHASH_FORKID;

    let sighash = bsv156.Transaction.Sighash.sighash(
        new bsv156.Transaction(txHex),
        sigtype,
        inputIndex,
        new bsv156.Script(scriptHex),
        new bsv156.crypto.BN(satoshis)
    ).toString("hex");

    let privateKey = null;
    if(address){
        if(walletManager.checkBsvAddress(address)){
            if(address!==walletManager.getMainAddress()){
                throw new Error("unsupported address in inputInfos")
            }else
                privateKey = bsv156.PrivateKey.fromWIF(wif);
        }else   //传了address却不是地址，则视为path去衍生
            privateKey = bsv156.PrivateKey.fromWIF(walletManager.getWif(address));  //address :比如 /0/0
    }else
        privateKey = bsv156.PrivateKey.fromWIF(wif);

    let publicKey = privateKey.toPublicKey().toString();

    let sig = bsv156.crypto.ECDSA.sign(
        Buffer.from(sighash, "hex"),
        privateKey,
        "little"
    );

    return {
        publicKey,
        r: sig.r.toString("hex"),
        s: sig.s.toString("hex"),
        sig: sig.set({nhashtype: sigtype}).toTxFormat().toString("hex"),
    }
}


txUtils.signTransaction = async function (txHex, inputInfos) {
    const tx = new bsv156.Transaction(txHex);
    let newInputInfos = []
    for(let i=0;i<inputInfos.length;i++){
        let v = inputInfos[i]
        //console.log('----signTransaction----01',i, v)
        let privateKey = null;
        let wif = await walletManager.getMainWif()
        if(v.address){
            if(walletManager.checkBsvAddress(v.address)){
                let mainAddress = await walletManager.getMainAddress()
                if(v.address!==(mainAddress)){
                    throw new Error("unsupported address in inputInfos")
                }else
                    privateKey = bsv156.PrivateKey.fromWIF(wif);
            }else  {
                //传了address却不是地址，则视为path去衍生
                wif = await walletManager.getWif(v.address)
                privateKey = bsv156.PrivateKey.fromWIF(wif);
            }
        }else
            privateKey = bsv156.PrivateKey.fromWIF(wif);
            
        //console.log('----signTransaction----04',privateKey)
        let sighash = bsv156.Transaction.Sighash.sighash(
            tx,
            v.sighashType,
            v.inputIndex,
            new bsv156.Script(v.scriptHex),
            new bsv156.crypto.BN(v.satoshis)
        ).toString("hex");

        //console.log('----signTransaction----',sighash)
        var sig = bsv156.crypto.ECDSA.sign(
            Buffer.from(sighash, "hex"),
            privateKey,
            "little"
        ).set({
            nhashtype: v.sighashType,
        })
        //console.log('----signTransaction----2',sig)
        sig = sig.toString();
        //console.log('----signTransaction----3',sig)
        newInputInfos.push({sig, publicKey: privateKey.toPublicKey().toString()})
    }
    //console.log('newInputInfos',newInputInfos)
    return newInputInfos
}

txUtils.getMetaData = async function (metaTxId, metaOutputIndex) {
    let metaData = {};
    if(metaTxId==="0000000000000000000000000000000000000000000000000000000000000000")
        return metaData
    try {
        let _res = await apiUtils.getRawTx(metaTxId);
        let tx = new bsv156.Transaction(_res);
        let chunks = tx.outputs[metaOutputIndex].script.chunks;
        let jsonData = chunks[2].buf.toString();
        if (jsonData === 'meta') {
            let data = chunks[7].buf.toString();
            metaData = JSON.parse(data);
            metaData.type = "metaid"
            metaData.description = metaData.desc;
            metaData.officialSite = metaData.website;
            if (metaData.icon)
                metaData.image = 'https://showman.showpay.io/metafile/' + metaData.icon.replace('metafile://', "")
        } else {
            metaData = JSON.parse(jsonData);
            metaData.type = "standard"

            // console.log(metaData,"metaData")
            if (metaData && metaData.tokenUri) {
                let result = await httpUtils.get(metaData.tokenUri)
                if (result) {
                    metaData.name = result.name;
                    metaData.image = result.image;
                    metaData.description = result.description;
                    metaData.attributes = result.attributes;
                }
            }
        }

    } catch (e) {
        console.error('parse metadata failed', e);
    }
    if (config.debug)
        console.log(metaData, 'metaData')
    return metaData;
    // return {};
}


module.exports = txUtils;
