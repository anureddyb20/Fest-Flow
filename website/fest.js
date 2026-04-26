// AUTH SYSTEM
let currentLoginRole = 'admin';

function checkAuth() {
    const user = JSON.parse(localStorage.getItem('festflow_user'));
    const overlay = document.getElementById('loginOverlay');
    const adminDash = document.getElementById('adminDashboard');
    const partnerDash = document.getElementById('partnerDashboard');

    const canvas = document.getElementById('particlesCanvas');
    if (canvas) {
        // Low opacity on dashboard, High opacity on login screen
        canvas.style.opacity = user ? '0.15' : '1';
        // Bring canvas to front if on login screen? No, keep it back, but visible through overlay.
    }

    if (user) {
        overlay.style.display = 'none'; // Hide login if authenticated

        // ROLE BASED VIEW
        if (user.role === 'admin') {
            adminDash.style.display = 'flex';
            partnerDash.style.display = 'none';
        } else {
            adminDash.style.display = 'none';
            partnerDash.style.display = 'flex';
            // Always open partner view in mobile view by default
            partnerDash.classList.add('mobile-view');
            // Update toggle button icon to reflect mobile state (phone icon -> monitor icon to switch back)
            const btn = document.getElementById('viewToggleBtn');
            if (btn) btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>';
        }

    } else {
        overlay.style.display = 'flex'; // Show login
        adminDash.style.display = 'none'; // Hide content behind
        partnerDash.style.display = 'none';
    }
}

function setLoginRole(role) {
    currentLoginRole = role;
    document.getElementById('roleAdmin').classList.toggle('active', role === 'admin');
    document.getElementById('rolePartner').classList.toggle('active', role === 'partner');
    document.getElementById('loginUser').value = '';
    document.getElementById('loginPass').value = '';
    document.getElementById('loginError').textContent = '';
}

function togglePasswordVisibility() {
    const passInput = document.getElementById('loginPass');
    const eyeIcon = document.getElementById('eyeIcon');
    const eyeOffIcon = document.getElementById('eyeOffIcon');

    if (passInput.type === 'password') {
        passInput.type = 'text';
        eyeIcon.style.display = 'none';
        eyeOffIcon.style.display = 'block';
    } else {
        passInput.type = 'password';
        eyeIcon.style.display = 'block';
        eyeOffIcon.style.display = 'none';
    }
}

function handleLogin(e) {
    e.preventDefault();
    const user = document.getElementById('loginUser').value.trim();
    const pass = document.getElementById('loginPass').value.trim();
    const err = document.getElementById('loginError');

    let valid = false;
    let role = null;

    // Auto-detect role from credentials
    // Admin: 1 / 1
    if (user === '1' && pass === '1') {
        valid = true;
        role = 'admin';
    }
    // Partner: 2 / 2
    if (user === '2' && pass === '2') {
        valid = true;
        role = 'partner';
    }

    if (valid) {
        localStorage.setItem('festflow_user', JSON.stringify({ username: user, role: role }));
        checkAuth();
    } else {
        err.textContent = 'Invalid credentials. Try 1/1 (Admin) or 2/2 (Partner)';
    }
}

function logout() {
    localStorage.removeItem('festflow_user');
    checkAuth();
}

// Run auth check immediately
checkAuth();

// PARTICLE ANIMATION (GLOBAL)
(function () {
    const canvas = document.getElementById('particlesCanvas');
    // Ensure canvas exists (might be added dynamically or just moved)
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    /* Opacity now controlled by checkAuth */

    let width, height;
    let particles = [];
    let mouse = { x: null, y: null };

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    // Track Mouse Position
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.x;
        mouse.y = e.y;
    });
    window.addEventListener('mouseleave', () => {
        mouse.x = undefined;
        mouse.y = undefined;
    });

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 1.5; // Faster movement
            this.vy = (Math.random() - 0.5) * 1.5;
            this.size = Math.random() * 3 + 1; // Slightly larger
            this.color = `rgba(50, 184, 198, ${Math.random() * 0.5 + 0.5})`; // Brighter: 0.5 to 1.0 opacity
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off walls
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }
        draw() {
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 10; // Glow effect
            ctx.shadowColor = "rgba(50, 184, 198, 0.8)";
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0; // Reset
        }
    }

    // Create Particles
    for (let i = 0; i < 80; i++) particles.push(new Particle());

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Update & Draw Particles
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Draw Connections
        ctx.strokeStyle = 'rgba(50, 184, 198, 0.2)'; // Brighter lines
        ctx.lineWidth = 1;

        // Connect particles to each other
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }

            // Connect particles to MOUSE
            if (mouse.x) {
                const dx = particles[i].x - mouse.x;
                const dy = particles[i].y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 200) { // Interaction radius
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(50, 184, 198, ${1 - dist / 200})`; // Fade out with distance
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                    ctx.strokeStyle = 'rgba(50, 184, 198, 0.2)'; // Reset stroke style
                }
            }
        }

        requestAnimationFrame(animate);
    }
    animate();
})();

// PARTICLE ANIMATION FOR ADMIN & PARTNER DASHBOARDS
function initializeParticleAnimation(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let mouse = { x: null, y: null };

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    // Track Mouse Position
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left + window.scrollX;
        mouse.y = e.clientY - rect.top + window.scrollY;
    });
    canvas.addEventListener('mouseleave', () => {
        mouse.x = undefined;
        mouse.y = undefined;
    });

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 1.5;
            this.vy = (Math.random() - 0.5) * 1.5;
            this.size = Math.random() * 3 + 1;
            this.color = `rgba(50, 184, 198, ${Math.random() * 0.5 + 0.5})`;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }
        draw() {
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = "rgba(50, 184, 198, 0.8)";
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    // Create Particles
    for (let i = 0; i < 80; i++) particles.push(new Particle());

    function animate() {
        ctx.clearRect(0, 0, width, height);

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        ctx.strokeStyle = 'rgba(50, 184, 198, 0.2)';
        ctx.lineWidth = 1;

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }

            if (mouse.x) {
                const dx = particles[i].x - mouse.x;
                const dy = particles[i].y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 200) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(50, 184, 198, ${1 - dist / 200})`;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                    ctx.strokeStyle = 'rgba(50, 184, 198, 0.2)';
                }
            }
        }

        requestAnimationFrame(animate);
    }
    animate();
}

// Initialize animations for both dashboards
setTimeout(() => {
    initializeParticleAnimation('adminParticlesCanvas');
    initializeParticleAnimation('partnerParticlesCanvas');
}, 100);

// HEALTH DATA THRESHOLDS (UPDATED WITH FACTUAL GUIDELINES)
const HEALTH_GUIDELINES = {
    pulse: {
        normal: { min: 60, max: 100 },           // Typical resting pulse
        athletic: { min: 40, max: 60 },          // Very fit or athletic people
        warning: { min: 50, max: 120 },          // Between normal and danger
        danger_low: 50,                           // Below 50 bpm
        danger_high: 120                          // Above 120 bpm
    },
    bloodPressure: {
        normal: { systolic: { min: 90, max: 120 }, diastolic: { min: 60, max: 80 } },      // Normal/ideal
        elevated: { systolic: { min: 120, max: 130 }, diastolic: { min: 80, max: 90 } },   // Elevated
        high: { systolic: 130, diastolic: 80 }    // High/Hypertension threshold
    }
};


// DEFAULT ZONES
const DEFAULT_ZONES = [
    { name: 'Zone 1', riskLevel: 'danger' },
    { name: 'Zone 2', riskLevel: 'warning' },
    { name: 'Zone 3', riskLevel: 'neutral' },
    { name: 'Zone 4', riskLevel: 'success' }
];

// LOAD ZONES FROM STORAGE OR DEFAULT
let savedZones = localStorage.getItem('festflow_zones');
let ZONES = savedZones ? JSON.parse(savedZones) : JSON.parse(JSON.stringify(DEFAULT_ZONES));

// SAVE ZONES TO STORAGE
function saveZones() {
    localStorage.setItem('festflow_zones', JSON.stringify(ZONES));
}

// GENERATE SAMPLE DATA (100 PEOPLE)
function generatePeople() {
    let people = [];
    let id = 1;
    const locations = [
        { lat: 12.2958, lng: 76.6394, name: 'North Wing' },
        { lat: 12.2960, lng: 76.6408, name: 'NorthEast Wing' },
        { lat: 12.2958, lng: 76.6405, name: 'East Wing' },
        { lat: 12.2950, lng: 76.6408, name: 'SouthEast Wing' },
        { lat: 12.2965, lng: 76.6394, name: 'South Wing' },
        { lat: 12.2968, lng: 76.6385, name: 'SouthWest Wing' },
        { lat: 12.2970, lng: 76.6415, name: 'West Wing' },
        { lat: 12.2963, lng: 76.6385, name: 'NorthWest Wing' }
    ];

    ZONES.forEach((zone, idx) => {
        // SKIP Zone 1 (Handled by Live Fetching)
        if (zone.name === 'Zone 1') return;

        // Distribute 50 monitoring assets across the other 3 zones
        const peopleInZone = idx === 1 ? 20 : idx === 2 ? 15 : 15; 
        
        for (let i = 0; i < peopleInZone; i++) {
            let pulse, systolic, diastolic;
            const rand = Math.random();

            if (rand < 0.80) {
                // 80% Safe (Green)
                pulse = Math.floor(Math.random() * 20) + 70;    
                systolic = Math.floor(Math.random() * 15) + 115; 
                diastolic = Math.floor(Math.random() * 10) + 75;  
            } else if (rand < 0.95) {
                // 15% Warning (Yellow)
                pulse = Math.floor(Math.random() * 20) + 130; 
                systolic = Math.floor(Math.random() * 20) + 140;
                diastolic = Math.floor(Math.random() * 10) + 95;
            } else {
                // 5% Danger (Red) - This populates the Panic Buttons section
                pulse = Math.random() > 0.5 ? (Math.floor(Math.random() * 30) + 160) : (Math.floor(Math.random() * 20) + 40);
                systolic = Math.floor(Math.random() * 50) + 160;
                diastolic = Math.floor(Math.random() * 30) + 100;
            }

            const status = getHealthStatus(pulse, systolic, diastolic, zone.name);
            const location = locations[idx % locations.length];

            people.push({
                id: `SIM-${idx}-${String(i+1).padStart(3, '0')}`,
                bandId: `BAND-${String(id).padStart(4, '0')}`,
                pulse: pulse,
                systolic: systolic,
                diastolic: diastolic,
                location: { ...location },
                zone: zone.name,
                status: status,
                panicClicks: Math.random() < 0.03 ? 3 : 0, // 3% chance of panic
                timestamp: new Date().toLocaleTimeString()
            });
            id++;
        }
    });
    // Global Sort by Severity for the "All Bands" list logic (used later)
    return people;
}

// HEALTH STATUS BASED ON USER DEFINED THRESHOLDS
function getHealthStatus(pulse, systolic, diastolic, zoneName) {
    // ZONE 1 EXCEPTION: Pulse Only Logic (Ignore BP)
    if (zoneName === 'Zone 1') {
        if (pulse > 160 || pulse < 50) return 'danger';
        if (pulse >= 120 && pulse <= 160) return 'warning';
        return 'success';
    }

    // OTHER ZONES: Full Vitals Logic
    // RED (DANGER): If ANY metric exceeds upper limits OR is dangerously low
    // High: Pulse > 160, BP > 140/90
    // Low: BP < 90/60 (critical hypotension)
    if (pulse > 160 || systolic > 140 || diastolic > 90 ||
        systolic < 90 || diastolic < 60) {
        return 'danger';
    }

    // YELLOW (WARNING): Warning ranges (Elevated but not critical)
    if ((pulse >= 120 && pulse <= 160) ||
        (systolic >= 120 && systolic <= 140) ||
        (diastolic >= 80 && diastolic <= 90)) {
        return 'warning';
    }

    // GREEN (SUCCESS): All metrics are safe
    return 'success';
}

let allPeople = []; // Start empty, fetch from server
let currentZone = 'Zone 1';
let map = null;

// CONFIGURATION
// FIREBASE DATA SOURCE FOR ZONE 1 (FETCH ALL BUCKETS)
// FETCH FROM CONFIG (SUPPLIED BY config.js / .env)
const API_URL = window.CONFIG?.API_URL || 'https://festflow-38fde-default-rtdb.asia-southeast1.firebasedatabase.app/.json';

// FETCH DATA FROM FIREBASE (ZONE 1) & GEN SIMULATED (ZONES 2+)
async function fetchData() {
    let zone1Data = [];

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`Firebase Connection Failed: ${response.status} ${response.statusText}`);
        }

        const rawData = await response.json();

        // Parse Firebase Data (Handle Multiple Buckets)
        // Structure: { bucket1: { id1: {...}, id2: {...} }, bucket2: { id3: {...} } }
        // We need to flatten ALL buckets into one Zone 1 list.

        if (rawData) {
            let allEntries = [];

            // 1. Get all top-level keys
            const keys = Object.keys(rawData);

            keys.forEach(key => {
                const item = rawData[key];
                
                if (item && typeof item === 'object') {
                    // Check if this item IS an entry (has 'pulse' or 'bpm')
                    if (item.pulse !== undefined || item.bpm !== undefined || item.heart_rate !== undefined) {
                        allEntries.push(item);
                    } else {
                        // Otherwise, treat as a bucket and look inside
                        const bucketEntries = Object.values(item);
                        bucketEntries.forEach(entry => {
                            if (entry && typeof entry === 'object') {
                                allEntries.push(entry);
                            }
                        });
                    }
                }
            });


            // Map aggregated entries to our format
            zone1Data = allEntries.map((entry, idx) => {
                // Extract vitals or defaults
                // If entry is null/undefined, skip
                if (!entry) return null;

                // Handle potential different field names
                // Use 0 if missing to indicate 'No Data' instead of fake normal
                // Use 'heart_rate' as the actual BPM for display. 
                // 'pulse' is the raw analog signal from the user's sensor.
                const pulse = Number(entry.heart_rate || entry.pulse || entry.bpm) || 0;
                const rawSignal = Number(entry.pulse) || 0;
                const systolic = Number(entry.systolic) || 0;
                const diastolic = Number(entry.diastolic) || 0;

                // Calculate status strictly (Pass Zone 1 to ignore BP)
                const status = getHealthStatus(pulse, systolic, diastolic, 'Zone 1');

                // FIX: Use real coordinates from Firebase. Fallback to default if missing.
                const lat = Number(entry.lat) || 12.2958;
                const lon = Number(entry.lon || entry.lng) || 76.6396;

                return {
                    id: `Z1-P${String(idx + 1).padStart(2, '0')}`,
                    bandId: `BAND-${String(idx + 1).padStart(4, '0')}`,
                    pulse: pulse,
                    systolic: systolic,
                    diastolic: diastolic,
                    location: { name: 'Live Asset', lat: lat, lng: lon },
                    zone: 'Zone 1',
                    status: status,
                    rawSignal: rawSignal,
                    // FIX: Automatically trigger panic state if pulse is in danger range
                    panicClicks: (entry.panic || status === 'danger') ? 3 : 0, 
                    timestamp: entry.timestamp || new Date().toLocaleTimeString()
                };
            }).filter(p => p !== null);

            // If we have live data, ensure at least one is explicitly marked as "LIVE CONNECTION"
            if (zone1Data.length > 0) {
                zone1Data[0].location.name = "📡 LIVE SENSOR FEED";
                zone1Data[0].bandId = "LIVE-DEVICE";
            }
        } else {
            console.log("Firebase Connection Search: Result is empty (null). Ensure your database path has data nodes.");
        }
    } catch (error) {
        console.error("Zone 1 Live Data Error:", error);
    }

    // Ensure we have the Hardware Device (BAND-1010) as the primary asset
    const liveBands = [];
    
    // The very first band is our Hardware Link (Band 10)
    // SIMULATION MODE: No longer depending on hardwareEntry
    liveBands.push({
        id: `Z1-HARDWARE-01`,
        bandId: `BAND-1010`,
        // ALWAYS generate random values between 60-90 for simulation
        pulse: 60 + Math.floor(Math.random() * 31),
        systolic: 120 + Math.floor(Math.random() * 5),
        diastolic: 80 + Math.floor(Math.random() * 5),
        location: { 
            name: `🛰️ SIMULATED NODE-10`, 
            lat: 12.2958, 
            lng: 76.6394 
        },
        zone: 'Zone 1',
        status: 'success',
        rawSignal: 2450 + Math.floor(Math.random() * 50),
        panicClicks: 0,
        timestamp: new Date().toLocaleTimeString(),
        isLiveStream: true
    });

    // Add 4 more Live simulation slots to make it 5 total as requested before
    for (let i = 2; i <= 5; i++) {
        liveBands.push({
            id: `Z1-LIVE-${i}`,
            bandId: `LIVE-B${i}`,
            pulse: 70 + Math.floor(Math.random() * 15),
            systolic: 118,
            diastolic: 78,
            location: { name: `📡 LIVE MONITORING`, lat: 12.2958, lng: 76.6394 },
            zone: 'Zone 1',
            status: 'success',
            rawSignal: 2400 + Math.floor(Math.random() * 200),
            panicClicks: 0,
            timestamp: new Date().toLocaleTimeString(),
            isLiveStream: true
        });
    }

    // Replace Zone 1 data
    zone1Data = liveBands;

    // ADDED: Still keep the original mock bands but further down the list
    const mockZone1Bands = [
        {
            id: 'Z1-M01',
            bandId: 'BAND-1001',
            pulse: 78,
            systolic: 115,
            diastolic: 75,
            location: { name: 'Central Lobby', lat: 12.2958, lng: 76.6396 },
            zone: 'Zone 1',
            status: 'success',
            panicClicks: 0,
            timestamp: new Date().toLocaleTimeString()
        },
        {
            id: 'Z1-M02',
            bandId: 'BAND-1002',
            pulse: 135,
            systolic: 125,
            diastolic: 85,
            location: { name: 'Entrance A', lat: 12.2960, lng: 76.6400 },
            zone: 'Zone 1',
            status: 'warning',
            panicClicks: 0,
            timestamp: new Date().toLocaleTimeString()
        },
        {
            id: 'Z1-M03',
            bandId: 'BAND-1003',
            pulse: 165,
            systolic: 145,
            diastolic: 95,
            location: { name: 'Food Court', lat: 12.2955, lng: 76.6390 },
            zone: 'Zone 1',
            status: 'danger',
            panicClicks: 3,
            timestamp: new Date().toLocaleTimeString()
        }
    ];

    zone1Data = [...zone1Data, ...mockZone1Bands];

    // Generate Simulated Data for Other Zones (2, 3, 4...)
    // generatePeople SCIPS Zone 1 strictly.
    const otherZonesData = generatePeople();

    // Combine Real (Zone 1) + Simulated (Zone 2+)
    allPeople = [...zone1Data, ...otherZonesData];

    // Update Sync Timestamp
    const syncTimeEl = document.getElementById('lastSyncTime');
    if (syncTimeEl) {
        syncTimeEl.textContent = new Date().toLocaleTimeString();
        syncTimeEl.parentElement.style.color = 'var(--success)';
        setTimeout(() => { if(syncTimeEl) syncTimeEl.parentElement.style.color = 'var(--text-muted)'; }, 1000);
    }

    refreshDataViews();
}

function refreshDataViews() {
    // Only update the parts that depend on data
    renderPanicAlerts();
    renderAllBands();
    updateSidebarStats();

    // Partner View Updates
    renderPartnerTasks();
}

function refreshZoneStructure() {
    // Update the sidebar structure (Zones list)
    renderSidebarList();
    updateSidebarStats(); // Populate with current data
}

// INITIALIZE
function init() {
    // Clear any cached data to ensure fresh calculation with updated logic
    // localStorage.clear(); // Uncomment if you want to reset zones

    refreshZoneStructure();
    fetchData();
    // Poll every 5 seconds for new data as requested
    setInterval(fetchData, 3000);
}

function renderSidebarList() {
    const zonesList = document.getElementById('zonesList');
    zonesList.innerHTML = '';

    ZONES.forEach(zone => {
        const zoneEl = document.createElement('div');
        // Add active class if it matches currentZone
        zoneEl.className = `zone-item ${zone.name === currentZone ? 'active' : ''}`;
        // Add safe ID for parent to manage active class
        const safeZoneId = zone.name.replace(/\s+/g, '-');
        zoneEl.id = `zone-item-${safeZoneId}`;

        zoneEl.innerHTML = `
                    <span class="zone-name">${zone.name}</span>
                    <span id="count-${safeZoneId}" class="zone-count neutral">...</span>
                `;

        // Add click handler
        zoneEl.onclick = () => selectZone(zone.name);

        zonesList.appendChild(zoneEl);
    });
}

function selectZone(zoneName) {
    currentZone = zoneName;

    // Visual update of sidebar
    document.querySelectorAll('.zone-item').forEach(el => el.classList.remove('active'));
    const safeZoneId = zoneName.replace(/\s+/g, '-');
    const activeEl = document.getElementById(`zone-item-${safeZoneId}`);
    if (activeEl) activeEl.classList.add('active');

    // Update main view
    renderAllBands();
}

function updateSidebarStats() {
    const zoneStats = {};

    // Calculate stats - COUNT ONLY MEDICAL PANIC (not manual button clicks)
    // These are the red PANIC badges shown in "Active Bands" section
    allPeople.forEach(p => {
        if (!zoneStats[p.zone]) {
            zoneStats[p.zone] = 0;
        }

        // Check for Danger Status (Red)
        // This includes Zone 1 Pulse-Only Danger and Other Zones Full Danger
        if (p.status === 'danger') {
            zoneStats[p.zone]++;
        }
    });

    // Update DOM
    ZONES.forEach(zone => {
        const safeZoneId = zone.name.replace(/\s+/g, '-');
        const countEl = document.getElementById(`count-${safeZoneId}`);
        if (countEl) {
            const panicCount = zoneStats[zone.name] || 0;

            countEl.textContent = panicCount;

            // Style: Red background if panic exists
            if (panicCount > 0) {
                countEl.className = 'zone-count danger';
                countEl.style.display = 'inline-block';
            } else {
                countEl.className = 'zone-count neutral';
            }
        }
    });
}

function renderPanicAlerts() {
    const panicGrid = document.getElementById('panicGrid');
    panicGrid.innerHTML = '';

    // Filter for Panic Clicks >= 3 OR Status == 'danger' (Medical Emergency)
    // AND exclude resolved ones
    const resolvedPanics = JSON.parse(localStorage.getItem('festflow_resolved_panics')) || [];
    // LIMIT TO TOP 4 ALERTS
    const panicCases = allPeople
        .filter(p => (p.panicClicks >= 3 || p.status === 'danger') && !resolvedPanics.includes(p.bandId))
        .slice(0, 4);

    if (panicCases.length === 0) {
        panicGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 20px;">No Panic Alerts Detected</div>';
        return;
    }

    panicCases.forEach(person => {
        const card = document.createElement('div');
        card.className = `alert-card danger`; // Force danger style for panic
        card.style.border = '2px solid var(--danger)';
        card.innerHTML = `
                    <div style="display:flex; justify-content:space-between;">
                        <div class="alert-id">${person.bandId}</div>
                        <div style="color:var(--danger); font-weight:bold; font-size:12px;">PANIC CLICKED</div>
                    </div>
                    <div class="alert-row">
                        <span class="alert-label">Pulse:</span>
                        <span class="alert-value">${person.pulse} bpm</span>
                    </div>
                    <div class="alert-row">
                        <span class="alert-label">BP:</span>
                        <span class="alert-value">${person.systolic}/${person.diastolic}</span>
                    </div>
                    <div class="alert-row">
                        <span class="alert-label">Zone:</span>
                        <span class="alert-value" style="font-weight: 700;">${person.zone}</span>
                    </div>
                    <div class="alert-location" onclick="event.stopPropagation(); window.open('https://www.google.com/maps/dir/?api=1&destination=${person.location.lat},${person.location.lng}', '_blank')" 
                        style="background: rgba(255, 84, 89, 0.1); color: var(--danger); cursor: pointer; transition: all 0.2s;" 
                        onmouseover="this.style.transform='scale(1.02)'; this.style.background='rgba(255, 84, 89, 0.2)'" 
                        onmouseout="this.style.transform='scale(1)'; this.style.background='rgba(255, 84, 89, 0.1)'"
                        title="Get Directions">
                        📍 ${person.location.name} (${person.zone}) ↗
                    </div>
                `;
        card.onclick = () => openModal(person);
        panicGrid.appendChild(card);
    });
}

function resolvePanic(bandId) {
    let resolved = JSON.parse(localStorage.getItem('festflow_resolved_panics')) || [];
    if (!resolved.includes(bandId)) {
        resolved.push(bandId);
        localStorage.setItem('festflow_resolved_panics', JSON.stringify(resolved));
        refreshDataViews();
    }
}

function renderAllBands() {
    const scrollable = document.getElementById('allBandsSection');
    scrollable.innerHTML = '';

    // Filter by Current Zone
    const zoneData = allPeople.filter(p => p.zone === currentZone);

    // Sort by Urgency: Danger (0) > Resolved Danger (0.5) > Warning (1) > Success (2)
    const tasks = JSON.parse(localStorage.getItem('festflow_tasks')) || [];

    const sortedPeople = [...zoneData].sort((a, b) => {
        // ALWAYS KEEP HARDWARE NODE (BAND-1010) AT TOP
        if (a.bandId === 'BAND-1010') return -1;
        if (b.bandId === 'BAND-1010') return 1;

        // KEEP OTHER LIVE FEEDS AT TOP
        const isALive = a.bandId.startsWith('LIVE-B');
        const isBLive = b.bandId.startsWith('LIVE-B');
        if (isALive && !isBLive) return -1;
        if (!isALive && isBLive) return 1;

        const getScore = (p) => {
            if (p.status === 'danger') {
                const task = tasks.find(t => t.bandId === p.bandId);
                if (task && task.status === 'resolved') return 0.5;
                return 0;
            }
            if (p.status === 'warning') return 1;
            return 2;
        };
        const scoreA = getScore(a);
        const scoreB = getScore(b);

        // If categories are different, sort by category
        if (scoreA !== scoreB) return scoreA - scoreB;

        return 0;
    });

    const header = document.createElement('div');
    header.innerHTML = `<h3 class="zone-title">Active Bands in ${currentZone} (${zoneData.length}) - Sorted by Urgency</h3>`;
    header.style.marginBottom = '15px';
    scrollable.appendChild(header);

    if (zoneData.length === 0) {
        scrollable.innerHTML += '<div style="text-align:center; padding:20px; color:var(--text-muted)">No active bands in this zone.</div>';
        return;
    }

    const grid = document.createElement('div');
    grid.className = 'people-grid';

    sortedPeople.forEach(person => {
        // Check for Status Danger (Red) for Panic Badge
        const isMedicalPanic = person.status === 'danger';

        const card = document.createElement('div');
        // Status class controls ALL coloring (top bar via CSS ::before)
        card.className = `person-card ${person.status}`;

        card.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                        <div class="person-id" style="${(person.bandId === 'BAND-1010' || person.bandId.startsWith('LIVE-B')) ? 'color: var(--primary); font-weight: 800;' : ''}">${person.bandId}</div>
                        ${(person.bandId === 'BAND-1010' || person.bandId.startsWith('LIVE-B')) ? `<span style="font-size:10px; background:var(--primary); color:black; padding:2px 8px; border-radius:4px; font-weight:bold; animation: blink 1s infinite;">${person.bandId === 'BAND-1010' ? 'HARDWARE LINK' : 'LIVE DATA'}</span>` : ''}
                        ${isMedicalPanic ? '<span style="font-size:11px; background:var(--danger); color:white; padding:4px 12px; border-radius:12px; font-weight:bold;">PANIC</span>' : ''}
                    </div>
                    <div class="person-metrics">
                        <div class="metric">
                            <div class="metric-label">BPM</div>
                            <div class="metric-value">${person.pulse}</div>
                        </div>
                        <div class="metric">
                            <div class="metric-label">${(person.bandId === 'BAND-1010' || person.bandId.startsWith('LIVE-B')) ? 'Signal' : 'BP'}</div>
                            <div class="metric-value">${(person.bandId === 'BAND-1010' || person.bandId.startsWith('LIVE-B')) ? person.rawSignal : (person.systolic + '/' + person.diastolic)}</div>
                        </div>
                    </div>
                    <div class="person-location" style="${(person.bandId === 'BAND-1010' || person.bandId.startsWith('LIVE-B')) ? 'color: var(--primary); font-weight: bold;' : ''}">
                         📍 ${person.location.name}
                    </div>
                `;
        card.onclick = () => openModal(person);
        grid.appendChild(card);
    });

    scrollable.appendChild(grid);
}

let modalRefreshInterval = null;

function openModal(person) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modalTitle.innerHTML = `${person.bandId} - ${person.zone}`;
    modalBody.innerHTML = `
                <div class="data-item">
                    <div class="data-label">Pulse (BPM)</div>
                    <div class="data-value">${person.pulse}</div>
                </div>
                <div class="data-item">
                    <div class="data-label">Systolic BP</div>
                    <div class="data-value">${person.systolic}</div>
                </div>
                <div class="data-item">
                    <div class="data-label">Diastolic BP</div>
                    <div class="data-value">${person.diastolic}</div>
                </div>
                <div class="data-item">
                    <div class="data-label">Status</div>
                    <div class="data-value" style="color: ${getStatusColor(person.status)}">
                        <span class="status-indicator ${person.status}"></span>${person.status === 'success' ? 'SAFE' : person.status.toUpperCase()}
                    </div>
                </div>
                <div class="data-item">
                    <div class="data-label">Location</div>
                    <div class="data-value" style="color: var(--primary); font-size: 18px;">
                        📍 ${person.location.name}
                    </div>
                </div>
                <div class="data-item" id="actionContainer">
                    ${getActionButton(person.bandId)}
                </div>
                <div id="map"></div>
            `;

    modal.classList.add('active');

    if (modalRefreshInterval) clearInterval(modalRefreshInterval);
    modalRefreshInterval = setInterval(() => {
        const container = document.getElementById('actionContainer');
        if (container && document.getElementById('modal').classList.contains('active')) {
            container.innerHTML = getActionButton(person.bandId);
        } else {
            clearInterval(modalRefreshInterval);
        }
    }, 1000);

    setTimeout(() => {
        if (map) {
            map.remove();
        }
        map = L.map('map').setView([person.location.lat, person.location.lng], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        L.marker([person.location.lat, person.location.lng]).addTo(map)
            .bindPopup(`<strong>${person.bandId}</strong><br><strong>${person.location.name}</strong><br>Lat: ${person.location.lat.toFixed(4)}<br>Lng: ${person.location.lng.toFixed(4)}`);
    }, 100);
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
    if (modalRefreshInterval) {
        clearInterval(modalRefreshInterval);
        modalRefreshInterval = null;
    }
    if (map) {
        map.remove();
        map = null;
    }
}

function getStatusColor(status) {
    const colors = { danger: '#ff5459', warning: '#FFC107', success: '#22c65e', neutral: '#ffd60a' };
    return colors[status] || '#32b8c6';
}

function addZone() {
    // Simply find the next number
    const existingNumbers = ZONES.map(z => parseInt(z.name.replace('Zone ', ''))).filter(n => !isNaN(n));

    let nextId = 1;
    while (existingNumbers.includes(nextId)) {
        nextId++;
    }

    const newZoneName = `Zone ${nextId}`;

    ZONES.push({ name: newZoneName, riskLevel: 'neutral' });
    saveZones();
    // Re-render Structure since a zone was added
    refreshZoneStructure();
}

function deleteZone() {
    if (ZONES.length <= 1) {
        alert("You must have at least one zone.");
        return;
    }

    // Find index of current zone
    const index = ZONES.findIndex(z => z.name === currentZone);
    if (index !== -1) {
        ZONES.splice(index, 1);

        // Update current zone to the previous one or the first one
        if (ZONES.length > 0) {
            currentZone = ZONES[Math.max(0, index - 1)].name;
        }

        saveZones();
        refreshZoneStructure();
    }
}

function resetZones() {
    if (confirm("Are you sure you want to reset to default zones?")) {
        ZONES = JSON.parse(JSON.stringify(DEFAULT_ZONES));
        currentZone = ZONES[0].name;
        saveZones();
        refreshZoneStructure();
    }
}

document.addEventListener('click', (e) => {
    if (e.target === document.getElementById('modal')) {
        closeModal();
    }
});

function toggleTheme() {
    document.body.classList.toggle('light-mode');
    localStorage.setItem('festflow_theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
}

// LOAD THEME
if (localStorage.getItem('festflow_theme') === 'light') {
    document.body.classList.add('light-mode');
}

init();

// PARTNER DASHBOARD LOGIC
function togglePartnerView() {
    const pDash = document.getElementById('partnerDashboard');
    const btn = document.getElementById('viewToggleBtn');
    pDash.classList.toggle('mobile-view');

    if (pDash.classList.contains('mobile-view')) {
        // Return to Website (Monitor Icon)
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>';
    } else {
        // Go to Mobile (Phone Icon)
        btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>';
    }
}

function switchPartnerTab(tab) {
    const panicSec = document.getElementById('panicSection');
    const allottedSec = document.getElementById('allottedSection');
    const tabPanic = document.getElementById('tabPanic');
    const tabAllotted = document.getElementById('tabAllotted');

    if (tab === 'panic') {
        panicSec.style.display = 'block';
        allottedSec.style.display = 'none';
        tabPanic.classList.add('active');
        tabAllotted.classList.remove('active');
    } else {
        panicSec.style.display = 'none';
        allottedSec.style.display = 'block';
        tabPanic.classList.remove('active');
        tabAllotted.classList.add('active');
    }
}

function getActionButton(bandId) {
    const tasks = JSON.parse(localStorage.getItem('festflow_tasks')) || [];
    const task = tasks.find(t => t.bandId === bandId);

    const btnStyle = "width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; border:none; padding: 15px; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 16px; transition: transform 0.2s; text-transform: uppercase;";

    if (!task) {
        // Red: No Alert Sent
        return `<button onclick="sendAlertToPartner('${bandId}')" style="${btnStyle} background: var(--danger); color: white; box-shadow: 0 4px 15px rgba(255, 84, 89, 0.4);" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'"> ALERT PARTNER</button>`;
    } else if (task.status === 'resolved') {
        // Green: Resolved
        return `<button disabled style="${btnStyle} background: var(--success); color: white; cursor: default; opacity: 0.8;">✅ RESOLVED</button>`;
    } else {
        // Yellow: Pending
        return `<button disabled style="${btnStyle} background: var(--warning); color: black; cursor: wait; opacity: 0.9;">⏳ ALERT SENT...</button>`;
    }
}

function sendAlertToPartner(bandId) {
    let tasks = JSON.parse(localStorage.getItem('festflow_tasks')) || [];

    const person = allPeople.find(p => p.bandId === bandId);
    if (!person) return;

    // If already pending, do nothing
    if (tasks.find(t => t.bandId === bandId && t.status !== 'resolved')) return;

    // If previously resolved, reactivate it? 
    const existingIndex = tasks.findIndex(t => t.bandId === bandId);
    if (existingIndex > -1) {
        tasks[existingIndex].status = 'pending';
        tasks[existingIndex].timestamp = new Date().toLocaleTimeString();
        tasks[existingIndex].pulse = person.pulse;
    } else {
        tasks.push({
            id: Date.now(),
            bandId: bandId,
            zone: person.zone,
            location: person.location.name,
            pulse: person.pulse,
            status: 'pending',
            timestamp: new Date().toLocaleTimeString()
        });
    }

    localStorage.setItem('festflow_tasks', JSON.stringify(tasks));

    // Update modal button immediately
    const container = document.getElementById('actionContainer');
    if (container) {
        container.innerHTML = getActionButton(bandId);
    }

    renderPartnerTasks();
}

function renderPartnerTasks() {
    const partnerPanicGrid = document.getElementById('partnerPanicGrid');

    if (partnerPanicGrid) {
        partnerPanicGrid.innerHTML = '';
        const resolvedPanics = JSON.parse(localStorage.getItem('festflow_resolved_panics')) || [];
        // FILTER BY CURRENT ZONE
        const panicCases = allPeople.filter(p => p.zone === currentZone && p.panicClicks >= 3 && !resolvedPanics.includes(p.bandId));

        // Update Zone Indicator in header
        const zoneInd = document.getElementById('partnerZoneIndicator');
        if (zoneInd) zoneInd.textContent = `— ${currentZone}`;

        if (panicCases.length === 0) {
            partnerPanicGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 20px;">No Panic Alerts Detected</div>';
        } else {
            panicCases.forEach(person => {
                const card = document.createElement('div');
                card.className = `alert-card danger`;
                card.style.border = '2px solid var(--danger)';
                card.innerHTML = `
                            <div style="display:flex; justify-content:space-between;">
                                <div class="alert-id">${person.bandId}</div>
                                <div style="color:var(--danger); font-weight:bold; font-size:12px;">PANIC CLICKED</div>
                            </div>
                            <div class="alert-row">
                                <span class="alert-label">Pulse:</span>
                                <span class="alert-value">${person.pulse} bpm</span>
                            </div>
                            <div class="alert-row">
                                <span class="alert-label">BP:</span>
                                <span class="alert-value">${person.systolic}/${person.diastolic}</span>
                            </div>
                            <div class="alert-row">
                                <span class="alert-label">Zone:</span>
                                <span class="alert-value" style="font-weight: 700;">${person.zone}</span>
                            </div>
                            <div class="alert-location" onclick="event.stopPropagation(); window.open('https://www.google.com/maps/dir/?api=1&destination=${person.location.lat},${person.location.lng}', '_blank')" 
                                style="background: rgba(255, 84, 89, 0.1); color: var(--danger); cursor: pointer; transition: all 0.2s;" 
                                onmouseover="this.style.transform='scale(1.02)'; this.style.background='rgba(255, 84, 89, 0.2)'" 
                                onmouseout="this.style.transform='scale(1)'; this.style.background='rgba(255, 84, 89, 0.1)'"
                                title="Get Directions">
                                📍 ${person.location.name} (${person.zone}) ↗
                            </div>
                            <button onclick="event.stopPropagation(); resolvePanic('${person.bandId}')" 
                                style="margin-top: 10px; width: 100%; padding: 8px; background: #22c55e; color: white; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; transition: all 0.2s;"
                                onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                                ✅ RESOLVE
                            </button>
                        `;
                // No modal click for partner view to keep it simple, or add if needed
                partnerPanicGrid.appendChild(card);
            });
        }
    }

    const grid = document.getElementById('partnerTasksGrid');
    if (!grid) return;

    const tasks = JSON.parse(localStorage.getItem('festflow_tasks')) || [];
    grid.innerHTML = '';

    if (tasks.length === 0) {
        grid.innerHTML = '<div style="color: grey; padding: 20px;">No manual tasks allocated yet.</div>';
        return;
    }

    tasks.forEach(task => {
        // FILTER BY CURRENT ZONE
        if (task.zone !== currentZone) return;

        const card = document.createElement('div');
        card.className = 'alert-card';
        card.style.border = '2px solid var(--warning)';
        card.innerHTML = `
                <div style="display:flex; justify-content:space-between;">
                    <div class="alert-id">${task.bandId}</div>
                    <div style="color:var(--warning); font-weight:bold; font-size:12px;">ALLOCATED</div>
                </div>
                 <div class="alert-row">
                    <span class="alert-label">Pulse:</span>
                    <span class="alert-value">${task.pulse} bpm</span>
                </div>
                 <div class="alert-row">
                    <span class="alert-label">Allocated:</span>
                    <span class="alert-value">${task.timestamp}</span>
                </div>
                <div class="alert-row">
                    <span class="alert-label">Zone:</span>
                    <span class="alert-value" style="font-weight: 700;">${task.zone}</span>
                </div>
                <div class="alert-location" onclick="event.stopPropagation(); window.open('https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(task.location + ' ' + task.zone)}', '_blank')" 
                    style="background: rgba(255, 193, 7, 0.1); color: var(--warning); cursor: pointer; transition: all 0.2s;" 
                    onmouseover="this.style.transform='scale(1.02)'; this.style.background='rgba(255, 193, 7, 0.2)'" 
                    onmouseout="this.style.transform='scale(1)'; this.style.background='rgba(255, 193, 7, 0.1)'"
                    title="Get Directions">
                    📍 ${task.location} (${task.zone}) ↗
                </div>
                <button onclick="resolveTask(${task.id})" 
                    style="margin-top: 10px; width: 100%; padding: 8px; background: #22c55e; color: white; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; transition: all 0.2s;"
                    onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                    ✅ RESOLVE
                </button>
            `;
        grid.appendChild(card);
    });
}

function resolveTask(taskId) {
    let tasks = JSON.parse(localStorage.getItem('festflow_tasks')) || [];
    tasks = tasks.filter(t => t.id !== taskId);
    localStorage.setItem('festflow_tasks', JSON.stringify(tasks));
    renderPartnerTasks();
}
