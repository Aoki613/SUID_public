// script.js

// 地図を初期化（仮の位置：日本中心付近）
const map = L.map('map').setView([35.6895, 139.6917], 13);

// タイルレイヤー (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// マーカーをまとめるクラスタグループ
const markers = L.markerClusterGroup();
map.addLayer(markers);

// 現在地表示用のマーカー（最初は未定義）
let currentMarker = null;

// 現在地をリアルタイム追跡
map.locate({ setView: true, watch: true, maxZoom: 16 });

// 現在地更新イベント
map.on('locationfound', function (e) {
  const latlng = e.latlng;
  const radius = e.accuracy;

  // すでにマーカーがある場合は位置を更新
  if (currentMarker) {
    currentMarker.setLatLng(latlng);
  } else {
    // 初回のみ作成
    currentMarker = L.marker(latlng)
      .addTo(map)
      .bindPopup("あなたの現在地")
      .openPopup();
  }
});

// 現在地取得エラー時
map.on('locationerror', function () {
  alert('位置情報が取得できませんでした。ブラウザの設定を確認してください。');
});

/*後で消す
// サンプルマーカー
const samplePoints = [
  { lat: 35.6895, lng: 139.6917, title: '東京 (サンプル)' },
  { lat: 35.6764, lng: 139.6993, title: '渋谷近辺 (サンプル)' },
  { lat: 35.7100, lng: 139.8107, title: '浅草 (サンプル)' }
];

samplePoints.forEach(p => {
  const m = L.marker([p.lat, p.lng]).bindPopup(`<strong>${p.title}</strong>`);
  markers.addLayer(m);
});

*/

// 「現在地を中心に」ボタン
document.getElementById('locateBtn').addEventListener('click', () => {
  map.locate({ setView: true, maxZoom: 16 });
});

/*

// 「地図中央にマーカーを追加」ボタン
document.getElementById('addMarkerBtn').addEventListener('click', () => {
  const center = map.getCenter();
  const m = L.marker(center).bindPopup('ここに追加されました').openPopup();
  markers.addLayer(m);
});

*/

// クリックでマーカー追加
map.on('click', function (e) {
  const m = L.marker(e.latlng).bindPopup(`クリック位置: ${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`);
  markers.addLayer(m);
});

// Geocoder 機能（検索）
if (L.Control.Geocoder) {
  const geocoder = L.Control.geocoder({ defaultMarkGeocode: false })
    .on('markgeocode', function (e) {
      const bbox = e.geocode.bbox;
      const poly = L.polygon([
        bbox.getSouthEast(), bbox.getNorthEast(), bbox.getNorthWest(), bbox.getSouthWest()
      ]).addTo(map);
      map.fitBounds(poly.getBounds());
      const m = L.marker(e.geocode.center).bindPopup(e.geocode.name).addTo(map);
      markers.addLayer(m);
    })
    .addTo(map);
}

// 緯度経度を表示するコントロール
const coordDiv = L.control({ position: 'bottomleft' });
coordDiv.onAdd = function () {
  this._div = L.DomUtil.create('div', 'coord-display');
  this.update();
  return this._div;
};
coordDiv.update = function (latlng) {
  this._div.innerHTML = latlng
    ? `Lat: ${latlng.lat.toFixed(5)}<br>Lng: ${latlng.lng.toFixed(5)}`
    : 'マウスを動かしてください';
};
coordDiv.addTo(map);
map.on('mousemove', e => coordDiv.update(e.latlng));
