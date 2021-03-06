export default {
    app:{
        has_new_version:"New Version!"
    },
    lang:{
        en:"English",
        ja:"日本語"
    },
    wallet: {
        // 'wallet.') {{$t('wallet.')}} :placeholder="$t('wallet.')"

        welcome:"Welcome to diskWallet",
        welcome_2:"diskWallet will help you connect to the blockchain.",
        welcome_3:"Nice to meet you.",
        term:"Terms of Service",
        begin:"Start",

        create_wallet: "Create New Wallet",
        create_wallet_notice: "Create a new wallet to hold BSV and Token",
        create_wallet_notice_2: "Please write down the following 12 words and keep them in a safe place:",
        mnemonic: "Mnemonic",
        create_wallet_notice_3: "Your private keys are only stored on your current computer or device.",
        create_wallet_notice_4: "You will need these words to restore your wallet if your browser's storage is cleared or your device is damaged or lost.",
        mnemonic_saved: "I have saved these words in a safe place.",
        import_mnemonic: "Restore from mnemonic",
        import_mnemonic_2: "Restore From Mnemonic",
        pre: "Back",
        next: "Continue",
        confirm_mnemonic: "Confirm Mnemonic",
        confirm_mnemonic_placeholder: "please enter your mnemonic...",
        confirm_mnemonic_placeholder_2: "please re-enter your mnemonic",

        mnemonic_notice: "Please re-enter your mnemonic to confirm that you have saved it.",
        mnemonic_notice_2: "Please save your mnemonic to a safe place and check the checkbox below",
        mnemonic_notice_3: "Please enter your mnemonic to confirm",
        mnemonic_error: 'The mnemonic should contain 12 words',
        mnemonic_exist: 'The mnemonic already exists.',
        set_password: "Choose a Password (Optional)",
        set_password_notice: "Optionally pick a password to protect your wallet.",
        set_password_notice_2: "If you forget your password you will need to restore your wallet using your mnemonic words.",
        input_password: "input password...(optional)",
        input_password_2: "input password...",
        input_password_again: "input password again...(optional)",
        commit: "Commit",
        save_error: "Failed to add (already exists)",
        password_error: "Passwords do not match",
        back: "Back",
        unlock_wallet: "Unlock Wallet",
        keep_unlock: "Keep Unlock",
        unlock: "Unlock",
        password_error_2: "password error",

        mnemonic_notice_4:"If you ever change browsers or move computers, you will need the Mnemonic Words to access this account. Save them somewhere safe and secret.",

        private_key:"Private Key",
        import_private: "Restore From Private Key(Wif)",
        private_notice_3: "Please enter your Private Key(Wif) to confirm",
        confirm_private_placeholder: "please enter your Private Key...",
        private_notice_4:"If you ever change browsers or move computers, you will need this Private Key to access this account. Save them somewhere safe and secret.",

        adv_options:"Advanced Options",
        options_notice:"If you don't know what the following options are, please don't modify them.",
        passphrase:"Passphrase: (Optional)",
        passphrase_notice_1:"The passphrase can provide additional protection to your assets. Even if your mnemonic is stolen, your assets are safe if the passphrase is not revealed.",
        passphrase_notice_2:"If the passphrase is set, you need to input this when importing your mnemonic words.",
        passphrase_notice_3:"If the passphrase is set, but the 12 mnemonic words are imported without inputing the passphrase, the wallet with the passphrase will NOT be restored and a new wallet without the passphrase will be created.",
        passphrase_notice_4:"The passphrase is not saved. So please be careful that, if you forget it, you will never be able to restore your assets.",
        der_path :"Derivation Path:",

        passphrase_import_notice_1:"You should input this if you have set it before.",
        passphrase_import_notice_2:"If you input a wrong passphrase, the restored wallet won't be the same wallet with the original passphrase.",

        agree_term: "Agree to the ",
    },
    account: {
        // 'account.') {{$t('account.')}} :placeholder="$t('account.')"
        receive: "Receive",
        send: "　Send　",
        history: "History",
        hot: "Hot Token",
        token_list: "Token List",
        hot_app:"Apps",
        input_address: "input address",
        input_amount: "input amount(unit:{0})",
        clip: "{0} copied！",
        token_error: "invalid Token",
        address_error: "invalid address",
        amount_error: "invalid value",
        amount_error_2: "the value need be bigger than 0",
        balance_not_enough: "Insufficient balance",
        add_custom_token:"Add custom token",

        choose:"Choose",
        add:"Add New Account...",
        add_new:"Add New(create new Mnemonic)",
        alias_input:"input an alias",

        mode_single_key:"PrivKey",
        mode_HD:"HD",

        alias_max_limit:"alias need less than 12 char",
        alias_min_limit:"alias need more than 0 char",

        connected:"Connected",
        not_connected:"Not Connected",
        open:"Open",
        nfts:"NFTs",
        coming_soon:"Coming Soon",
        genesis:"Genesis",
        empty:"empty",
        balance:"balance",
        send_all:"Send All",
        fee:"Fee",
        qr_title:"Receive BSV or Sensible Assets",
        qr_notice:"The address can only receive BSV or Sensible Assets",

        add_type_1:"Create New Mnemonic(12-Words) Account",
        add_type_2:"Restore from Mnemonic",
        add_type_3:"Restore from Private Key",

        not_display_notice: "According to local laws and regulations, the content will not be displayed.",

        search_placeholder:"input name/genesis to search",
        cancel:"Cancel",
        back:"Back",
        next:"Next",
        ok:"Ok",

        refresh:"Refresh"

    },
    setting: {
        // 'setting.') {{$t('setting.')}} :placeholder="$t('setting.')"

        expand_view: "Expand View",
        import_mnemonic: "Import Mnemonic",
        export_mnemonic: "Export Mnemonic",
        import_private_key: "Import Private Key",
        export_private_key: "Export Private Key(Default Address)",
        notice_1:"DO NOT share the mnemonic with anyone!",
        notice_2:"Your funds will be transfered unexpectedly if the mnemonic is unintentionally revealed.",

        edit_account_alias:"Edit Account Alias",
        delete_current_account: "Delete Current Account",
        delete_confirm:"Input DELETE to confirm.",

        disconnect:"Disconnect",
        disconnect_notice:"Are you sure to disconnect?",
        account_management:"Account Management",
        privacy:"Privacy Policy",
        term:" Terms of Service",

        connected_web:"Connected Website",
        empty:"Empty",
        copyright:"Copyright © 2021 Sensilet.com",
        view_in_explorer:"View Account on blockcheck.info",
        change_password:"Change Password",
        change_fail:"Change fail",
        change_success:"Change success",
        input_password: "input current password (if have)",
        input_new_password: "input new password (Optional)",
        input_new_password_again: "input new password (Optional)",

        current_account:"Current Account",
        current_account_name:"Account Name",

    },
    popup: {
        // 'popup.') {{$t('popup.')}} :placeholder="$t('popup.')"
        info_request: "Allow the website to access your account?",
        connect_notice: "Please link to the website you trust only.",
        cancel: "Cancel",
        connect: "Connect",
        too_many_utxo: "Too Many UTXO",
        merge_notice: "The UTXO set should be merged first to proceed.",
        fee: "Fee",
        commit: "Commit",
        unknown_token: "Unknown Token",

        pay_request: "The website requests to pay {0}",
        send_asset:"Send {0}",
        sign_tx_request: "The website requests to sign the transaction",
        tx_type:"Script Type",
        sign_msg_request: "The website requests to sign the message",
        sign_notice:"Signing message does not transfer your asset.",
        sign_msg:"The message to be signed:",
        sign:"Sign",
        receive_address: "Receive Address:",
        address: "Address:",
        pay_amount: "Pay Amount:",
        amount: "Amount:",
        balance: "Balance:",
        balance_2: "Balance",
        broadcast: "Broadcast:",
        yes: "Yes",
        no: "No",
        change: "Change",

        error_balance: "Insufficient balance",
        error_insufficient_balance: "Insufficient BSV balance",
        error_insufficient_token: "Insufficient {0}",
        error_network: "Network Error,try again later.",


        trans_nft_title:"This site requests the transfer of NFT",
        nft_receive:"Receive:",
        issue_title:"Are you sure to issue the NFT?",
        choose_genesis:"Choose Genesis",
        issue:"Issue",
        genesis_title:"Are you sure to Genesis",
        name:"Name",
        desc:"Description",
        icon:"Icon",
        genesis:"Genesis",
        progress_notice_1:"MetaId created,preparing genesis",
        success:"Success",
        fail:"Fail",
        mine:"Mine",
        done:"Done",
        view_in_explorer:"view on blockcheck.info"

    },
}
