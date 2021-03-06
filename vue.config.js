module.exports = {
  css:{
    loaderOptions: {
      less: {
        lessOptions: {
          modifyVars: {
            'primary-color': '#527195',
            'border-radius-base':"10px",
          },
          javascriptEnabled: true,
        },
      },
    },
  },
  lintOnSave: false,
  pages: {
    popup: {
      template: 'public/browser-extension.html',
      entry: 'src/main.js',
      title: 'Popup'
    },
    uploading: {
      template: 'public/uploading.html',
      entry: 'src/uploading.js',
      title: 'Popup'
    }
  },
  configureWebpack: {
    devtool: 'source-map' //none
  },

  pluginOptions: {
    browserExtension: {
      componentOptions: {
        background: {
          entry: 'src/background/background.js'
        },
        contentScripts: {
          entries: {
            'content-script': [
              'src/content-scripts/content-script.js'
            ]
          }
        }
      }
    }
  }
}
