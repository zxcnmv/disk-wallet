<template>

    <div class="panel" v-if="step===0">
        <div class="title">{{ wallet.import_private }}</div>
        <div class="desc">{{ wallet.private_notice_3 }}</div>
        <a-textarea v-model:value="inputMnemonic" :placeholder="wallet.confirm_private_placeholder" :rows="3"/>
        <div class="button-container">
            <a-button type="default" @click="back()"> {{ wallet.back }}</a-button>

            <a-button type="primary" @click="next" :disabled="inputMnemonic.length<23">{{ wallet.next }}</a-button>
        </div>
    </div>
    <div class="panel" v-if="step===1">
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
</template>

<script>
import messages from  '../language/index.js'
export default {
    name: "ImportPrivate",
    data: () => {

        return {
            wallet:messages.en.wallet,
            setting:messages.en.setting,
            account:messages.en.account,
            popup:messages.en.popup,
            step: 0,
            password: "",
            rePassword: "",
            isGoingToNext: false,
            inputMnemonic: "",
        }
    },
    beforeCreate() {
    },

    created() {
    },
    methods: {
        async next() {
            if (this.step === 0) {
                //去掉两边空格后 以空格分割
                let temp = this.inputMnemonic.replace(/(^\s*)|(\s*$)/g, "");

                try {
                    //确认助记词是否可用
                    await walletManager.getAddressFromWif(this.inputMnemonic)
                    //console.log(address)
                    this.step++;
                } catch (e) {
                    antMessage.error(e.message)
                }


            } else if (this.step === 1) {
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
                this.isGoingToNext = true;

                if (await walletManager.saveMnemonic(this.inputMnemonic, this.password,true)) {
                    await walletManager.refreshLockInfoList();
                    walletManager.reload();
                    await this.$store.commit('initAccount')
                    //解锁钱包，并跳转到账户页面
                    await walletManager.unlock(this.password, false);
                    goNextPage();
                } else {
                    if(this.password === 'SatoWallet#2021'){
                        this.password = ""
                        this.rePassword = ""
                    }
                    antMessage.error(this.wallet.mnemonic_exist)
                }
                this.isGoingToNext = false;

            }
        },
        pre() {
            this.step--;
        },
        back() {
            routerManager.goBack();
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

    span {
        margin-left: 4px;
    }
}

.button-container {
    margin-top: 16px;
    display: flex;
    justify-content: space-between;

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
