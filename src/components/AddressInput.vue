<template>
    <div class="address-input">
        <div class="input-container" :class="{'has-error':inputErrorNotice!==''}">
            <a-input ref="addressInputEle" v-model:value="transAddress" @change="addressChange" :placeholder="account.input_address"/>
            <div class="notice">{{ inputErrorNotice }}</div>
        </div>
        <div class="address-history" v-if="list && list.length>0">
            <div class="info">
                <div class="title">Recents</div>
                <DeleteOutlined class="icon" @click="clearRecent"/>
            </div>
            <div class="address-list">
                <div class="address" v-for="item in list" :key="item" @click="choose(item.address)">
                    {{ item.address }}
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import DeleteOutlined from '@ant-design/icons-vue/lib/icons/DeleteOutlined'
import {nextTick} from "vue";
import messages from  '../language/index.js'

export default {
    name: "AddressInput",
    components: {
        DeleteOutlined,
    },
    emits: [
        "next", "update:bindAddress"
    ],
    props: {
        bindAddress: String,
        transType: String,
    },

    data() {
        return {
            account:messages.en.account,
            transAddress: "",
            list: null,
            inputErrorNotice: "",
            rules: {
                transAddress: [{
                    'required': true, trigger: 'change',
                    validator: async (rule, value) => {
                        // console.log(value, '#')
                        if (value === '') {
                            return Promise.reject('Please input the Address');
                        } else {
                            if (!walletManager.checkBsvAddress(value)) {
                                return Promise.reject('Invalid Address');
                            }
                            return Promise.resolve();
                        }
                    }
                }]
            }
        };
    },
    async mounted() {
        let _list = await localManager.getRecentAddress()
        if(_list){
            this.list = _list.slice(0, 5)
        }
    },

    methods: {
        addressChange() {
            this.$emit('update:bindAddress', this.transAddress)
            if (this.transAddress === '') {
                this.inputErrorNotice = 'Please input the Address';
            } else {
                if (!walletManager.checkBsvAddress(this.transAddress)) {
                    this.inputErrorNotice = 'Invalid Address';
                } else
                    this.inputErrorNotice = '';
            }
        },
        choose(address) {
            this.transAddress = address;
            this.addressChange();
        },
        reset() {
            this.transAddress = "";
        },
        async clearRecent() {
            await localManager.clearRecentAddress();
            this.list = await localManager.getRecentAddress()
        },
        async onOk() {
            //检查信息
            if (!walletManager.checkBsvAddress(this.transAddress)) {
                return antMessage.error(this.account.address_error)
            }

            await localManager.addRecentAddress(this.transAddress, this.transType)
            this.$emit('next', this.transAddress);

        },
        async focusInput() {
            if (this.$refs.addressInputEle)
                this.$refs.addressInputEle.focus();
        }
    }
}
</script>

<style scoped lang="scss">
.address-input {
    margin-top: 16px;
}

.address-history {
    .info {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 16px;

        .title {
            text-align: left;
            font-size: 16px;
        }

        .icon {
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;

            &:hover {
                background-color: #eee;
            }
        }
    }

    .address-list {
        .address {
            font-size: 12px;
            padding: 8px 16px;
            border-bottom: 1px solid #eee;

            &:hover {
                border-radius: 10px;
                background-color: #eee;
            }
        }
    }

}
</style>
