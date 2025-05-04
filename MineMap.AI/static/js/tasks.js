// Fetch and display tasks for sapper
async function loadTasks() {
  const tbody = document.getElementById('tasksTable');
  if (!tbody) return;
  tbody.innerHTML = '';
  try {
    const response = await fetch('/api/explosive-objects');
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = '<td colspan="8" class="text-center">Немає даних про вибухонебезпечні об\'єкти</td>';
      tbody.appendChild(row);
    } else {
      data.forEach(obj => {
        const tr = document.createElement('tr');
        // Status badge
        const statusText = getStatusText(obj.status);
        const statusColor = getStatusColor(obj.status);
        // Priority badge
        const prText = getPriorityText(obj.priority);
        const prColor = getPriorityColor(obj.priority);
        tr.innerHTML = `
          <td>${obj.id}</td>
          <td>${obj.title || '-'}</td>
          <td><span class="status-badge" style="background-color:${statusColor}">${statusText}</span></td>
          <td><span class="priority-badge" style="background-color:${prColor}">${prText}</span></td>
          <td>${obj.region_name || '-'}</td>
          <td>${formatDate(obj.reported_at)}</td>
          <td>${obj.reported_by_username || '-'}</td>
          <td><button class="btn btn-sm btn-primary view-task" data-id="${obj.id}"><i class="bi bi-eye"></i></button></td>
        `;
        tbody.appendChild(tr);
      });
      // add click handlers
      document.querySelectorAll('.view-task').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          window.location.href = `/object/${id}`;
        });
      });
    }
  } catch (error) {
    console.error('Error loading tasks:', error);
    const row = document.createElement('tr');
    row.innerHTML = `<td colspan="8" class="text-center">Помилка завантаження даних</td>`;
    tbody.appendChild(row);
  }
}

// Helpers
function getStatusText(status) {
  switch (status) {
    case 'secret': return 'Секретна';
    case 'mined': return 'Замінована';
    case 'unconfirmed': return 'Непідтверджена';
    case 'archived': return 'Архів';
    case 'demined': return 'Розмінована';
    default: return 'Невідомо';
  }
}
function getStatusColor(status) {
  switch (status) {
    case 'secret': return '#8b5cf6';
    case 'mined': return '#ef4444';
    case 'unconfirmed': return '#f59e0b';
    case 'archived': return '#6b7280';
    case 'demined': return '#10b981';
    default: return '#6c757d';
  }
}
function getPriorityText(priority) {
  switch (priority) {
    case 'high': return 'Високий';
    case 'medium': return 'Середній';
    case 'low': return 'Низький';
    default: return 'Невідомо';
  }
}
function getPriorityColor(priority) {
  switch (priority) {
    case 'high': return '#dc3545';
    case 'medium': return '#fd7e14';
    case 'low': return '#20c997';
    default: return '#6c757d';
  }
}
function formatDate(dateString) {
  if (!dateString) return '-';
  const d = new Date(dateString);
  const options = { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' };
  return d.toLocaleString('uk-UA', options);
}

// Init
document.addEventListener('DOMContentLoaded', loadTasks); 