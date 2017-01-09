const electron = require('electron')

const { app, BrowserWindow, autoUpdater, Menu, Tray, ipcMain, dialog } = require('electron')
if (require('electron-squirrel-startup')) app.quit();

const request = require('request')
const path = require('path')
const url = require('url')
const os = require('os')
const { _extend } = require('util')
const fs = require('fs')

//const {version} = require('package.json')

settingFilePath = path.join(app.getPath('appData'), "url_setting.txt")

let windows = []
let getFileUrl

app.on('ready', () => {

    if (fs.existsSync(settingFilePath)) {
        fs.readFile(settingFilePath, 'utf8', function(err, data) {
            if (err) throw err;
            console.log('OK: ' + settingFilePath);
            console.log(data);
            getFileUrl = data;
            mainProcess();
        });

    } else {
        mainProcess();
    }
})

function mainProcess() {

    //const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize

    let mainWin = new BrowserWindow({
        width: 860,
        height: 480
    })

    mainWin.loadURL(url.format({
        pathname: path.join(__dirname, "index.html"),
        protocol: 'file:',
        slashes: true
    }))

    mainWin.webContents.on('did-finish-load', () => {
        if (getFileUrl) {
            mainWin.webContents.send('url', getFileUrl)
        }
    })

    ipcMain.on('save url', (event, arg) => {
        fs.writeFile(settingFilePath, arg, function(err) {
            if (err) throw err;
        })
    })


    mainWin.on('close', (event) => {
//       event.preventDefault()
        mainWin = null;
        app.quit();
    })

}




app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (windows['main'] === null) {
        mainProcess()
    }

})
