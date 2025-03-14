const api = 'http://127.0.0.1:8000/vacations';
let stopCounter = 0;
let currentVacationId = null;
let vacationModal = null;
let viewVacationModal = null;

// Initialize Bootstrap modals
document.addEventListener('DOMContentLoaded', function() {
  vacationModal = new bootstrap.Modal(document.getElementById('vacationModal'));
  viewVacationModal = new bootstrap.Modal(document.getElementById('viewVacationModal'));
  
  // Add event listener for the save button
  document.getElementById('save-vacation-btn').addEventListener('click', saveVacation);
  
  // Add event listener for adding stops
  document.getElementById('add-stop-btn').addEventListener('click', addStopInput);
  
  // Load vacations
  getVacations();
});

// Prepare form for a new vacation
function prepareNewVacation() {
  // Reset the form
  resetForm();
  document.getElementById('vacationModalLabel').textContent = 'New Vacation';
  currentVacationId = null;
}

// Function to prepare edit form with vacation data
function prepareEditVacation(vacationId) {
  resetForm();
  
  document.getElementById('vacationModalLabel').textContent = 'Edit Vacation';
  currentVacationId = vacationId;
  
  // Fetch vacation data
  fetch(`${api}/${vacationId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(vacation => {
      // Populate form with vacation data
      document.getElementById('vacation-id').value = vacation.id;
      document.getElementById('vacation-title').value = vacation.title;
      document.getElementById('vacation-desc').value = vacation.desc;
      
      // Add stop inputs for each existing stop
      if (vacation.stops && vacation.stops.length > 0) {
        vacation.stops.forEach(stop => {
          addStopInput(stop);
        });
      }
      
      // Show the modal
      vacationModal.show();
    })
    .catch(error => {
      console.error('Error fetching vacation:', error);
      alert('Error loading vacation data');
    });
}

// Function to view vacation details
function viewVacation(vacationId) {
  fetch(`${api}/${vacationId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(vacation => {
      // Store the current vacation ID for edit button
      currentVacationId = vacation.id;
      
      // Populate the view modal
      document.getElementById('view-vacation-title').textContent = `Vacation: ${vacation.title}`;
      document.getElementById('view-vacation-title').textContent = vacation.title;
      document.getElementById('view-vacation-desc').textContent = vacation.desc;
      
      // Display stops
      const stopsContainer = document.getElementById('view-stops-container');
      stopsContainer.innerHTML = '';
      
      if (vacation.stops && vacation.stops.length > 0) {
        const stopsListElement = document.createElement('div');
        stopsListElement.className = 'list-group';
        
        vacation.stops.forEach(stop => {
          const stopItem = document.createElement('div');
          stopItem.className = 'list-group-item';
          stopItem.innerHTML = `
            <div class="fw-bold">${stop.title}</div>
            <div>${stop.desc}</div>
          `;
          stopsListElement.appendChild(stopItem);
        });
        
        stopsContainer.appendChild(stopsListElement);
      } else {
        stopsContainer.innerHTML = '<p>No stops added for this vacation.</p>';
      }
      
      // Show the view modal
      viewVacationModal.show();
    })
    .catch(error => {
      console.error('Error fetching vacation:', error);
      alert('Error loading vacation data');
    });
}

// Function to handle transitioning from view to edit
function editVacation() {
  viewVacationModal.hide();
  prepareEditVacation(currentVacationId);
}

// Function to add a new stop input to the form
function addStopInput(existingStop = null) {
  stopCounter++;
  const stopsContainer = document.getElementById('stops-container');
  
  const stopDiv = document.createElement('div');
  stopDiv.className = 'stop-item card mb-3 p-3';
  stopDiv.id = `stop-${stopCounter}`;
  
  // If we have an existing stop, use its ID
  const stopId = existingStop ? existingStop.id : '';
  const stopTitle = existingStop ? existingStop.title : '';
  const stopDesc = existingStop ? existingStop.desc : '';
  
  stopDiv.innerHTML = `
    <input type="hidden" class="stop-id" value="${stopId}">
    <div class="d-flex justify-content-between mb-2">
      <h6>Stop #${stopCounter}</h6>
      <button type="button" class="btn btn-sm btn-danger" onclick="removeStop(${stopCounter})">Remove</button>
    </div>
    <div class="mb-3">
      <label for="stop-title-${stopCounter}" class="form-label">Stop Title</label>
      <input type="text" class="form-control stop-title" id="stop-title-${stopCounter}" value="${stopTitle}" />
    </div>
    <div class="mb-3">
      <label for="stop-desc-${stopCounter}" class="form-label">Stop Description</label>
      <textarea class="form-control stop-desc" id="stop-desc-${stopCounter}" rows="2">${stopDesc}</textarea>
    </div>
  `;
  
  stopsContainer.appendChild(stopDiv);
}

// Function to remove a stop
function removeStop(id) {
  const stopElement = document.getElementById(`stop-${id}`);
  if (stopElement) {
    stopElement.remove();
  }
}

// Function to collect all stops data from the form
function collectStopsData() {
  const stops = [];
  const stopElements = document.querySelectorAll('.stop-item');
  
  stopElements.forEach(element => {
    const stopId = element.querySelector('.stop-id').value;
    const title = element.querySelector('.stop-title').value;
    const desc = element.querySelector('.stop-desc').value;
    
    if (title.trim() !== '') {
      if (stopId) {
        stops.push({ id: parseInt(stopId), title, desc });
      } else {
        stops.push({ title, desc });
      }
    }
  });
  
  return stops;
}

// Function to save vacation (handles both create and update)
function saveVacation() {
  const title = document.getElementById('vacation-title').value;
  const desc = document.getElementById('vacation-desc').value;
  const stops = collectStopsData();
  
  if (!title.trim()) {
    alert('Vacation title is required');
    return;
  }
  
  const vacationData = { title, desc, stops };
  
  if (currentVacationId) {
    // Update existing vacation
    updateVacation(currentVacationId, vacationData);
  } else {
    // Create new vacation
    createVacation(vacationData);
  }
}

// Function to create a new vacation
function createVacation(vacationData) {
  fetch(api, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(vacationData)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('Vacation created:', data);
    resetForm();
    vacationModal.hide();
    getVacations();
  })
  .catch(error => {
    console.error('Error creating vacation:', error);
    alert('Error creating vacation');
  });
}

// Function to update an existing vacation
function updateVacation(id, vacationData) {
  fetch(`${api}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(vacationData)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('Vacation updated:', data);
    resetForm();
    vacationModal.hide();
    getVacations();
  })
  .catch(error => {
    console.error('Error updating vacation:', error);
    alert('Error updating vacation');
  });
}

// Function to delete a vacation
function deleteVacation(id) {
  if (!confirm('Are you sure you want to delete this vacation?')) {
    return;
  }
  
  fetch(`${api}/${id}`, {
    method: 'DELETE'
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('Vacation deleted:', data);
    getVacations();
  })
  .catch(error => {
    console.error('Error deleting vacation:', error);
    alert('Error deleting vacation');
  });
}

// Function to reset the form after submission
function resetForm() {
  document.getElementById('vacation-id').value = '';
  document.getElementById('vacation-title').value = '';
  document.getElementById('vacation-desc').value = '';
  document.getElementById('stops-container').innerHTML = '';
  stopCounter = 0;
}

// Function to display vacations in the table
function displayVacations(vacations) {
  const tbody = document.getElementById('vacation-rows');
  tbody.innerHTML = '';
  
  if (vacations.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">No vacations planned yet. Add one!</td></tr>';
    return;
  }
  
  const rows = vacations.map((vacation) => {
    // Format stops for display
    let stopsDisplay = 'None';
    if (vacation.stops && vacation.stops.length > 0) {
      stopsDisplay = `<ul class="mb-0 ps-3">
        ${vacation.stops.map(stop => `<li>${stop.title}</li>`).join('')}
      </ul>`;
    }
    
    return `<tr>
      <td>${vacation.title}</td>
      <td>${vacation.desc}</td>
      <td>${stopsDisplay}</td>
      <td>
        <div class="btn-group btn-group-sm" role="group">
          <button onClick="viewVacation(${vacation.id})" type="button" class="btn btn-info">View</button>
          <button onClick="prepareEditVacation(${vacation.id})" type="button" class="btn btn-warning">Edit</button>
          <button onClick="deleteVacation(${vacation.id})" type="button" class="btn btn-danger">Delete</button>
        </div>
      </td>
    </tr>`;
  });
  
  tbody.innerHTML = rows.join('');
}

// Function to get all vacations
function getVacations() {
  fetch(api)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Vacations loaded:', data);
      displayVacations(data);
    })
    .catch(error => {
      console.error('Error loading vacations:', error);
      alert('Error loading vacations');
    });
}