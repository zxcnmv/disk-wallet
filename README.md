# disk-wallet

## Project setup
```
npm install
```
After `npm install` move 3x files from `config_files` folder:

  1. `index.js` to `node_modules`->`vue-cli-plugin-browser-extension`
  2. `manifest.js` to `node_modules`->`vue-cli-plugin-browser-extension`->`lib`
  3. `webpack-extension-reloader.js` to `node_modules`->`vue-cli-plugin-browser-extension`->`lib`


### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### 主要更新

 1. 升级sensilet适配google插件V3版本
 2. 针对gooogle插件V3版本进行代码的调整
 3. 增加签名授权控制

