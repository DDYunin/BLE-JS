const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

let bluetoothPinCallback
let selectBluetoothCallback



function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      defaultEncoding: 'UTF-8', // Установите кодировку окна
    }
  })

  // В данном случае callback служит для поключения (вызывается каждый раз, когда найдено новое устройство)
  mainWindow.webContents.on('select-bluetooth-device', (event, deviceList, callback) => {
    console.log('Event select-bluetooth-device was triggered: ', event, deviceList);
    event.preventDefault()
    mainWindow.webContents.send("get-device-list", deviceList);
    console.log("Bluetooth device list dispatched.");
    selectBluetoothCallback = callback
    // const result = deviceList.find((device) => {
    //   return device.deviceName === 'DAN_MY_ESP32'
    // })
    // if (result) {
    //   callback(result.deviceId)
    // } else {
    //   // The device wasn't found so we need to either wait longer (eg until the
    //   // device is turned on) or until the user cancels the request
    // }
  });

    //cancels Discovery
    ipcMain.on('cancel-bluetooth-request', _ => {
      selectBluetoothCallback(''); //reference to callback of win.webContents.on('select-bluetooth-device'...)
      console.log("Discovery cancelled");
    });

    //resolves navigator.bluetooth.requestDevice() and stops device discovery
    ipcMain.on('accept-bluetooth-request', (event, device) => {
      console.log('\n\n\nLet is go: ', device, '\n\n\n');
      selectBluetoothCallback(device.deviceId); //reference to callback of win.webContents.on('select-bluetooth-device'...)
      console.log("Device selected, discovery finished");
    })

  // ipcMain.on('cancel-bluetooth-request', (event) => {
  //   selectBluetoothCallback('')
  // })

  // // Listen for a message from the renderer to get the response for the Bluetooth pairing.
  // ipcMain.on('accept-bluetooth-request', (event, ) => {
  //   selectBluetoothCallback(response)
  // })

  mainWindow.webContents.session.setBluetoothPairingHandler((details, callback) => {
    bluetoothPinCallback = callback
    // Send a message to the renderer to prompt the user to confirm the pairing.
    mainWindow.webContents.send('bluetooth-pairing-request', details)
  })

  mainWindow.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})