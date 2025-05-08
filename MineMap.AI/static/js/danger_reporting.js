// Shared danger reporting functionality for citizen and sapper maps
// Variables for location tracking
let locationWatchId = null;
let gpsPositions = [];
let locationStable = false;
let mediaStream = null;

// Modal initialization
function initDangerReporting() {
    // Initialization for report button
    const reportBtn = document.getElementById('reportDangerBtn');
    if (reportBtn) {
        reportBtn.addEventListener('click', () => {
            const reportModal = new bootstrap.Modal(document.getElementById('reportModal'));
            reportModal.show();
        });
    }

    // Modal event handlers
    const reportModal = document.getElementById('reportModal');
    if (reportModal) {
        reportModal.addEventListener('show.bs.modal', onReportModalShow);
        reportModal.addEventListener('hidden.bs.modal', () => {
            stopCamera();
            stopGpsTracking();
        });
    }

    // Camera and photo buttons
    const startCameraBtn = document.getElementById('startCamera');
    if (startCameraBtn) {
        startCameraBtn.addEventListener('click', startCamera);
    }

    const takePhotoBtn = document.getElementById('takePhoto');
    if (takePhotoBtn) {
        takePhotoBtn.addEventListener('click', takePhoto);
    }

    const retakePhotoBtn = document.getElementById('retakePhoto');
    if (retakePhotoBtn) {
        retakePhotoBtn.addEventListener('click', retakePhoto);
    }

    // Submit button
    const submitReportBtn = document.getElementById('submitReport');
    if (submitReportBtn) {
        submitReportBtn.addEventListener('click', submitReport);
    }
}

// Function called when report modal is shown
function onReportModalShow() {
    // Reset form data
    document.getElementById('reportForm')?.reset();
    document.getElementById('photoData').value = '';
    
    // Reset camera elements
    const cameraPreview = document.getElementById('cameraPreview');
    const photoCanvas = document.getElementById('photoCanvas');
    if (cameraPreview) cameraPreview.style.display = 'block';
    if (photoCanvas) photoCanvas.style.display = 'none';
    
    // Hide retake button, show camera button
    const retakePhotoBtn = document.getElementById('retakePhoto');
    const takePhotoBtn = document.getElementById('takePhoto');
    if (retakePhotoBtn) retakePhotoBtn.style.display = 'none';
    if (takePhotoBtn) takePhotoBtn.disabled = true;
    
    // Start GPS tracking
    startGpsTracking();
}

// Start camera function
async function startCamera() {
    try {
        // Request camera access
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "environment" }, 
            audio: false 
        });
        
        // Display camera stream
        const cameraPreview = document.getElementById('cameraPreview');
        if (cameraPreview) {
            cameraPreview.srcObject = mediaStream;
            cameraPreview.style.display = 'block';
        }
        
        // Hide canvas, show take photo button when camera is ready
        const photoCanvas = document.getElementById('photoCanvas');
        if (photoCanvas) photoCanvas.style.display = 'none';
        
        // Enable photo button when camera is ready
        const takePhotoBtn = document.getElementById('takePhoto');
        if (takePhotoBtn) takePhotoBtn.disabled = false;
        
        // Hide start camera button when camera is running
        const startCameraBtn = document.getElementById('startCamera');
        if (startCameraBtn) startCameraBtn.disabled = true;
        
        // Start countdown for auto-photo based on GPS stability
        startPhotoCountdown();
        
    } catch (error) {
        console.error('Error accessing camera:', error);
        alert('Не вдалося отримати доступ до камери. Перевірте дозволи та спробуйте знову.');
    }
}

// Function to start countdown for auto photo capture
function startPhotoCountdown() {
    const countdownElement = document.getElementById('photoCountdown');
    const takePhotoBtn = document.getElementById('takePhoto');
    
    if (!countdownElement || !takePhotoBtn) return;
    
    // Only start countdown if GPS is stable
    if (!locationStable) return;
    
    // Show countdown element
    countdownElement.style.display = 'block';
    
    // Set initial countdown
    let seconds = 10;
    countdownElement.textContent = seconds;
    
    // Update countdown every second
    const interval = setInterval(() => {
        seconds--;
        countdownElement.textContent = seconds;
        
        // When countdown reaches 0, take photo automatically
        if (seconds <= 0) {
            clearInterval(interval);
            countdownElement.style.display = 'none';
            
            // Take photo if button is enabled
            if (!takePhotoBtn.disabled) {
                takePhoto();
            }
        }
    }, 1000);
    
    // Store interval ID in countdown element to be able to clear it
    countdownElement.dataset.intervalId = interval;
}

// Function to check if location has changed significantly
function hasLocationChanged(oldPositions, newPositions) {
    if (oldPositions.length === 0 || newPositions.length === 0) return true;
    
    // Calculate average positions
    const oldAvgLat = oldPositions.reduce((sum, pos) => sum + pos.latitude, 0) / oldPositions.length;
    const oldAvgLng = oldPositions.reduce((sum, pos) => sum + pos.longitude, 0) / oldPositions.length;
    const newAvgLat = newPositions.reduce((sum, pos) => sum + pos.latitude, 0) / newPositions.length;
    const newAvgLng = newPositions.reduce((sum, pos) => sum + pos.longitude, 0) / newPositions.length;
    
    // Calculate distance between averages
    const distance = calculateDistance(oldAvgLat, oldAvgLng, newAvgLat, newAvgLng);
    
    // If distance is greater than 10 meters, consider it changed
    return distance > 10;
}

// Take photo function
function takePhoto() {
    const cameraPreview = document.getElementById('cameraPreview');
    const photoCanvas = document.getElementById('photoCanvas');
    const takePhotoBtn = document.getElementById('takePhoto');
    const retakePhotoBtn = document.getElementById('retakePhoto');
    const photoDataInput = document.getElementById('photoData');
    const countdownElement = document.getElementById('photoCountdown');
    
    if (!cameraPreview || !photoCanvas || !photoDataInput) return;
    
    // Stop any running countdown
    if (countdownElement) {
        clearInterval(Number(countdownElement.dataset.intervalId));
        countdownElement.style.display = 'none';
    }
    
    // Take photo from camera stream
    const context = photoCanvas.getContext('2d');
    photoCanvas.width = cameraPreview.videoWidth;
    photoCanvas.height = cameraPreview.videoHeight;
    context.drawImage(cameraPreview, 0, 0, photoCanvas.width, photoCanvas.height);
    
    // Convert canvas to base64 data
    const photoData = photoCanvas.toDataURL('image/jpeg', 0.8);
    photoDataInput.value = photoData;
    
    // Show photo taken, hide camera preview
    cameraPreview.style.display = 'none';
    photoCanvas.style.display = 'block';
    
    // Toggle buttons
    if (takePhotoBtn) takePhotoBtn.style.display = 'none';
    if (retakePhotoBtn) retakePhotoBtn.style.display = 'block';
}

// Retake photo function
function retakePhoto() {
    const cameraPreview = document.getElementById('cameraPreview');
    const photoCanvas = document.getElementById('photoCanvas');
    const takePhotoBtn = document.getElementById('takePhoto');
    const retakePhotoBtn = document.getElementById('retakePhoto');
    
    // Show camera preview, hide photo
    if (cameraPreview) cameraPreview.style.display = 'block';
    if (photoCanvas) photoCanvas.style.display = 'none';
    
    // Toggle buttons
    if (takePhotoBtn) {
        takePhotoBtn.style.display = 'block';
        takePhotoBtn.disabled = false;
    }
    if (retakePhotoBtn) retakePhotoBtn.style.display = 'none';
    
    // Clear photo data
    document.getElementById('photoData').value = '';
    
    // Restart auto-photo countdown if location is stable
    if (locationStable) {
        startPhotoCountdown();
    }
}

// Stop camera function
function stopCamera() {
    // Stop media stream
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
    }
    
    // Reset camera elements
    const cameraPreview = document.getElementById('cameraPreview');
    if (cameraPreview) {
        cameraPreview.srcObject = null;
    }
    
    // Reset buttons
    const startCameraBtn = document.getElementById('startCamera');
    if (startCameraBtn) startCameraBtn.disabled = false;
    
    // Clear any running countdown
    const countdownElement = document.getElementById('photoCountdown');
    if (countdownElement) {
        clearInterval(Number(countdownElement.dataset.intervalId));
        countdownElement.style.display = 'none';
    }
}

// Start GPS tracking
function startGpsTracking() {
    // Reset GPS data
    gpsPositions = [];
    locationStable = false;
    
    // Update GPS status indicator
    const gpsStatus = document.getElementById('gpsStatus');
    if (gpsStatus) {
        gpsStatus.textContent = 'Отримання GPS...';
        gpsStatus.className = 'position-absolute top-0 end-0 p-2 badge bg-warning';
    }
    
    // Clear any existing watch
    if (locationWatchId !== null) {
        navigator.geolocation.clearWatch(locationWatchId);
    }
    
    // Start watching position with high accuracy
    if (navigator.geolocation) {
        locationWatchId = navigator.geolocation.watchPosition(
            // Success callback
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                
                // Add position to array, keep last 5 positions
                gpsPositions.push({ latitude, longitude });
                if (gpsPositions.length > 5) {
                    gpsPositions.shift();
                }
                
                // Update form fields
                document.getElementById('latitude').value = latitude;
                document.getElementById('longitude').value = longitude;
                
                // Check position stability
                checkPositionStability();
                
                // Try to detect region based on coordinates
                if (typeof setupAutoRegionDetection === 'function') {
                    setupAutoRegionDetection('latitude', 'longitude', 'region');
                }
            },
            // Error callback
            (error) => {
                console.error('GPS Error:', error);
                if (gpsStatus) {
                    gpsStatus.textContent = 'Помилка GPS';
                    gpsStatus.className = 'position-absolute top-0 end-0 p-2 badge bg-danger';
                }
            },
            // Options
            { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
        );
    } else {
        // No geolocation support
        if (gpsStatus) {
            gpsStatus.textContent = 'GPS недоступний';
            gpsStatus.className = 'position-absolute top-0 end-0 p-2 badge bg-danger';
        }
        console.error('Geolocation is not supported by this browser.');
    }
}

// Check if GPS position is stable
function checkPositionStability() {
    // Need at least 3 positions to check stability
    if (gpsPositions.length < 3) return;
    
    // Calculate averages
    const sumLat = gpsPositions.reduce((sum, pos) => sum + pos.latitude, 0);
    const sumLng = gpsPositions.reduce((sum, pos) => sum + pos.longitude, 0);
    const avgLat = sumLat / gpsPositions.length;
    const avgLng = sumLng / gpsPositions.length;
    
    // Calculate max distance from average
    let maxDistance = 0;
    gpsPositions.forEach(pos => {
        const distance = calculateDistance(pos.latitude, pos.longitude, avgLat, avgLng);
        maxDistance = Math.max(maxDistance, distance);
    });
    
    // If max distance is less than 10 meters, position is considered stable
    const wasStable = locationStable;
    locationStable = maxDistance < 10;
    
    // Update GPS status indicator
    const gpsStatus = document.getElementById('gpsStatus');
    if (gpsStatus) {
        gpsStatus.textContent = locationStable ? 'GPS стабільний' : 'GPS нестабільний';
        gpsStatus.className = `position-absolute top-0 end-0 p-2 badge ${locationStable ? 'bg-success' : 'bg-warning'}`;
    }
    
    // If position just became stable, start photo countdown
    if (locationStable && !wasStable && document.getElementById('cameraPreview').style.display !== 'none') {
        startPhotoCountdown();
    }
}

// Stop GPS tracking
function stopGpsTracking() {
    if (locationWatchId !== null) {
        navigator.geolocation.clearWatch(locationWatchId);
        locationWatchId = null;
    }
}

// Calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth radius in meters
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in meters
}

// Convert degrees to radians
function toRadians(degrees) {
    return degrees * Math.PI / 180;
}

// Submit report function
async function submitReport() {
    // Check if coordinates are available
    const latitude = document.getElementById('latitude').value;
    const longitude = document.getElementById('longitude').value;
    
    if (!latitude || !longitude) {
        alert('Неможливо відправити повідомлення без координат. Дочекайтесь отримання GPS даних.');
        return;
    }
    
    if (!locationStable) {
        alert('Локація не стабільна. Залишайтесь на місці для отримання точних координат.');
        return;
    }
    
    // Check if photo was taken
    const photoData = document.getElementById('photoData').value;
    if (!photoData) {
        alert('Будь ласка, зробіть фото небезпечної ситуації');
        return;
    }
    
    // Collect form data
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const regionId = document.getElementById('region').value;
    
    // Validate required fields
    if (!title || !regionId) {
        alert('Будь ласка, заповніть всі обов\'язкові поля');
        return;
    }
    
    // Create data object for sending
    const reportData = {
        title,
        description,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        status: 'unconfirmed', // Default status
        priority: 'medium',    // Default priority
        region_id: parseInt(regionId),
        photo_data: photoData  // Base64 photo data
    };
    
    try {
        // Show loading indicator
        const submitButton = document.getElementById('submitReport');
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Відправка...';
        
        // Send data to server
        const response = await fetch('/api/report-danger', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reportData)
        });
        
        if (response.ok) {
            // On success, close modal and show message
            const modal = bootstrap.Modal.getInstance(document.getElementById('reportModal'));
            modal.hide();
            
            alert('Повідомлення про небезпеку успішно відправлено. Дякуємо за вашу пильність!');
            
            // Reset form
            document.getElementById('reportForm').reset();
            document.getElementById('photoData').value = '';
            
            // Stop camera and GPS
            stopCamera();
            stopGpsTracking();
            
            // Reload objects on map (using the map's own reload function)
            if (typeof loadExplosiveObjects === 'function') {
                await loadExplosiveObjects();
            }
        } else {
            // Handle server error
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Сталася помилка при відправці повідомлення');
        }
    } catch (error) {
        console.error('Помилка при відправці повідомлення:', error);
        alert('Не вдалося відправити повідомлення: ' + error.message);
    } finally {
        // Reset submit button
        const submitButton = document.getElementById('submitReport');
        submitButton.disabled = false;
        submitButton.innerHTML = 'Відправити повідомлення';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initDangerReporting); 