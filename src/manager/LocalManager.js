let localManager = {};

const storageUtils = require('../utils/storageUtils')

localManager.refreshLockInfoList = function () {
    // _lockInfoList = localStorage.getItem('lockInfoList');
    // _lockInfoList = _lockInfoList ? JSON.parse(_lockInfoList) : null;
}

// localManager.refreshLockInfoList();


async function getIndex() {
    let localInfo = await localManager.getCurrentAccount();
    let lockInfoList = await localManager.listAccount();
    for (let i = 0; i < lockInfoList.length; i++) {
        if (localInfo.address === lockInfoList[i].address)
            return i;
    }
    return -1;
}

localManager.getList = async function (key) {
    return await storageUtils.getItem(key);
};
localManager.push = async function (key, item) {
    let list = await localManager.getList(key);
    list.push(item);
    await storageUtils.setItem(key, list)
};


localManager.getCurrentAccount = async function () {
    return await storageUtils.getItem('lockInfo');
};

localManager.listAccount = async function () {
    return await storageUtils.getItem('lockInfoList');
};

localManager.saveAccountList = async function (lockInfoList) {
    await storageUtils.setItem('lockInfoList', lockInfoList);
};

localManager.removeAccount = async function () {
    await storageUtils.removeItem("lockInfo");
};
localManager.chooseAccount = async function (accountInfo) {
    await storageUtils.setItem('lockInfo', accountInfo);
};

localManager.saveAlias = async function (accountInfo) {
    let lockInfoList = await localManager.listAccount()
    for (let i = 0; i < lockInfoList.length; i++) {
        if (accountInfo.address === lockInfoList[i].address) {
            lockInfoList[i].alias = accountInfo.alias;
            break
        }
    }
    await storageUtils.setItem('lockInfoList', lockInfoList);

    let lockInfo = await localManager.getCurrentAccount();

    if (lockInfo && accountInfo.address === lockInfo.address) {
        lockInfo['alias'] = accountInfo.alias;
        await storageUtils.setItem('lockInfo', lockInfo);
    }
};

localManager.saveAccount = async function (accountInfo) {
    let lockInfoList =  await localManager.listAccount()
    for (let i = 0; i < lockInfoList.length; i++) {
        if (accountInfo.address === lockInfoList[i].address) {
            lockInfoList[i] = accountInfo;
            break
        }
    }
    await storageUtils.setItem('lockInfoList', lockInfoList);

    let lockInfo = await localManager.getCurrentAccount();

    if (lockInfo && accountInfo.address === lockInfo.address) {
        lockInfo = accountInfo;
        await storageUtils.setItem('lockInfo', lockInfo);
    }
};


localManager.listGenesis = async function () {
    let lockInfo = await localManager.getCurrentAccount();

    return lockInfo.genesisList || [];
};


localManager.saveGenesis = async function (info) {
    let lockInfo = await localManager.getCurrentAccount();

    lockInfo.genesisList ? lockInfo.genesisList.push(info) : lockInfo.genesisList = [info];
    await setItem('lockInfo', lockInfo);
    let lockInfoList = await localManager.listAccount()
    lockInfoList[getIndex()] = lockInfo;
    await setItem('lockInfoList', lockInfoList);
};

localManager.setVersionChecked = async function (versionCode) {
    await storageUtils.setItem('versionCodeChecked', versionCode)
}
localManager.getVersionChecked = async function () {
    let code = await storageUtils.getItem('versionCodeChecked')
    if (code)
        return parseInt(code)
    else
        return 0;
}


localManager.setSettingChecked = function () {
    storageUtils.setItem('isSettingChecked', 'yes')
}
localManager.isSettingChecked = async function () {
    let str = await storageUtils.getItem('isSettingChecked')
    // console.log(str)
    return str && str === 'yes';
}


localManager.isAddressRegistered = async function (address) {
    let list = await storageUtils.getItem('registeredAddress')
    if (!list)
        return false
    list = JSON.parse(list)
    return list.indexOf(address) > -1;
}

localManager.setAddressRegistered = async function (address) {
    let list = await storageUtils.getItem('registeredAddress')
    if (!list)
        list = []
    if (list.indexOf(address) < 0) {
        list.push(address);
        await storageUtils.setItem('registeredAddress', list)
    }
}
localManager.getShowTokenType = async function () {
    return await storageUtils.getItem('showTokenType') || 'added'
}
localManager.setShowTokenType = async function (type) {
    await storageUtils.setItem('showTokenType', type)
}

localManager.setAllTokenTable = async function (data, version) {
    await setItem('allTokenTable', data)
    await setItem('tokenVersion', version)
}

localManager.getAllTokenTable = async function () {
    return await getObjItem("allTokenTable")
}
localManager.getTokenTableVersion = async function () {
    let temp = await storageUtils.getItem("tokenVersion");
    return temp ? (isNaN(temp) ? 0 : parseInt(temp)) : 0;
}

localManager.getNftDataVersion = async function () {
    let temp = await storageUtils.getItem("nftDataVersion");
    return temp ? (isNaN(temp) ? 0 : parseInt(temp)) : 0;
}

localManager.setNftInfoTable = async function (data, version) {
    await setItem('nftInfoTable', data)
    await setItem('nftDataVersion', version)
}
localManager.getNftInfoTable = async function () {
    return await getObjItem('nftInfoTable')
}

localManager.getRecentAddress = async function () {
    return await storageUtils.getItem('recentAddress') || []
}
localManager.addRecentAddress = async function (address, tag, alias = "") {
    let temp = await localManager.getRecentAddress();
    let index = temp.findIndex((item => item.address === address));

    if (index > -1) {
        //    如果已经存在，移到开头
        let target = (temp.splice(index, 1))[0]
        target.timestamp = Date.now();
        if (!target.tags)
            target.tags = []
        if (target.tags.indexOf(tag) < 0) {
            target.tags.push[tag]
        }
        temp.unshift(target)
    } else {
        temp.unshift({
            address,
            alias,
            timestamp: Date.now(),
            tags: [tag]
        })
    }
    await storageUtils.setItem('recentAddress', temp)
}
localManager.clearRecentAddress = async function () {
    await storageUtils.removeItem('recentAddress')
}

localManager.getNftInfoCache = async function (key) {
    let nftInfo = await getObjItem('unknown_nft_cache')
    return nftInfo && nftInfo[key]
}
localManager.saveNftInfoCache = async function (key, data) {
    let nftInfo = await getObjItem('unknown_nft_cache') || {};
    nftInfo[key] = data;

    await setItem("unknown_nft_cache", nftInfo)
}

async function getObjItem(key) {
    return storageUtils.getItem(key);
}

async function setItem(key, value) {
    await storageUtils.setItem(key, value)
}

module.exports = localManager;
