<template>
    <div class="panel">
        <div class="title">{{ popup.genesis_title }}</div>
        <div class="notice">{{ popup.fee }}: {{fee}} Sat.</div>
        <div class="notice" v-if="name">{{ popup.name }}:
            <div class="ellipsis">{{name}}</div>
        </div>
        <div class="notice" v-if="desc">{{ popup.desc }}:
            <div class="ellipsis">{{desc}}</div>
        </div>
        <div class="notice" v-if="icon">{{ popup.icon }}: <img :src="icon" alt=""></div>

        <div class="notice" v-if="isCreating && progressMsg">{{progressMsg}}</div>

        <div class="action-container" v-if="!isCreating">
            <a-button @click="cancel">{{ popup.cancel }}</a-button>
            <a-button type="primary" @click="genesis">{{ popup.genesis }}</a-button>
        </div>
        <a-spin v-else/>
    </div>
</template>

<script>

    const urlParams = new URLSearchParams(window.location.hash.slice(1));
    const origin = urlParams.get('origin');
    const request = JSON.parse(urlParams.get('request'));
    import messages from  '../language/index.js'
    export default {
        name: "Genesis",
        data() {

            return {
                wallet:messages.en.wallet,
                setting:messages.en.setting,
                account:messages.en.account,
                popup:messages.en.popup,
                name: request.params.name,
                desc: request.params.desc,
                icon: request.params.icon,
                progressMsg: "",
                isCreating: false,
                fee: 0,
            }
        },
        async mounted() {
            let op = "";
            this.fee = (await nftManager.sensibleNft.getGenesisFee(op)) + nftManager.getCreateMetaIdForGenesisNftFee();
        },
        methods: {
            cancel() {
                chrome.runtime.sendMessage({
                    channel: 'sato_extension_background_channel_disk',
                    data: {
                        id: request.id,
                        result: "cancel"
                    },
                });
                window.close();
            },
            async genesis() {
                try {


                    let _this = this;
                    this.isCreating = true;

                    //等待0.1秒，防止界面卡住
                    await new Promise(resolve => setTimeout(resolve, 100));

                    let index = await nftManager.getNewGenesisPathIndex();

                    let metaIdInfo = await nftManager.createMetaIdForGenesisNft({
                        index, name: this.name, desc: this.desc, icon: this.icon, callback: (step, msg) => {
                            _this.progressMsg = msg;
                        }
                    });

                    _this.progressMsg = 'popup.progress_notice_1';

                    let result = await nftManager.genesis(index, metaIdInfo);


                    this.isCreating = false;

                    if (result instanceof Error)
                        return;

                    antMessage.success('popup.success');

                    if (request && request.method === 'genesis') {
                        chrome.runtime.sendMessage({
                            channel: 'sato_extension_background_channel_disk',
                            data: {
                                id: request.id,
                                result: "success",
                                data
                            },
                        });
                        window.close();
                    } else if (request && request.method === 'issue') {
                        routerManager.goto('/issue')
                    } else {
                        routerManager.goto('/')
                    }
                } catch (e) {
                    console.log(e)
                    antMessage.error('popup.fail') + e.message;
                    this.isCreating = false;
                    this.progressMsg = ''
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

    .link-info {
        margin: 20px 0;

        display: flex;
        align-items: center;
        flex-direction: column;

        .icon {
            margin: 10px;
            transform: rotateZ(90deg);
        }

        .account-info {
            .account {
            }

            .address {
                color: #666;
                font-size: 12px
            }
        }
    }

    .notice {
        margin: 10px;
        display: flex;
        align-items: center;
        justify-content: center;

        .ellipsis {
            max-width: 200px;
        }

        img {
            max-width: 156px;
            max-height: 200px;
        }
    }

    .action-container {
        display: flex;
        justify-content: space-between;
    }
</style>
