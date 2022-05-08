<template>
    <div class="panel-container">

        <div class="panel">
            <div class="title" v-if="origin">{{ popup.sign_msg_request }}</div>
            <div class="pay-info" v-if="origin">
                <div class="origin">{{ origin }}</div>
            </div>
            <div class="notice">
                {{ popup.sign_notice }}
            </div>
            <div class="notice">{{ popup.sign_msg }}</div>
            <div class="msg-panel">{{ msg }}</div>

        </div>
        <div class="action-panel">
            <div class="action-container" v-if="!isCreating">
                <a-button @click="cancel">{{ popup.cancel }}</a-button>
                <a-button type="primary" @click="commit">{{ popup.sign }}</a-button>
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
        //console.log(request.params)
        return {
            wallet:messages.en.wallet,
            setting:messages.en.setting,
            account:messages.en.account,
            popup:messages.en.popup,
            isCreating: false,
            origin,
            msg: request.params.msg,
            noNeedAddress: request.params.noNeedAddress,
        }
    },
    async mounted() {

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
                
                let data = await walletManager.signMessage(this.msg, this.noNeedAddress)
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
</style>
