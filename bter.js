// 实现Java的getBytes
const strToUtf8Bytes = str => {
  const utf8 = [];
  for (let ii = 0; ii < str.length; ii++) {
    let charCode = str.charCodeAt(ii);
    if (charCode < 0x80) utf8.push(charCode);
    else if (charCode < 0x800) {
      utf8.push(0xc0 | (charCode >> 6), 0x80 | (charCode & 0x3f));
    } else if (charCode < 0xd800 || charCode >= 0xe000) {
      utf8.push(0xe0 | (charCode >> 12), 0x80 | ((charCode >> 6) & 0x3f), 0x80 | (charCode & 0x3f));
    } else {
      ii++;
      charCode = 0x10000 + (((charCode & 0x3ff) << 10) | (str.charCodeAt(ii) & 0x3ff));
      utf8.push(
        0xf0 | (charCode >> 18),
        0x80 | ((charCode >> 12) & 0x3f),
        0x80 | ((charCode >> 6) & 0x3f),
        0x80 | (charCode & 0x3f),
      );
    }
  }
  // 兼容汉字，ASCII码表最大的值为127，大于127的值为特殊字符
  for(let jj=0;jj<utf8.length;jj++){
	  var code = utf8[jj];
	  if(code>127){
		  utf8[jj] = code - 256;
	  }
  }
  return utf8;
}

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

  // 指令打印，默认使用安卓的getBytes，但在uniapp中要7s，需要自己实现
  printSomething (zplCode) {
    var outputStream = this.bluetoothSocket.getOutputStream();
    plus.android.importClass(outputStream);
    let arrayBuffer
    try {
      arrayBuffer = strToUtf8Bytes(zplCode)
      if (arrayBuffer == '' || (Object.prototype.toString.call(arrayBuffer) === '[object Array]' && arrayBuffer.length === 0)) {
        arrayBuffer = plus.android.invoke(zplCode,'getBytes','gbk')
      }
    } catch {
      arrayBuffer = plus.android.invoke(zplCode,'getBytes','gbk')
    }
    outputStream.write(arrayBuffer);
    outputStream.flush();
  }
}
