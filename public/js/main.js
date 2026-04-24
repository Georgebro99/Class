// Tab switching
function switchTab(tabName) {
  const tabs = document.querySelectorAll('.tab-content');
  const buttons = document.querySelectorAll('.tab');

  tabs.forEach(tab => {
    tab.style.display = 'none';
  });

  buttons.forEach(btn => {
    btn.classList.remove('active');
  });

  const activeTab = document.getElementById(tabName);
  if (activeTab) {
    activeTab.style.display = 'block';
  }

  event.target.classList.add('active');
}

// Submit assignment
function submitAssignment(assignmentId) {
  const textarea = document.getElementById(`submission-${assignmentId}`);
  const content = textarea.value.trim();

  if (!content) {
    alert('Please enter your submission');
    return;
  }

  fetch(`/student/submit/${assignmentId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ submissionText: content })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert('Assignment submitted successfully!');
      textarea.value = '';
      location.reload();
    } else {
      alert('Error: ' + data.error);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Failed to submit assignment');
  });
}

// Grade assignment
function gradeSubmission(submissionId, assignmentId) {
  const points = prompt('Enter points:');
  const feedback = prompt('Enter feedback:');

  if (points !== null && feedback !== null) {
    fetch(`/assignments/${assignmentId}/grade/${submissionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ points, feedback })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Submission graded!');
        location.reload();
      } else {
        alert('Error: ' + data.error);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Failed to grade submission');
    });
  }
}

// Confirm delete
function confirmDelete(message) {
  return confirm(message || 'Are you sure?');
}
