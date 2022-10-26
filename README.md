# 安卓设备经典蓝牙指令打印

### 设计

- 一、使用经典蓝牙的指令打印（打印机支持不同指令，安卓设备不受限制）
- 二、进入页面获取已配对设备，只有1个设备自动连接，多个设备点击连接
- 三、熄屏或退出页面断开蓝牙连接（如果多个页面，需要全局存储配对设备）

---

### 环境

- uniapp vue2 JS，（安卓设备的JS执行，不限于uniapp，写法有所差异）

---

### 实现

- 1. 获取已配对设备，在onLoad中执行

```
function initPrinter () {
  var deviceList = [];
  var main = plus.android.runtimeMainActivity();
  var Context = plus.android.importClass("android.content.Context");
  var BManager = main.getSystemService(Context.BLUETOOTH_SERVICE);
  plus.android.importClass(BManager); 
  var BAdapter = BManager.getAdapter();
  plus.android.importClass(BAdapter); 
  var lists = BAdapter.getBondedDevices();
  plus.android.importClass(lists);
  var iterator = lists.iterator();
  plus.android.importClass(iterator);
  while (iterator.hasNext()) {
    var d = iterator.next();
    plus.android.importClass(d);
    var temp = {
      name: d.getName(),
      address: d.getAddress(),
      status: d.getBondState(),
      uuids: d.getUuids(),
      op: d
    };
    deviceList.push(temp);
  }
  return deviceList;
}
```

- 2. 连接蓝牙设备，在onShow或点击时执行

```
function connectBluetooth (dev) {
  var main = plus.android.runtimeMainActivity();
  var BluetoothAdapter = plus.android.importClass("android.bluetooth.BluetoothAdapter");
  var UUID = plus.android.importClass("java.util.UUID");
  var uuid = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");
  var BAdapter = BluetoothAdapter.getDefaultAdapter();
  var device = BAdapter.getRemoteDevice(dev.address);
  plus.android.importClass(device);
  this.bluetoothSocket = device.createInsecureRfcommSocketToServiceRecord(uuid);
  plus.android.importClass(this.bluetoothSocket);
  this.bluetoothSocket.connect()
  return this.bluetoothSocket.isConnected()
}
```

- 3. 指令打印，如果缓慢，可联系我vx youyi4474

```
function printSomething (zplCode) {
  var outputStream = this.bluetoothSocket.getOutputStream();
  plus.android.importClass(outputStream);
  var arrayBuffer = plus.android.invoke(zplCode,'getBytes','gbk')
  outputStream.write(arrayBuffer);
  outputStream.flush();
  return arrayBuffer
}
```

- 4. 断开蓝牙，在onHide和onBackPress执行

```
closeBluetooth () {
  if (!this.bluetoothSocket) return true
  this.bluetoothSocket.close();
  return !this.bluetoothSocket.isConnected()
}
```
