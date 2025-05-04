// Global variables
let map
let markers = []
let infoWindow
let regions = []

// Initialize map
function initMap() {
  // Center of Ukraine
  const ukraine = { lat: 49.0139, lng: 31.2858 }

  // Create map
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 6,
    center: ukraine,
    mapTypeId: "roadmap",
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
      position: google.maps.ControlPosition.TOP_LEFT,
    },
    fullscreenControl: false,
  })

  // Create info window
  infoWindow = new google.maps.InfoWindow()

  // Load regions and explosive objects
  loadRegions().then(() => {
    loadExplosiveObjects()
  })

  // Add event listeners for map control buttons
  const zoomInBtn = document.getElementById("zoomIn")
  if (zoomInBtn) {
    zoomInBtn.addEventListener("click", () => {
      map.setZoom(map.getZoom() + 1)
    })
  }

  const zoomOutBtn = document.getElementById("zoomOut")
  if (zoomOutBtn) {
    zoomOutBtn.addEventListener("click", () => {
      map.setZoom(map.getZoom() - 1)
    })
  }

  const layersBtn = document.getElementById("layers")
  if (layersBtn) {
    layersBtn.addEventListener("click", toggleLayers)
  }
  const routeBtn = document.getElementById("route")
  if (routeBtn) {
    routeBtn.addEventListener("click", calculateRoute)
  }

  // Add click event for adding objects at clicked location
  const addObjectModal = document.getElementById("addObjectModal");
  if (map && addObjectModal) {
    map.addListener("click", (event) => {
      const lat = event.latLng.lat()
      const lng = event.latLng.lng()

      // Set coordinates in the form
      const latitudeInput = document.getElementById("latitude");
      const longitudeInput = document.getElementById("longitude");
      
      if (latitudeInput) latitudeInput.value = lat;
      if (longitudeInput) longitudeInput.value = lng;

      // Open modal
      new bootstrap.Modal(addObjectModal).show()
    })
  }

  // Add event listener for saving objects
  const saveObjectBtn = document.getElementById("saveObject");
  if (saveObjectBtn) {
    saveObjectBtn.addEventListener("click", saveObject);
  }
}

// Load regions from API
async function loadRegions() {
  try {
    // Instead of loading from API, use hardcoded list of all Ukrainian regions
    regions = [
      { id: 1, name: 'Київ', code: 'kyiv', center_lat: 50.450001, center_lng: 30.523333, zoom_level: 10 },
      { id: 2, name: 'Харків', code: 'kharkiv', center_lat: 49.992599, center_lng: 36.231078, zoom_level: 10 },
      { id: 3, name: 'Львів', code: 'lviv', center_lat: 49.839683, center_lng: 24.029717, zoom_level: 10 },
      { id: 4, name: 'Одеса', code: 'odesa', center_lat: 46.482526, center_lng: 30.723310, zoom_level: 10 },
      { id: 5, name: 'Дніпро', code: 'dnipro', center_lat: 48.464700, center_lng: 35.046200, zoom_level: 10 },
      { id: 6, name: 'Запоріжжя', code: 'zaporizhia', center_lat: 47.838800, center_lng: 35.139600, zoom_level: 10 },
      { id: 7, name: 'Вінниця', code: 'vinnytsia', center_lat: 49.232800, center_lng: 28.480970, zoom_level: 10 },
      { id: 8, name: 'Черкаси', code: 'cherkasy', center_lat: 49.444430, center_lng: 32.059770, zoom_level: 10 },
      { id: 9, name: 'Полтава', code: 'poltava', center_lat: 49.588270, center_lng: 34.551420, zoom_level: 10 },
      { id: 10, name: 'Чернігів', code: 'chernihiv', center_lat: 51.498200, center_lng: 31.289350, zoom_level: 10 },
      { id: 11, name: 'Суми', code: 'sumy', center_lat: 50.907700, center_lng: 34.798100, zoom_level: 10 },
      { id: 12, name: 'Житомир', code: 'zhytomyr', center_lat: 50.254650, center_lng: 28.658670, zoom_level: 10 },
      { id: 13, name: 'Ужгород', code: 'uzhhorod', center_lat: 48.620800, center_lng: 22.287880, zoom_level: 10 },
      { id: 14, name: 'Чернівці', code: 'chernivtsi', center_lat: 48.291490, center_lng: 25.935840, zoom_level: 10 },
      { id: 15, name: 'Тернопіль', code: 'ternopil', center_lat: 49.553520, center_lng: 25.594767, zoom_level: 10 },
      { id: 16, name: 'Хмельницький', code: 'khmelnytskyi', center_lat: 49.421630, center_lng: 26.996530, zoom_level: 10 },
      { id: 17, name: 'Івано-Франківськ', code: 'ivano-frankivsk', center_lat: 48.922630, center_lng: 24.711110, zoom_level: 10 },
      { id: 18, name: 'Луцьк', code: 'lutsk', center_lat: 50.747230, center_lng: 25.325380, zoom_level: 10 },
      { id: 19, name: 'Рівне', code: 'rivne', center_lat: 50.619900, center_lng: 26.251600, zoom_level: 10 },
      { id: 20, name: 'Миколаїв', code: 'mykolaiv', center_lat: 46.975870, center_lng: 31.994580, zoom_level: 10 },
      { id: 21, name: 'Херсон', code: 'kherson', center_lat: 46.635420, center_lng: 32.616870, zoom_level: 10 },
      { id: 22, name: 'Кропивницький', code: 'kirovohrad', center_lat: 48.507933, center_lng: 32.262317, zoom_level: 10 },
      { id: 23, name: 'Сєвєродонецьк', code: 'severodonetsk', center_lat: 48.948230, center_lng: 38.486050, zoom_level: 10 },
      { id: 24, name: 'Донецьк', code: 'donetsk', center_lat: 48.015880, center_lng: 37.802850, zoom_level: 10 },
      { id: 25, name: 'Луганськ', code: 'luhansk', center_lat: 48.574041, center_lng: 39.307815, zoom_level: 10 },
      { id: 26, name: 'Сімферополь', code: 'simferopol', center_lat: 44.952117, center_lng: 34.102417, zoom_level: 10 }
    ];

    // Populate region select in form
    const regionSelect = document.getElementById("region")
    if (regionSelect) {
      regionSelect.innerHTML = ""
      regions.forEach((region) => {
        const option = document.createElement("option")
        option.value = region.id
        option.textContent = region.name
        regionSelect.appendChild(option)
      })
    }
    
    // Populate region filter dropdown
    const regionFilter = document.getElementById("regionFilter")
    if (regionFilter) {
      // Keep the "All regions" option
      const allOption = regionFilter.querySelector('option[value="all"]')
      regionFilter.innerHTML = ''
      regionFilter.appendChild(allOption)
      
      // Add all regions
      regions.forEach((region) => {
        const option = document.createElement("option")
        option.value = region.id
        option.textContent = region.name
        regionFilter.appendChild(option)
      })
      
      // Add event listener for filtering
      regionFilter.addEventListener('change', filterMarkersByRegion)
    }
  } catch (error) {
    console.error("Error loading regions:", error)
  }
}

// Filter markers by selected region
function filterMarkersByRegion() {
  const regionFilter = document.getElementById("regionFilter")
  if (!regionFilter) return
  
  const selectedRegionId = regionFilter.value
  
  // Show all markers if "All regions" is selected
  if (selectedRegionId === 'all') {
    markers.forEach((marker) => {
      if (marker instanceof google.maps.Marker) {
        marker.setMap(map)
      } else if (marker instanceof google.maps.marker.AdvancedMarkerElement) {
        marker.map = map
      }
    })
    return
  }
  
  // Filter markers by region ID
  markers.forEach((marker, index) => {
    const obj = explosiveObjects[index]
    if (!obj) return
    
    const show = obj.region_id.toString() === selectedRegionId
    
    if (marker instanceof google.maps.Marker) {
      marker.setMap(show ? map : null)
    } else if (marker instanceof google.maps.marker.AdvancedMarkerElement) {
      marker.map = show ? map : null
    }
  })
}

// Load explosive objects from API
async function loadExplosiveObjects() {
  try {
    const response = await fetch("/api/explosive-objects")
    const objects = await response.json()

    // Clear existing markers
    clearMarkers()

    // Add markers to map
    objects.forEach((obj) => {
      addMarker(obj)
    })
  } catch (error) {
    console.error("Error loading explosive objects:", error)
  }
}

// Add marker to map
function addMarker(obj) {
  // Determine marker icon based on status
  let markerIcon;
  
  if (obj.status === 'mined') {
    // Use custom red flag icon
    markerIcon = {
      url: "/static/images/flag_red.png",
      scaledSize: new google.maps.Size(32, 32)
    };
  } else {
    // Use colored circle for other statuses
    const markerColor = getMarkerColor(obj.status);
    markerIcon = {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: markerColor,
      fillOpacity: 0.9,
      strokeWeight: 1,
      strokeColor: "#ffffff",
      scale: 10,
    };
  }

  let marker;
  
  // Check if AdvancedMarkerElement is available
  if (google.maps.marker && google.maps.marker.AdvancedMarkerElement) {
    // Create a div element for the marker content
    const markerContent = document.createElement('div');
    
    if (obj.status === 'mined') {
      // For dangerous objects, use the flag image
      const img = document.createElement('img');
      img.src = "/static/images/flag_red.png";
      img.style.width = '32px';
      img.style.height = '32px';
      markerContent.appendChild(img);
    } else {
      // For other statuses, create a colored circle
      markerContent.style.width = '20px';
      markerContent.style.height = '20px';
      markerContent.style.borderRadius = '50%';
      markerContent.style.backgroundColor = getMarkerColor(obj.status);
      markerContent.style.border = '2px solid white';
    }
    
    // Create an AdvancedMarkerElement
    marker = new google.maps.marker.AdvancedMarkerElement({
      position: { lat: obj.latitude, lng: obj.longitude },
      map: map,
      title: obj.title,
      content: markerContent
    });
  } else {
    // Fallback to regular Marker for backward compatibility
    marker = new google.maps.Marker({
      position: { lat: obj.latitude, lng: obj.longitude },
      map: map,
      title: obj.title,
      icon: markerIcon
    });
  }

  // Add click event listener for info window
  marker.addEventListener ? 
    marker.addEventListener("click", showInfoWindow) : 
    marker.addListener("click", showInfoWindow);
    
  function showInfoWindow() {
    const content = `
            <div style="padding: 10px;">
                <h5 style="margin-top: 0;">${obj.title}</h5>
                <p style="margin-bottom: 5px;"><strong>Статус:</strong> ${getStatusText(obj.status)}</p>
                <p style="margin-bottom: 5px;"><strong>Пріоритет:</strong> ${getPriorityText(obj.priority)}</p>
                <p style="margin-bottom: 5px;"><strong>Регіон:</strong> ${obj.region_name}</p>
                <p style="margin-bottom: 5px;"><strong>Дата виявлення:</strong> ${new Date(obj.reported_at).toLocaleDateString("uk-UA")}</p>
                <p>${obj.description || "Опис відсутній"}</p>
                <button onclick="showDetails(${obj.id})" class="btn btn-sm btn-primary">Деталі</button>
            </div>
        `

    infoWindow.setContent(content)
    infoWindow.open(map, marker)
  }

  // Add marker to array
  markers.push(marker)
}

// Clear all markers from map
function clearMarkers() {
  markers.forEach((marker) => {
    if (marker instanceof google.maps.Marker) {
      marker.setMap(null);
    } else if (marker instanceof google.maps.marker.AdvancedMarkerElement) {
      marker.map = null;
    }
  })
  markers = []
}

// Get marker color based on status
function getMarkerColor(status) {
  switch (status) {
    case "secret":
      return "#8b5cf6" // Purple
    case "mined":
      return "#ef4444" // Red
    case "unconfirmed":
      return "#f59e0b" // Yellow
    case "archived":
      return "#6b7280" // Gray
    case "demined":
      return "#10b981" // Green
    default:
      return "#3b82f6" // Blue (default)
  }
}

// Get status text
function getStatusText(status) {
  switch (status) {
    case "secret":
      return "Секретна"
    case "mined":
      return "Замінована"
    case "unconfirmed":
      return "Непідтверджена"
    case "archived":
      return "Архів"
    case "demined":
      return "Розмінована"
    default:
      return "Невідомо"
  }
}

// Get priority text
function getPriorityText(priority) {
  switch (priority) {
    case "high":
      return "Високий"
    case "medium":
      return "Середній"
    case "low":
      return "Низький"
    default:
      return "Невідомо"
  }
}

// Toggle map layers
function toggleLayers() {
  // Add logic for toggling map layers
  alert("Функціонал перемикання шарів у розробці")
}

// Calculate route
function calculateRoute() {
  // Add logic for calculating optimal route
  alert("Функціонал розрахунку маршруту у розробці")
}

// Show object details
function showDetails(id) {
  // Add logic for showing detailed information about object
  window.location.href = `/object/${id}`
}

// Save new object
async function saveObject() {
  const title = document.getElementById("title").value
  const description = document.getElementById("description").value
  const latitude = Number.parseFloat(document.getElementById("latitude").value)
  const longitude = Number.parseFloat(document.getElementById("longitude").value)
  const status = document.getElementById("status").value
  const priority = document.getElementById("priority").value
  const region_id = Number.parseInt(document.getElementById("region").value)

  const objectData = {
    title,
    description,
    latitude,
    longitude,
    status,
    priority,
    region_id,
  }

  try {
    const response = await fetch("/api/explosive-objects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(objectData),
    })

    if (response.ok) {
      const newObject = await response.json()

      // Add marker for new object
      addMarker(newObject)

      // Close modal
      const modal = bootstrap.Modal.getInstance(document.getElementById("addObjectModal"))
      modal.hide()

      // Reset form
      document.getElementById("addObjectForm").reset()

      // Show success message
      alert("Об'єкт успішно додано")
    } else {
      const error = await response.json()
      alert(`Помилка: ${error.detail}`)
    }
  } catch (error) {
    console.error("Error saving object:", error)
    alert("Помилка при збереженні об'єкта")
  }
}

// Get JWT token from cookies
function getToken() {
  const cookies = document.cookie.split(";")
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=")
    if (name === "access_token") {
      return value.replace("Bearer ", "")
    }
  }
  return null
}
