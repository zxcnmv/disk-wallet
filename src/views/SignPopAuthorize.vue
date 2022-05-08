<template>
    <div class="panel-container">

        <div class="panel">
            <div class="title" v-if="origin">{{ popup.sign_msg_request }}</div>
            <div class="pay-info" v-if="origin">
                <div class="origin">{{ origin }}</div>
            </div>
            <div class="notice">
                After authorization, the file upload function will not pop up the wallet signature window, and you will get a smoother experience!
            </div>

            <div v-if="authData">
                
                <div class="notice">
                    current Authorized
                </div>
                <div class="item" v-for="item in authData" :key="item">
                    <div class="info">
                        <span>{{ item.desc+"("+item.path+")" }}</span>
                    </div>
                    <div class="info">
                        <span style="font-size: 12px">{{ item.address }} </span>
                    </div>
                </div>
            </div>
            <div v-else class="tx-list">
                <div class="item" v-for="item in receiveAddressList" :key="item">
                    <div class="info">
                        <span>{{ item.desc+"("+item.path+")" }}</span>
                    </div>
                    <div class="info">
                        <span style="font-size: 12px">{{ item.address }} </span>
                    </div>
                </div>
            </div>

        </div>
        <div class="action-panel">
            <div class="action-container" v-if="!isCreating">
                <a-button @click="cancel">{{ popup.cancel }}</a-button>
                <a-button type="primary" @click="commit" v-if="!authData">authorize</a-button>
                <a-button type="primary" @click="clear" v-if="authData">clear</a-button>
            </div>
            <a-spin v-else/>
        </div>
    </div>

</template>

<script>

const urlParams = new URLSearchParams(window.location.hash.slice(1));
const origin = urlParams.get('origin');
const request = JSON.parse(urlParams.get('request'));

import messages from  '../language/index.js'
export default {
    name: "Pay",
    data() {
        return {
            wallet:messages.en.wallet,
            setting:messages.en.setting,
            account:messages.en.account,
            popup:messages.en.popup,
            isCreating: false,
            origin,
            receiveAddressList: request.params.receiveAddressList,
            authData:null
        }
    },
    async mounted() {
         
        let rootAddress = await walletManager.getMainAddress()
        let popAuthorizeKey = "pop_authorize:"+rootAddress
        this.authData = await storageUtils.getItem(popAuthorizeKey)

    },
    methods: {
        cancel(result = 'cancel') {
            chrome.runtime.sendMessage({
                channel: 'sato_extension_background_channel_disk',
                data: {
                    id: request.id,
                    result: "cancel"
                },
            });
            window.close();
        },
        async commit() {

            try {
                this.isCreating = true;
                await sleep(10)

                let rootAddress = await walletManager.getMainAddress()
                let popAuthorizeKey = "pop_authorize:"+rootAddress
                let data = await storageUtils.setItem(popAuthorizeKey,this.receiveAddressList)

                chrome.runtime.sendMessage({
                    channel: 'sato_extension_background_channel_disk',
                    data: {
                        id: request.id,
                        result: "success",
                        data,
                    },
                });
                window.close();

            } catch (e) {
                console.error(e)
                if (typeof e === 'string')
                    return antMessage.error(e)
                antMessage.error(e.message)
            } finally {
                this.isCreating = false;
            }
        },
        async clear(){
            let rootAddress = await walletManager.getMainAddress()
            let popAuthorizeKey = "pop_authorize:"+rootAddress
            await storageUtils.removeItem(popAuthorizeKey)
            this.authData = await storageUtils.getItem(popAuthorizeKey)
        }
    }
}
</script>

<style scoped lang="scss">
.panel {
    text-align: center;

}

.title {
    font-size: 1.2em;
    font-weight: bold;
}

.genesis-container {
    margin-top: 10px;
}

.notice {
    margin: 10px;
}

.action-container {
    margin-top: 10px;

    display: flex;
    justify-content: space-between;
}

.msg-panel {
    max-height: 300px;
    overflow-y: scroll;
    margin: 16px 0;
    padding: 8px;
    border-radius: 5px;
    border: 1px #ccc solid;
    background-color: whitesmoke;
    white-space: pre-line;
    overflow-wrap: break-word;
    line-height: 140%;
    font-family: Euclid, Roboto, Helvetica, Arial, sans-serif;
    color: #5d5d5d;
    font-style: normal;
    font-weight: normal;
    text-align: left;

    &::-webkit-scrollbar {
        width: 0;
        height: 0;
    }
}

.tx-list {

    padding: 8px;

    max-height: 320px;
    overflow-y: auto;


    .item {


        &:not(:first-child) {
            margin-top: 10px;
        }

        .info {
            display: flex;
            justify-content: space-between;

            .mine-tag {
                border-radius: 4px;
                background-color: green;
                color: white;
                padding: 1px 2px;
            }

            .tag {
                border-radius: 4px;
                //color: white;
                color: green;
                font-weight: bold;

                &.red {
                    color: red;
                }
            }

            .address {
                font-size: 12px;
            }
        }

    }
}
</style>
