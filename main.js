const { app, BrowserWindow, ipcMain } = require('electron');
const { Client, LocalAuth } = require('./whatsapp-web.js/index');
const log = require('electron-log');
const QRCode = require('./node-qrcode/lib/')
const { join } = require('path');

log.transports.file.resolvePathFn = () => join(app.getPath('userData'), 'logs', 'main.log');
log.info('App starting...');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile(join(__dirname, 'index.html'));

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.on('ready', () => {
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: 'myapp',
        dataPath: join(app.getPath('userData'), 'wwebjs_auth')
    })
});

ipcMain.on('get-qrcode', event => {
    client.initialize();
    client.on('qr', qr => {
        QRCode.toDataURL(qr, (err, url) => {
            if (err) {
                console.error('Error generating QR code:', err);
                log.error('Error generating QR code:', err);
            } else {
                event.reply('qr-generated', url);
            }
        });
    });
});

client.on('ready', async () => {
    const chats = await client.getChats();
    const groups = chats.filter(chat => chat.isGroup);
    log.info(
        'Groups:',
        groups.map(group => group.name)
    );
    mainWindow.webContents.send('groups', groups);
});
