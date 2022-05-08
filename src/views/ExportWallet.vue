<template>
    <div class="top-info">
        <div class="title">{{ wallet.mnemonic }}</div>
        <div class="notice">{{ wallet.mnemonic_notice_4 }}</div>
        <div class="warning">
            <img src="../assets/icon-warning.svg" alt="warning" class="left">
            <div class="right">
                <div class="title">{{ setting.notice_1 }}</div>
                <div class="notice">{{ setting.notice_2 }}</div>
            </div>
        </div>
    </div>
    <div class="panel" v-if="step===0">
        <a-input class="password" v-model:value="password" :placeholder="wallet.input_password_2" type="password"/>

        <div class="button-container">
            <div>
            </div>

            <a-button type="primary" @click="next">{{ wallet.next }}</a-button>
            <!--            <a-button v-else type="primary">{{ 'wallet.next' }}</a-button>-->
        </div>
    </div>
    <div class="panel" v-if="step===1">
<!--        <div class="notice"></div>-->

        <div class="seed-container">
            <div class="seed-title">{{ wallet.mnemonic }}</div>
            <div class="copy-btn" id="icon-copy" :data-clipboard-text="mnemonic">
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M0 0H1H9V1H1V9H0V0ZM2 2H11V11H2V2ZM3 3H10V10H3V3Z" fill="#989a9b"></path>
                </svg>
            </div>
            <div v-if="mnemonic" id="mnemonic" class="content">{{ mnemonic }}</div>
            <div v-else class="content">
                <a-spin/>
            </div>
        </div>
        <div class="button-container">
            <div>
                {{ wallet.der_path }}:{{path}}
            </div>

            <a-button type="primary" @click="goBack">{{ wallet.pre }}</a-button>
            <!--            <a-button v-else type="primary">{{ 'wallet.next' }}</a-button>-->
        </div>
    </div>

</template>

<script>
import Clipboard from "clipboard";
let clip = null;
import messages from  '../language/index.js'
export default {
    name: "ExportWallet",
    data: () => {
        return {
            wallet:messages.en.wallet,
            setting:messages.en.setting,
            account:messages.en.account,
            popup:messages.en.popup,
            step: 0,
            // isMnemonicSaved: false,
            // btnCanClick: false,
            password: "",

            mnemonic: null,
            path:""
        }
    },


    created() {

    },
    async mounted() {
        if (await walletManager.isDefaultPassword()) {
            this.next()
        }
    },
    methods: {

        async next() {
            if (this.step === 0) {
                if (await walletManager.isDefaultPassword()) {

                    this.step++;
                } else if (await walletManager.checkPassword(this.password)) {
                    this.step++;
                } else {
                    antMessage.error(wallet.password_error_2)
                }

                this.mnemonic = await walletManager.getMnemonic();
                this.path = await walletManager.getPath();
                clip = new Clipboard('#icon-copy');
                clip.on('success', e => {
                    antMessage.success(this.account.clip.replace('{0}',['mnemonic']));
                });
            }
        },
        goBack() {
            routerManager.gotoHome();
        },
    },
    unmounted() {
        //卸载组件时，销毁
        if(clip)
            clip.destroy()
    },
}

</script>

<style scoped lang="scss">

.top-info{
    width: 375px;
    margin: 0 auto;
    .title{
        font-size: 24px;
        padding: 8px 16px;
    }
    .notice{
        padding: 0 16px;
    }
   .warning{
       background-color: #FDF4F4;
       display: flex;
       flex-direction: row;
       align-items: center;
       padding: 8px 20px 8px 0;

       .left{
           margin: 0 20px;
       }
       .right{
           .title{
               padding: 0;

               font-size: 14px;
           }
           .notice{
               padding: 0;
           }
       }
   }
}

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


    .copy-btn {
        position: absolute;
        top: 0;
        right: 16px;
        padding: 4px 8px;
        background-color: white;
        transform: translateY(-50%);
        border-radius: 5px;

        &:hover{
            background-color: #ccc;
        }
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

    &:hover {
        background-color: red;
    }

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
