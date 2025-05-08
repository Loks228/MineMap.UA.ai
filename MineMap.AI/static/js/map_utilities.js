/**
 * Map Utilities - Shared functions for map handling across different user roles
 * MineMap.UA.ai
 */

// Global regions data structure
let mapUtilRegions = [];

/**
 * Finds the region based on geographic coordinates
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {object|null} - The closest region or null if not found
 */
function findRegionByCoordinates(lat, lng) {
    if (!mapUtilRegions || mapUtilRegions.length === 0) {
        console.warn('Regions data not loaded for automatic region detection');
        return null;
    }
    
    // If coordinates are not numbers, return null
    if (isNaN(lat) || isNaN(lng)) {
        return null;
    }
    
    // Find the closest region by calculating the distance from each region center to the coordinates
    let closestRegion = null;
    let closestDistance = Infinity;
    
    mapUtilRegions.forEach(region => {
        // Calculate distance between points using the haversine formula
        const distance = calculateDistance(
            lat, lng,
            region.center_lat, region.center_lng
        );
        
        if (distance < closestDistance) {
            closestDistance = distance;
            closestRegion = region;
        }
    });
    
    return closestRegion;
}

/**
 * Calculates the distance between two geographic points (haversine formula)
 * @param {number} lat1 - Latitude of the first point
 * @param {number} lon1 - Longitude of the first point
 * @param {number} lat2 - Latitude of the second point
 * @param {number} lon2 - Longitude of the second point
 * @returns {number} - Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
}

/**
 * Converts degrees to radians
 * @param {number} deg - Angle in degrees
 * @returns {number} - Angle in radians
 */
function deg2rad(deg) {
    return deg * (Math.PI/180);
}

/**
 * Sets up the coordinate input fields to automatically detect and set the region
 * @param {string} latitudeFieldId - The ID of the latitude input field
 * @param {string} longitudeFieldId - The ID of the longitude input field
 * @param {string} regionSelectId - The ID of the region select dropdown
 */
function setupAutoRegionDetection(latitudeFieldId, longitudeFieldId, regionSelectId) {
    const latitudeInput = document.getElementById(latitudeFieldId);
    const longitudeInput = document.getElementById(longitudeFieldId);
    const regionSelect = document.getElementById(regionSelectId);
    
    if (!latitudeInput || !longitudeInput || !regionSelect) {
        console.warn('One or more fields for auto-region detection not found');
        return;
    }
    
    // Update region based on coordinates
    const updateRegionBasedOnCoordinates = () => {
        const lat = parseFloat(latitudeInput.value);
        const lng = parseFloat(longitudeInput.value);
        
        // If coordinates are valid, determine the region
        if (!isNaN(lat) && !isNaN(lng)) {
            const region = findRegionByCoordinates(lat, lng);
            if (region && regionSelect) {
                regionSelect.value = region.id;
                
                // Trigger a change event on the select element
                const event = new Event('change');
                regionSelect.dispatchEvent(event);
            }
        }
    };
    
    // Add change event listeners to coordinate fields
    latitudeInput.addEventListener('change', updateRegionBasedOnCoordinates);
    longitudeInput.addEventListener('change', updateRegionBasedOnCoordinates);
    
    // Also update when paste event occurs
    latitudeInput.addEventListener('paste', () => {
        setTimeout(updateRegionBasedOnCoordinates, 100);
    });
    
    longitudeInput.addEventListener('paste', () => {
        setTimeout(updateRegionBasedOnCoordinates, 100);
    });
}

/**
 * Initializes the regions data in the utility
 * @param {Array} regions - Array of region objects
 */
function initMapUtilities(regions) {
    if (Array.isArray(regions) && regions.length > 0) {
        mapUtilRegions = regions;
        console.log('Map utilities initialized with regions:', regions.length);
    } else {
        console.warn('Failed to initialize map utilities: invalid regions data');
    }
} 