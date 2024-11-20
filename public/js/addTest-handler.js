document.addEventListener('DOMContentLoaded', function() {
  const token = localStorage.getItem('token');
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('courseId');

  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  const form = document.getElementById('add-test-form');
  form.addEventListener('submit', function(event) {
    event.preventDefault();

    const testForm = document.getElementById('testForm').value;
    const testWeight = document.getElementById('testWeight').value;  // Pobierz wybraną wagę testu
    const testDate = document.getElementById('testDate').value;

    fetch(`http://localhost:3000/courses/${courseId}/add-test`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: testForm, weight: testWeight, date: testDate })
    })
    .then(async (response) => {
      const data = await response.json();

      if (response.ok) {
        displayMessage(data.message, 'success');
        form.reset();
      } else {
        displayMessage(data.message, 'danger');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      displayMessage('Failed to add test.', 'danger');
    });
  });
});

function displayMessage(message, type) {
  const messageDiv = document.getElementById('message-container');
  messageDiv.textContent = message;
  messageDiv.className = `alert alert-${type}`;
  messageDiv.classList.remove('d-none');

  setTimeout(() => {
    messageDiv.classList.add('d-none');
  }, 3000);
}
