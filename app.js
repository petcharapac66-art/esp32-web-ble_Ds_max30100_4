const serviceUUID = '19b10000-e8f2-537e-4f6c-d104768a1214';
const hrUUID      = '19b10001-e8f2-537e-4f6c-d104768a1214';
const spo2UUID    = '19b10002-e8f2-537e-4f6c-d104768a1214';
const rUUID       = '19b10003-e8f2-537e-4f6c-d104768a1214';

let hrChart, spo2Chart;
let hrData = [];
let spo2Data = [];
let labels = [];

async function connectBLE() {
  const device = await navigator.bluetooth.requestDevice({
    filters: [{ name: 'ESP32_MAX30100' }],
    optionalServices: [serviceUUID]
  });

  const server = await device.gatt.connect();
  const service = await server.getPrimaryService(serviceUUID);

  const hrChar   = await service.getCharacteristic(hrUUID);
  const spo2Char = await service.getCharacteristic(spo2UUID);
  const rChar    = await service.getCharacteristic(rUUID);

  await hrChar.startNotifications();
  await spo2Char.startNotifications();
  await rChar.startNotifications();

  hrChar.addEventListener('characteristicvaluechanged', e => {
    const value = parseFloat(new TextDecoder().decode(e.target.value));
    document.getElementById('hr').innerText = value;
    updateHRChart(value);
  });

  spo2Char.addEventListener('characteristicvaluechanged', e => {
    const value = parseFloat(new TextDecoder().decode(e.target.value));
    document.getElementById('spo2').innerText = value;
    updateSpO2Chart(value);
  });

  rChar.addEventListener('characteristicvaluechanged', e => {
    document.getElementById('r').innerText =
      new TextDecoder().decode(e.target.value);
  });

  initCharts();
}

/* ================= CHART ================= */
function initCharts() {
  const hrCtx = document.getElementById('hrChart');
  hrChart = new Chart(hrCtx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Heart Rate (bpm)',
        data: hrData,
        borderWidth: 2
      }]
    }
  });

  const spo2Ctx = document.getElementById('spo2Chart');
  spo2Chart = new Chart(spo2Ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'SpO₂ (%)',
        data: spo2Data,
        borderWidth: 2
      }]
    }
  });
}

function updateHRChart(value) {
  labels.push('');
  hrData.push(value);

  if (hrData.length > 20) {
    labels.shift();
    hrData.shift();
  }
  hrChart.update();
}

function updateSpO2Chart(value) {
  spo2Data.push(value);

  if (spo2Data.length > 20) {
    spo2Data.shift();
  }
  spo2Chart.update();
}
