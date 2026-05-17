import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

type LatLon = { latitude: number; longitude: number };

type Props = {
  userPosition: LatLon;
  targetPosition: LatLon;
};

function buildHtml(user: LatLon, target: LatLon): string {
  const centerLat = (user.latitude + target.latitude) / 2;
  const centerLon = (user.longitude + target.longitude) / 2;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; }
  </style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
  var map = L.map('map', { zoomControl: false, attributionControl: false })
    .setView([${centerLat}, ${centerLon}], 17);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 20
  }).addTo(map);

  var userIcon = L.divIcon({
    className: '',
    html: '<div style="width:16px;height:16px;border-radius:50%;background:#1A1D6E;border:3px solid white;box-shadow:0 0 6px rgba(0,0,0,0.4)"></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });

  var carIcon = L.divIcon({
    className: '',
    html: '<div style="width:28px;height:28px;border-radius:50%;background:#1A1D6E;border:3px solid white;box-shadow:0 0 8px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;font-size:14px;line-height:28px;text-align:center">P</div>',
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });

  var userMarker = L.marker([${user.latitude}, ${user.longitude}], { icon: userIcon }).addTo(map);
  var carMarker  = L.marker([${target.latitude}, ${target.longitude}], { icon: carIcon }).addTo(map);

  var line = L.polyline(
    [[${user.latitude}, ${user.longitude}], [${target.latitude}, ${target.longitude}]],
    { color: '#1A1D6E', weight: 3, dashArray: '8 6', opacity: 0.7 }
  ).addTo(map);

  map.fitBounds(line.getBounds(), { padding: [40, 40] });

  // Listen for position updates from React Native
  document.addEventListener('message', handleMsg);
  window.addEventListener('message', handleMsg);

  function handleMsg(e) {
    try {
      var data = JSON.parse(e.data);
      if (data.type === 'updateUser') {
        var latlng = [data.lat, data.lon];
        userMarker.setLatLng(latlng);
        line.setLatLngs([latlng, [${target.latitude}, ${target.longitude}]]);
      }
    } catch (_) {}
  }
</script>
</body>
</html>
  `.trim();
}

export default function ParkingMapView({ userPosition, targetPosition }: Props) {
  const webViewRef = useRef<WebView>(null);
  const htmlRef = useRef(buildHtml(userPosition, targetPosition));

  // Push live user position updates without reloading the WebView
  useEffect(() => {
    const msg = JSON.stringify({
      type: 'updateUser',
      lat: userPosition.latitude,
      lon: userPosition.longitude,
    });
    webViewRef.current?.injectJavaScript(`
      window.dispatchEvent(new MessageEvent('message', { data: ${JSON.stringify(msg)} }));
      true;
    `);
  }, [userPosition.latitude, userPosition.longitude]);

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: htmlRef.current }}
        style={styles.map}
        scrollEnabled={false}
        originWhitelist={['*']}
        javaScriptEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
});
