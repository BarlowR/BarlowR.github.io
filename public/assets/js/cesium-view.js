/**
 * Port of `_includes/cesium_view.html`. The Jekyll include inlined this whole
 * script once per map with Liquid-suffixed ids; here one script initializes
 * every `.cesium-view` div, reading its parameters from data attributes:
 *   data-gpx              URL of the GPX track to draw
 *   data-clamp-to-ground  "true" to drape the track on the terrain
 *   data-colored-track    "true" to color segments by vertical speed
 */
document.addEventListener('DOMContentLoaded', function () {
  // Your access token can be found at: https://ion.cesium.com/tokens.
  // This is the default access token from your ion account
  Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzZGY3Mzk4MS1jMmJlLTQyOGEtOWU5Yy03YmQzNGEzNmQ2ZDEiLCJpZCI6MTM2MDgwLCJpYXQiOjE2ODI3MTc1NjJ9.K4F5Qh2whPzLuaNqpZ1SXuTCyWszHHFng2ZrDOy_Rq0';

  document.querySelectorAll('.cesium-view').forEach(function (container) {
    const gpx_file = container.dataset.gpx || '';
    const clamp_to_ground = container.dataset.clampToGround === 'true';
    const colored_track = container.dataset.coloredTrack === 'true';

    const viewer = new Cesium.Viewer(container, {
      animation: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      sceneModePicker: false,
      selectionIndicator: false,
      timeline: false,
      navigationHelpButton: false,
      navigationInstructionsInitiallyVisible: false,
      baseLayerPicker: false,
      terrainProvider: Cesium.createWorldTerrain(),
      fullscreenButton: true,
      fullscreenElement: container
    });

    viewer._cesiumWidget._creditContainer.parentNode.removeChild(
      viewer._cesiumWidget._creditContainer);

    var mapBox = new Cesium.MapboxStyleImageryProvider({
      username: 'robbarlw',
      styleId: 'cmeomdqkj00c801rk9imnh8fr',
      accessToken: 'pk.eyJ1Ijoicm9iYmFybHciLCJhIjoiY2tsZWdiN2Z5M2p4MTMybnJma3RwdjN5aiJ9.2lmhrRvn2t08ly40eA5vBA'
    });

    viewer.imageryLayers.addImageryProvider(mapBox);

    // Function to parse GPX and extract trackpoints with time and elevation
    function parseGPXForVerticalSpeed(gpxText) {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(gpxText, "text/xml");
      const trackpoints = xmlDoc.getElementsByTagName('trkpt');

      const points = [];
      for (let i = 0; i < trackpoints.length; i++) {
        const trkpt = trackpoints[i];
        const lat = parseFloat(trkpt.getAttribute('lat'));
        const lon = parseFloat(trkpt.getAttribute('lon'));

        const eleElement = trkpt.getElementsByTagName('ele')[0];
        const timeElement = trkpt.getElementsByTagName('time')[0];

        // Default elevation to 0 if not available
        const elevation = eleElement ? parseFloat(eleElement.textContent) : 0;

        // Create synthetic time if not available (using index as seconds)
        const time = timeElement ? new Date(timeElement.textContent) : new Date(Date.now() + i * 1000);

        points.push({
          position: Cesium.Cartesian3.fromDegrees(lon, lat, elevation),
          elevation: elevation,
          time: time,
          longitude: lon,
          latitude: lat
        });
      }

      return points;
    }

    // Function to calculate vertical speed between points
    function calculateVerticalSpeeds(points) {
      const verticalSpeeds = [0]; // First point has no previous point, so speed = 0

      for (let i = 1; i < points.length; i++) {
        const elevationDiff = points[i].elevation - points[i - 1].elevation;
        const timeDiff = (points[i].time - points[i - 1].time) / 1000; // Convert to seconds

        if (timeDiff > 0) {
          verticalSpeeds.push(elevationDiff / timeDiff); // meters per second
        } else {
          verticalSpeeds.push(0);
        }
      }

      return verticalSpeeds;
    }

    // Function to map vertical speed to color
    function getColorFromVerticalSpeed(speed) {
      // Normalize speed to 0-1 range
      const minSpeed = -4;
      const maxSpeed = 5;

      const normalizedSpeed = (speed - minSpeed) / (maxSpeed - minSpeed);

      // Create color gradient: blue (descending) -> green (flat) -> red (ascending)
      if (normalizedSpeed < 0.5) {
        // Blue to green (descending to flat)
        const t = normalizedSpeed * 2;
        return Cesium.Color.fromBytes(0, 0, Math.round(255 * (1 - t)), 255);
      } else {
        // Green to red (flat to ascending)
        const t = (normalizedSpeed - 0.5) * 2;
        return Cesium.Color.fromBytes(Math.round(255 * t), 0, 0, 255);
      }
    }

    // Function to create colored polyline segments
    function createColoredTrack(points, verticalSpeeds, clampToGround) {
      if (points.length < 2) return;

      for (let i = 0; i < points.length - 1; i++) {
        viewer.entities.add({
          polyline: {
            positions: [points[i].position, points[i + 1].position],
            width: 4,
            material: getColorFromVerticalSpeed(verticalSpeeds[i]),
            clampToGround: clampToGround,
            classificationType: Cesium.ClassificationType.CESIUM_3D_TILE
          }
        });
      }
    }

    function createSingleColoredTrack(points, verticalSpeeds, clampToGround) {
      if (points.length < 2) return;

      for (let i = 0; i < points.length - 1; i++) {
        viewer.entities.add({
          polyline: {
            positions: [points[i].position, points[i + 1].position],
            width: 4,
            material: Cesium.Color.fromBytes(255, 0, 0, 255),
            clampToGround: clampToGround,
          }
        });
      }
    }

    if (gpx_file != "") {
      fetch(gpx_file)
        .then(response => response.text())
        .then(gpxText => {
          const points = parseGPXForVerticalSpeed(gpxText);
          const verticalSpeeds = calculateVerticalSpeeds(points);

          if (colored_track) {
            createColoredTrack(points, verticalSpeeds, clamp_to_ground);
          } else {
            createSingleColoredTrack(points, verticalSpeeds, clamp_to_ground);
          }

          // Fly to the track
          if (points.length > 0) {
            const positions = points.map(p => p.position);
            const boundingSphere = Cesium.BoundingSphere.fromPoints(positions);
            viewer.camera.flyToBoundingSphere(boundingSphere);
          }
        })
        .catch(error => {
          console.error('Error loading GPX file:', error);
        });
    } else {
      console.error('No GPX file specified');
    }
  });
});
