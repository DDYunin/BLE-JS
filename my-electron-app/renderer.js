// Логика popup
const popup = document.querySelector('.devices');
const popupCloseButton = document.querySelector('.devices__close-button');
const popupWrapper = document.querySelector('.devices__wrapper');

popupCloseButton.addEventListener('click', event => {
  popup.classList.remove('devices_show');
  // Отправляю запрос в главный поток о прекращении события
  cancelRequest();
  // Сбрасываю запомненные устройства
  currentDevices = [];
  // Очищаю эти устройства
  clearDeviceList();
});

popupWrapper.addEventListener('click', event => {
  if (event.target === popupWrapper) {
    popup.classList.remove('devices_show');
    // Отправляю запрос в главный поток о прекращении события
    cancelRequest();
    // Сбрасываю запомненные устройства
    currentDevices = [];
    // Очищаю эти устройства
    clearDeviceList();
  }
});

// Очистить лист
function clearDeviceList() {
  const deviceList = document.querySelector('.devices__list');
  console.log('Число элементов 1: ', deviceList.children.length);
  while (deviceList.children.length) {
    console.log('Число элементов: ', deviceList.children.length);
    // Info: remove удаляет само звено!
    deviceList.firstElementChild.remove()
  }
}

let currentDevices = [];

// Поменять лист доступных устройств
function changeDeviceList(devices) {
  // TODO: Было бы неплохо удалять отсюда элементы, которые не появляются долгое время
  // Создаёт новое устройство
  function createListItem(device) {
    const listItem = document.createElement('li');
    listItem.classList.add('devices__list-item');
    listItem.innerHTML = device.deviceName;
    listItem.addEventListener('click', event => {
      console.log('Параметры текущего создаваемого устройства: ', device, device.deviceId)
      window.electronAPI.acceptBluetoothRequest(device);
      popup.classList.remove('devices_show');
    });
    return listItem;
  }

  // Проверить есть ли устройство в моём массиве и если нет, но добавить его
  function makeUniqueList() {
    return devices.filter(device => {
      const result = currentDevices.find(currentDevice => {
        return currentDevice.deviceName === device.deviceName && currentDevice.deviceId === device.deviceId
      });

      if (!result) {
        currentDevices.push(device);
        return true;
      }
      return false
    })
  }

  console.log('Устройства ', devices);
  const deviceList = document.querySelector('.devices__list');
  console.log('Текущий массив: ', currentDevices)
  // Добавим уникальные значения
  makeUniqueList().forEach(currentDevice => {
    deviceList.append(createListItem(currentDevice));
  });
}


async function testIt () {
  window.electronAPI.getDeviceList((event, deviceList) => {
    // console.log(deviceList);
    changeDeviceList(deviceList);
  });
  // Показываем модалку
  popup.classList.add('devices_show');
  console.log('Осуществляю поиск устройсва');
  const device = await navigator.bluetooth.requestDevice({
    acceptAllDevices: true
  })
  console.log('Устройство найдено!');
  document.getElementById('device-name').innerHTML = device.name || `ID: ${device.id}`
}

document.getElementById('clickme').addEventListener('click', testIt)

// Отправить ответ, что не выбрано устройство
function cancelRequest() {
  window.electronAPI.cancelBluetoothRequest()
}

document.getElementById('cancel').addEventListener('click', cancelRequest)

window.electronAPI.bluetoothPairingRequest((event, details) => {
  const response = {}

  switch (details.pairingKind) {
    case 'confirm': {
      response.confirmed = window.confirm(`Do you want to connect to device ${details.deviceId}?`)
      break
    }
    case 'confirmPin': {
      response.confirmed = window.confirm(`Does the pin ${details.pin} match the pin displayed on device ${details.deviceId}?`)
      break
    }
    case 'providePin': {
      const pin = window.prompt(`Please provide a pin for ${details.deviceId}.`)
      if (pin) {
        response.pin = pin
        response.confirmed = true
      } else {
        response.confirmed = false
      }
    }
  }

  window.electronAPI.bluetoothPairingResponse(response)
})