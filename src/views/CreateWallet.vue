<template>
    <div class="panel" v-if="step===-2">
        <a-spin></a-spin>
    </div>
    <div class="panel" v-else-if="step===-1">
        <div class="title">
            {{ wallet.welcome }}
        </div>
        <div class="desc">
            {{ wallet.welcome_2 }}
        </div>
        <div class="desc">
            {{ wallet.welcome_3 }}
        </div>
        <a-checkbox class="keep" v-model:checked="agreeTerm">
            <span>{{ wallet.agree_term }}</span>
            {{ wallet.term }}
            <a href="https://sensilet.com/term-of-service.html" v-if="flase" class="term" target="_blank" rel="noopener">
                {{ wallet.term }}
            </a>
        </a-checkbox>
        <div class="button-container">
            <div></div>
            <a-button type="primary" :disabled="!agreeTerm" @click="next">{{ wallet.begin }}</a-button>
        </div>
    </div>
    <div class="panel" v-else-if="step===0">

        <div class="title">{{ wallet.create_wallet }}</div>
        <div class="desc">{{ wallet.create_wallet_notice }}</div>
        <div class="desc">{{ wallet.create_wallet_notice_2 }}</div>
        <div class="seed-container">
            <div class="seed-title">{{ wallet.mnemonic }}</div>
            <div v-if="mnemonic" id="mnemonic" class="content">{{ mnemonic }}</div>
            <div v-else class="content">
                <a-spin/>
            </div>
        </div>
        <div class="desc">{{ wallet.create_wallet_notice_3 }}</div>
        <div class="desc">{{ wallet.create_wallet_notice_4 }}</div>
        <div class="word-btn" @click="showCustomPanel()">{{ wallet.adv_options }}</div>

        <div class="button-container">
            <div class="import-btn" @click="gotoImport()">
                {{ wallet.import_mnemonic }}
            </div>

            <a-button type="primary" @click="next">{{ wallet.next }}</a-button>
            <!--            <a-button v-else type="primary">{{ 'wallet.next'}}</a-button>-->
        </div>
    </div>
    <div class="panel" v-else-if="step===1">
        <div class="title">{{ wallet.confirm_mnemonic }}</div>
        <div class="desc">{{ wallet.mnemonic_notice }}</div>
        <a-textarea v-model:value="inputMnemonic" :placeholder="wallet.confirm_mnemonic_placeholder" :rows="3"/>

        <div class="button-container">
            <a-button type="default" @click="pre">{{ wallet.pre }}</a-button>
            <a-button type="primary" @click="next" :disabled="inputMnemonic!==mnemonic">{{ wallet.next }}</a-button>
        </div>
    </div>
    <div class="panel" v-else-if="step===2">
        <div class="title">{{ wallet.set_password }}</div>
        <div class="desc">{{ wallet.set_password_notice }}</div>
        <a-input v-model:value="password" :placeholder="wallet.input_password" type="password"/>
        <a-input style="margin-top: 10px" v-model:value="rePassword" :placeholder="wallet.input_password_again" type="password"/>
        <div class="desc">{{ wallet.set_password_notice_2 }}</div>
        <div class="button-container">
            <a-button v-if="!isGoingToNext" type="default" @click="pre">{{ wallet.pre }}</a-button>
            <a-button v-if="!isGoingToNext" type="primary" @click="next">{{ wallet.commit }}</a-button>
            <a-spin v-if="isGoingToNext"/>

        </div>
    </div>
    <a-modal v-model:visible="showCustom" :closable=false @ok="setOpt">
        <div class="custom-panel">
            <div class="notice warning">
                <img src="../assets/icon-warning.svg" alt="warning" class="left">
                <span>
                    {{ wallet.options_notice }}
                </span>
            </div>
            {{ wallet.passphrase }}
            <a-tooltip placement="top" color="orange">
                <template #title>
                    <div style="font-size: 14px">
                        {{ wallet.passphrase_notice_1 }}<br>
                        {{ wallet.passphrase_notice_2 }}<br>
                        {{ wallet.passphrase_notice_3 }}<br>
                        {{ wallet.passphrase_notice_4 }}
                    </div>
                </template>
                <img src="../assets/icon-question.png" style="width: 24px;margin-bottom: 2px" alt="">
            </a-tooltip>
            <a-input v-model:value="inputPassphrase"/>
            {{ wallet.der_path }}
            <a-input v-model:value="inputPath"/>
        </div>
    </a-modal>
</template>

<script>

import messages from  '../language/index.js'

let _this = null;
export default {
    name: "CreateWallet",
    data: () => {
        let isFirstEnter = localStorage.getItem('firstEnterTimestamp') === null

        return {
            wallet:messages.en.wallet,
            step: isFirstEnter ? -1 : 0,
            agreeTerm: false,
            // isMnemonicSaved: false,
            // btnCanClick: false,
            password: "",
            rePassword: "",
            mnemonic: null,
            isGoingToNext: false,
            inputMnemonic: "",
            clickCount: 0,
            passphrase: "",
            path: "m/44'/236'/0'",
            showCustom: false,
            inputPassphrase: "",
            inputPath: "m/44'/236'/0'",
        }
    },
    beforeCreate() {

    },

    async mounted() {
        _this = this;

        await sleep(100)

        await this.createMnemonic();
    },
    methods: {
        async createMnemonic() {
            return new Promise(resolve => {
                let mnemonic = sessionStorage.getItem('mnemonic');
                if (!mnemonic)
                    mnemonic = walletManager.createMnemonic();
                sessionStorage.setItem('mnemonic', mnemonic);
                this.mnemonic = mnemonic;

                resolve();
            })
        },
        showCustomPanel() {
            this.inputPassphrase = this.passphrase;
            this.inputPath = this.path;
            this.showCustom = true
        },
        setOpt() {
            this.passphrase = this.inputPassphrase;
            this.path = this.inputPath;
            this.showCustom = false;
        },

        async next() {
            try {
                if (this.step === -1) {
                    localStorage.setItem('firstEnterTimestamp', Date.now() + "")
                    this.step++;
                } else if (this.step === 0) {
                    antModal.confirm({
                        content: this.wallet.mnemonic_saved,
                        onOk() {
                            _this.step++;
                        }
                    })
                } else if (this.step === 1) {
                    this.step++;
                } else if (this.step === 2) {
                    //如果输入了密码则检查
                    if (this.password && this.password.length > 0) {
                        if (this.password !== this.rePassword)
                            return antMessage.warning(this.wallet.password_error);
                    }
                    if (!this.password) {
                        //  没设置则使用 默认密码
                        this.password = 'SatoWallet#2021';
                        this.rePassword = 'SatoWallet#2021'
                    }
                    //console.log('saveMnemonic-before',this.mnemonic)
                    if (await walletManager.saveMnemonic(this.mnemonic, this.password, false, this.passphrase, this.path)) {
                        sessionStorage.removeItem('mnemonic');
                        //console.log('ok 0')
                        this.isGoingToNext = true;

                        walletManager.reload();
                        //console.log('ok 1')
                        walletManager.refreshLockInfoList();
                        //console.log('ok 2')
                        //console.log('unlock -1')
                        await this.$store.commit('initAccount')
                        //console.log('unlock 0')
                        //解锁钱包，并跳转到账户页面
                        await walletManager.unlock(this.password, false);
                        //console.log('unlock 1')
                        if (this.$store.state.accountList && this.$store.state.accountList.length > 0) {
                            eventManager.dispatchAccountChange();
                        }
                        //console.log('goNextPage')
                        goNextPage();
                    }
                } else
                    antMessage.error(this.wallet.save_error)
            } catch (e) {
                antMessage.error(e && e.message || e)
                console.error(e)
            }
        },
        pre() {
            this.step--;
        },
        gotoImport() {
            routerManager.goto('/import')
        }
    }
}

function goNextPage() {

    let url = sessionStorage.getItem('go_for_url');
    let data = sessionStorage.getItem('go_for_url_data');
    if (data)
        data = JSON.parse(data);
    if (url) {
        sessionStorage.removeItem('go_for_url');
        routerManager.goto(url, data);
    } else
        routerManager.goto('/account')

}

</script>

<style scoped lang="scss">


.title {
    font-size: 1.2em;
    font-weight: bold;
    color: #222;
    margin-top: 8px;
}

.desc {
    margin: 12px 0;
}

.seed-container {
    margin-top: 16px;
    margin-bottom: 8px;
    position: relative;

    .seed-title {
        position: absolute;
        top: 0;
        left: 16px;
        padding: 0 4px;
        background-color: white;
        transform: translateY(-50%);
    }

    .content {
        padding: 14px;
        border-radius: 4px;
        cursor: text;
        display: inline-flex;
        box-sizing: border-box;
        align-items: center;

        border: solid 1px #ddd;

        &:hover {
            border: solid 1px #22ccff;
        }
    }
}

.check-container {
    display: flex;
    align-items: center;

    .check-box {
        img {
            //width: 24px;
        }
    }

    span {
        margin-left: 4px;
    }

    label {
        display: flex;
        align-items: center;

        span {
            margin-top: 1px;
        }
    }
}

.button-container {
    margin-top: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .import-btn {
        cursor: pointer;
        color: #666;
        text-decoration: underline;
    }

    .button {
        cursor: pointer;
        font-size: 1.1em;
        color: #22ccff;
        padding: 4px 8px;

        &.not-main {
            color: #333;
        }

        &.disable {
            cursor: not-allowed;
            color: #999;
            background-color: #ddd;
        }
    }
}


</style>
