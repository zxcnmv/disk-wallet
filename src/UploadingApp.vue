<template>
    <div class="top">
        uploading
    </div>

</template>
<script>

const urlParams = new URLSearchParams(window.location.hash.slice(1));
const origin = urlParams.get('origin');
const request = JSON.parse(urlParams.get('request'));

import txUtils from "./utils/txUtils"
const storageUtils = require('./utils/storageUtils')
export default {
    components: {        
    },
    data() {
        return {
            txHex: request.params.txHex,
            inputInfos: request.params.inputInfos,
        }
    },
    computed: {
        
    },
    watch:{
    },
    beforeCreate() {

    },


    beforeMount() {
        

    },
    mounted() {
        //console.log('mountd',this.txHex)
        //获取当前激活的网站链接
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            const [activeTab] = tabs;
            const {id, title, url} = activeTab;
            const {origin, protocol} = url ? new URL(url) : {};

            ///console.log('active tab ' + origin)
        });
        if(this.txHex && this.inputInfos){

            this.commit()
        }
        
    },
    methods: {
        
        async commit() {
            try {
                //console.log('auto uploading')
                let windowInfo = await chrome.windows.getCurrent()
                //console.log('windowInfo',windowInfo)
                let data = await txUtils.signTransaction(this.txHex, this.inputInfos)
                //console.log('---commit---',data)
                chrome.runtime.sendMessage({
                    channel: 'sato_extension_background_channel_disk',
                    data: {
                        id: request.id,
                        result: "success",
                        data
                    },
                });
                //window.close();
            } catch (e) {
                console.error(e)
            } finally {
            }
        }
    }
}

</script>

<style lang="scss">
@import "./style/color";

body {
    margin: 0;
    min-width: 375px;
    height: 600px;
    min-height: 600px;
    font-size: 14px;

    &::-webkit-scrollbar {
        display: none;
    }

    //background-color: whitesmoke;

    @media(min-width: 376px) {
        min-height: 100vh;
    }
    /*@media(max-width: 374px) {*/
    /*    min-width: 325px;*/

    /*}*/
}


#app {
    height: 100%;
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
}

</style>
