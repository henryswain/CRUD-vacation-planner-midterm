const api = 'http://127.0.0.1:8000/vacations';
const userapi = 'http://127.0.0.1:8000/users';
console.log("main.js is called")
let stopCounter = 0;
let currentVacationId = null;
let vacationModal = null;
let viewVacationModal = null;

document.addEventListener('DOMContentLoaded', function() {
  if (document.getElementById('vacationModal')) {
    vacationModal = new bootstrap.Modal(document.getElementById('vacationModal'));
  }
  
  if (document.getElementById('viewVacationModal')) {
    viewVacationModal = new bootstrap.Modal(document.getElementById('viewVacationModal'));
  }
  
  const saveVacationBtn = document.getElementById('save-vacation-btn');
  if (saveVacationBtn) {
    saveVacationBtn.addEventListener('click', saveVacation);
  }
  
  const addStopBtn = document.getElementById('add-stop-btn');
  if (addStopBtn) {
    addStopBtn.addEventListener('click', addStopInput);
  }
  
  const token = sessionStorage.getItem('accessToken');
  const username = sessionStorage.getItem('currentUsername');
  
  if (token && username) {
    updateUIForLoggedInUser(username);
    
    if (document.getElementById('vacation-rows')) {
      getVacations();
    }
  } else {
    const protectedPages = ['index.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage)) {
      window.location.href = './login.html';
    }
  }
});

function updateUIForLoggedInUser(username) {
  const loginButton = document.getElementById('login-signup-button-on-navbar');
  if (loginButton) {
    loginButton.textContent = username || 'Account';
    loginButton.href = 'javascript:void(0)';
    loginButton.onclick = logout;
  }
}

function logout() {
  sessionStorage.clear();
  
  window.location.href = './login.html';
}

function prepareNewVacation() {
  document.getElementById('vacationModalLabel').textContent = 'New Vacation';
  currentVacationId = null;
}

// Function to prepare edit form with vacation data
function prepareEditVacation(vacationId) {
  resetForm();
  
  document.getElementById('vacationModalLabel').textContent = 'Edit Vacation';
  currentVacationId = vacationId;
  
  const token = sessionStorage.getItem('accessToken');
  if (!token) {
    console.error('No authentication token found');
    window.location.href = './login.html';
    return;
  }
  
  // Fetch vacation data
  fetch(`${api}/${vacationId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
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
      if (error.message.includes('401')) {
        sessionStorage.clear();
        window.location.href = './login.html';
      } else {
        alert('Error loading vacation data');
      }
    });
}

// Function to view vacation details
function viewVacation(vacationId) {
  const token = sessionStorage.getItem('accessToken');
  if (!token) {
    console.error('No authentication token found');
    window.location.href = './login.html';
    return;
  }
  
  fetch(`${api}/${vacationId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(vacation => {
      // Store the current vacation ID for edit button
      currentVacationId = vacation._id;
      
      // Populate the view modal
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
      if (error.message.includes('401')) {
        sessionStorage.clear();
        window.location.href = './login.html';
      } else {
        alert('Error loading vacation data');
      }
    });
}

// Function to handle transitioning from view to edit
function editVacation() {
  console.log("editVacation called")
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
  const token = sessionStorage.getItem('accessToken');
  if (!token) {
    console.error('No authentication token found');
    window.location.href = './login.html';
    return;
  }
  
  fetch(api, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
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
    resetForm();
    vacationModal.hide();
    getVacations();
  })
  .catch(error => {
    console.error('Error creating vacation:', error);
    if (error.message.includes('401')) {
      sessionStorage.clear();
      window.location.href = './login.html';
    } else {
      alert('Error creating vacation');
    }
  });
}

// Function to update an existing vacation
function updateVacation(id, vacationData) {
  const token = sessionStorage.getItem('accessToken');
  if (!token) {
    console.error('No authentication token found');
    window.location.href = './login.html';
    return;
  }

  fetch(`${api}/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
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
    resetForm();
    vacationModal.hide();
    getVacations();
  })
  .catch(error => {
    console.error('Error updating vacation:', error);
    if (error.message.includes('401')) {
      sessionStorage.clear();
      window.location.href = './login.html';
    } else {
      alert('Error updating vacation');
    }
  });
}

// Function to delete a vacation
function deleteVacation(id) {
  if (!confirm('Are you sure you want to delete this vacation?')) {
    return;
  }
  
  const token = sessionStorage.getItem('accessToken');
  if (!token) {
    console.error('No authentication token found');
    window.location.href = './login.html';
    return;
  }
  
  fetch(`${api}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    getVacations();
  })
  .catch(error => {
    console.error('Error deleting vacation:', error);
    if (error.message.includes('401')) {
      sessionStorage.clear();
      window.location.href = './login.html';
    } else if (error.message.includes('403')) {
      alert('You do not have permission to delete this vacation');
    } else {
      alert('Error deleting vacation');
    }
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
  if (!tbody) return;
  
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
          <button onClick="viewVacation('${vacation._id}')" type="button" class="btn btn-info">View</button>
          <button onClick="prepareEditVacation('${vacation._id}')" type="button" class="btn btn-warning">Edit</button>
          <button onClick="deleteVacation('${vacation._id}')" type="button" class="btn btn-danger">Delete</button>
        </div>
      </td>
    </tr>`;
  });
  
  tbody.innerHTML = rows.join('');
}

// Function to get all vacations
function getVacations() {
  console.log("getVacations called")
  const token = sessionStorage.getItem('accessToken');
  if (!token) {
    console.error('No authentication token found');
    window.location.href = './login.html';
    return;
  }
  
  fetch(`${api}/my`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    method: 'GET'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      displayVacations(data);
    })
    .catch(error => {
      console.error('Error loading vacations:', error);
      if (error.message.includes('401')) {
        sessionStorage.clear();
        window.location.href = './login.html';
      } else {
        alert('Error loading vacations');
      }
    });
}

// Function to handle login
function login(existingUserCredentials) {
  console.log("login called");
  
  // Create form data for OAuth2 password flow
  const formData = new FormData();
  formData.append('username', existingUserCredentials.username);
  formData.append('password', existingUserCredentials.password);
  
  fetch(`${userapi}/login`, {
    method: 'POST',
    body: formData
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    // Store auth token and user info in sessionStorage
    sessionStorage.setItem('accessToken', data.access_token);
    sessionStorage.setItem('currentUsername', data.username);
    sessionStorage.setItem('userRole', data.role || 'BasicUser');
    
    // Redirect to vacation planner
    window.location.href = './index.html';
  })
  .catch(error => {
    console.error('Login error:', error);
    document.getElementById("errorMessageSignup").innerHTML = "Login failed: " + error.message;
  });
  
  // Clear form fields
  document.getElementById("password-login").value = "";
  document.getElementById("username-login").value = "";
}

// Function to handle signup
function signup(newUserCredentials) {
  console.log("signup called");
  
  fetch(`${userapi}/sign-up`, {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify(newUserCredentials)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    // After successful signup, automatically log in
    login({
      username: newUserCredentials.username,
      password: newUserCredentials.password
    });
  })
  .catch(error => {
    console.error('Signup error:', error);
    document.getElementById("errorMessageSignup").innerHTML = "Sign up failed: " + error.message;
  });
  
  // Clear form fields
  document.getElementById("password-signup").value = "";
  document.getElementById("username-signup").value = "";
  document.getElementById("inputEmail").value = "";
}