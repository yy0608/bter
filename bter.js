class BTER {
  constructor () {
    if (!BTER.instance) {
      this.deviceList = []
      this.bluetoothSocket = undefined
      BTER.instance = this
    }
    return BTER.instance
  }

  // 获取已配对设备信息，后续连接连接蓝牙使用，推荐在onLoad中执行
  initPrinter () {
    this.deviceList = [];
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
      this.deviceList.push(temp);
    }
    return this.deviceList
  }

  // 连接蓝牙设备，推荐在onShow或点击时执行
  connectBluetooth (dev) {
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

  // 断开蓝牙，在onHide和onBackPress执行
  closeBluetooth () {
    if (!this.bluetoothSocket) return true
    this.bluetoothSocket.close();
    return !this.bluetoothSocket.isConnected()
  }

  // 指令打印，如果缓慢，可自己实现
  printSomething (zplCode) {
    var outputStream = this.bluetoothSocket.getOutputStream();
    plus.android.importClass(outputStream);
    var arrayBuffer = plus.android.invoke(zplCode,'getBytes','gbk')
    outputStream.write(arrayBuffer);
    outputStream.flush();
  }
}
