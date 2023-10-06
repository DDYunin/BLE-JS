const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // Получить список устройств
  getDeviceList: (callback) => ipcRenderer.on('get-device-list', callback),
  // Ответить, что не подключаемся
  cancelBluetoothRequest: (callback) => ipcRenderer.send('cancel-bluetooth-request', callback),
  // Ответить, что подключаемся
  acceptBluetoothRequest: (device) => ipcRenderer.send('accept-bluetooth-request', device),
  // Непонятная мне шушара
  bluetoothPairingRequest: (callback) => ipcRenderer.on('bluetooth-pairing-request', callback),
  bluetoothPairingResponse: (response) => ipcRenderer.send('bluetooth-pairing-response', response)
})