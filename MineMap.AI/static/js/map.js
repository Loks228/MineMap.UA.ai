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
  document.getElementById("zoomIn").addEventListener("click", () => {
    map.setZoom(map.getZoom() + 1)
  })

  document.getElementById("zoomOut").addEventListener("click", () => {
    map.setZoom(map.getZoom() - 1)
  })

  document.getElementById("layers").addEventListener("click", toggleLayers)
  document.getElementById("route").addEventListener("click", calculateRoute)

  // Add click event for adding objects at clicked location
  map.addListener("click", (event) => {
    const lat = event.latLng.lat()
    const lng = event.latLng.lng()

    // Set coordinates in the form
    document.getElementById("latitude").value = lat
    document.getElementById("longitude").value = lng

    // Open modal
    new bootstrap.Modal(document.getElementById("addObjectModal")).show()
  })

  // Add event listener for saving objects
  document.getElementById("saveObject").addEventListener("click", saveObject)
}

// Load regions from API
async function loadRegions() {
  try {
    const response = await fetch("/api/regions")
    regions = await response.json()

    // Populate region select in form
    const regionSelect = document.getElementById("region")
    regionSelect.innerHTML = ""

    regions.forEach((region) => {
      const option = document.createElement("option")
      option.value = region.id
      option.textContent = region.name
      regionSelect.appendChild(option)
    })
  } catch (error) {
    console.error("Error loading regions:", error)
  }
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
  // Determine marker color based on status
  const markerColor = getMarkerColor(obj.status)

  // Create marker
  const marker = new google.maps.Marker({
    position: { lat: obj.latitude, lng: obj.longitude },
    map: map,
    title: obj.title,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: markerColor,
      fillOpacity: 0.9,
      strokeWeight: 1,
      strokeColor: "#ffffff",
      scale: 10,
    },
  })

  // Add click event listener for info window
  marker.addListener("click", () => {
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
  })

  // Add marker to array
  markers.push(marker)
}

// Clear all markers from map
function clearMarkers() {
  markers.forEach((marker) => {
    marker.setMap(null)
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
