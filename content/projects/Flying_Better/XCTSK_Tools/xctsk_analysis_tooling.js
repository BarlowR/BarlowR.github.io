class XCTSKTurnpoint {
    constructor() {
        this.radius = 0;
        this.type = null;
        this.altSmoothed = 0;
        this.description = "";
        this.lat = 0;
        this.lon = 0;
        this.name = "";
        this.order = 0;
    }
    
    loadFromDict(turnpointDict, order) {
        this.order = order;
        this.radius = turnpointDict.radius;
        
        if (turnpointDict.type) {
            this.type = turnpointDict.type;
        }
        
        const waypoint = turnpointDict.waypoint;
        this.altSmoothed = waypoint.altSmoothed;
        this.description = waypoint.description;
        this.lat = waypoint.lat;
        this.lon = waypoint.lon;
        this.name = waypoint.name;
    }
    
    generateName() {
        if (this.type) {
            return `${this.type}, ${this.name}`;
        } else {
            return `TP${this.order}, ${this.name}`;
        }
    }
}

class XCTSK {
    constructor() {
        this.earthModel = "";
        this.goal = {};
        this.sss = {};
        this.taskType = "";
        this.turnpoints = [];
    }
    
    ingestXCTSK(fileContent) {
        try {
            const xcTask = JSON.parse(fileContent);
            
            // Store task metadata (currently unused but available)
            this.earthModel = xcTask.earthModel || "";
            this.goal = xcTask.goal || {};
            this.sss = xcTask.sss || {};
            this.taskType = xcTask.taskType || "";
            
            // Load turnpoints
            this.turnpoints = [];
            xcTask.turnpoints.forEach((tp, index) => {
                const turnpoint = new XCTSKTurnpoint();
                turnpoint.loadFromDict(tp, index);
                this.turnpoints.push(turnpoint);
            });
            
            return true;
        } catch (error) {
            console.error('Error parsing XCTSK file:', error);
            return false;
        }
    }
    
    createPolycircle(lat, lon, radius, vertices = 36) {
        // Create a polygon approximation of a circle
        const coordinates = [];
        const earthRadius = 6371000; // Earth's radius in meters
        
        for (let i = 0; i < vertices; i++) {
            const angle = (2 * Math.PI * i) / vertices;
            
            // Calculate offset in degrees
            const deltaLat = (radius * Math.cos(angle)) / earthRadius * (180 / Math.PI);
            const deltaLon = (radius * Math.sin(angle)) / (earthRadius * Math.cos(lat * Math.PI / 180)) * (180 / Math.PI);
            
            const pointLat = lat + deltaLat;
            const pointLon = lon + deltaLon;
            
            coordinates.push(`${pointLon},${pointLat},0`);
        }
        
        // Close the polygon by adding the first point again
        if (coordinates.length > 0) {
            coordinates.push(coordinates[0]);
        }
        
        return coordinates.join(' ');
    }
    
    exportToKML(taskName) {
        const kmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document>
<name>${taskName}</name>`;
        
        const kmlFooter = `</Document>
</kml>`;
        
        let kmlContent = '';
        let lastTP = { lat: null, lon: null };
        
        // Iterate over turnpoints
        this.turnpoints.forEach(turnpoint => {
            // Create polycircle coordinates
            const circleCoords = this.createPolycircle(turnpoint.lat, turnpoint.lon, turnpoint.radius);
            
            // Create polygon for the turnpoint cylinder
            kmlContent += `
<Placemark>
<name>${turnpoint.generateName()}</name>
<description>Radius: ${turnpoint.radius}m, Altitude: ${turnpoint.altSmoothed}m
${turnpoint.description}</description>
<Style>
<LineStyle>
<color>FFFFFFFF</color>
<width>2</width>
</LineStyle>
<PolyStyle>
<color>00000000</color>
</PolyStyle>
</Style>
<Polygon>
<altitudeMode>relativeToGround</altitudeMode>
<outerBoundaryIs>
<LinearRing>
<coordinates>${circleCoords}</coordinates>
</LinearRing>
</outerBoundaryIs>
</Polygon>
</Placemark>`;
            
            // Create line between turnpoint centers
            if (lastTP.lat !== null) {
                kmlContent += `
<Placemark>
<name>Course Line</name>
<Style>
<LineStyle>
<color>FFFFFFFF</color>
<width>2</width>
</LineStyle>
</Style>
<LineString>
<altitudeMode>relativeToGround</altitudeMode>
<coordinates>
${lastTP.lon},${lastTP.lat},0
${turnpoint.lon},${turnpoint.lat},0
</coordinates>
</LineString>
</Placemark>`;
            }
            
            lastTP = { lat: turnpoint.lat, lon: turnpoint.lon };
        });
        
        return kmlHeader + kmlContent + kmlFooter;
    }
    
    getTaskInfo() {
        if (this.turnpoints.length === 0) return {};
        
        // Calculate task distance (rough approximation)
        let totalDistance = 0;
        for (let i = 1; i < this.turnpoints.length; i++) {
            const prev = this.turnpoints[i - 1];
            const curr = this.turnpoints[i];
            totalDistance += this.calculateDistance(prev.lat, prev.lon, curr.lat, curr.lon);
        }
        
        return {
            taskType: this.taskType,
            turnpointCount: this.turnpoints.length,
            totalDistance: Math.round(totalDistance / 1000 * 10) / 10, // km, rounded to 1 decimal
            turnpoints: this.turnpoints.map(tp => ({
                name: tp.name,
                radius: tp.radius,
                altitude: tp.altSmoothed
            }))
        };
    }
    
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371000; // Earth's radius in meters
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}

// UI Event Handlers
let currentTask = null;

const fileInput = document.getElementById('fileInputTsk');
const processBtn = document.getElementById('processBtnTsk');

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

function handleFile(file) {
    if (!file.name.toLowerCase().endsWith('.xctsk')) {
        alert('Please select a valid .xctsk file');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            currentTask = new XCTSK();
            const success = currentTask.ingestXCTSK(e.target.result);
            
            if (success) {
                processBtn.disabled = false;
            } else {
                alert('Error parsing XCTSK file');
            }
        } catch (error) {
            alert('Error reading XCTSK file: ' + error.message);
        }
    };
    reader.readAsText(file);
}

function processFileTsk() {
    if (!currentTask) return;
    
    const fileName = fileInput.files[0].name.replace('.xctsk', '');
    const taskInfo = currentTask.getTaskInfo();
    
    const kmlContent = currentTask.exportToKML(fileName);
    const kmlBlob = new Blob([kmlContent], { type: 'application/vnd.google-earth.kml+xml' });
    const kmlURL = URL.createObjectURL(kmlBlob);
    
    document.getElementById('outputTsk').innerHTML = `
        <h2>Task Information</h2>
        <p><strong>Task Type:</strong> ${taskInfo.taskType || 'Unknown'}</p>
        <p><strong>Turnpoints:</strong> ${taskInfo.turnpointCount}</p>
        <p><strong>Estimated Distance:</strong> ${taskInfo.totalDistance} km</p>
        
        <h3>Turnpoints:</h3>
        <ul>
            ${taskInfo.turnpoints.map(tp => 
                `<li><strong>${tp.name}</strong> - Radius: ${tp.radius}m</li>`
            ).join('')}
        </ul>
        
        <p><a href="${kmlURL}" download="${fileName}.kml">Download Task KML</a></p>
        
        <p>Import this KML file into Google Earth or other mapping software to visualize the competition task with turnpoint cylinders and course lines.</p>
    `;
}
