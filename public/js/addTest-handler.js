$(document).ready(function () {
  const token = localStorage.getItem('token');
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('courseId');

  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  const $form = $('#add-test-form');
  $form.on('submit', function (event) {
    event.preventDefault();

    const testForm = $('#testForm').val();
    const testWeight = $('#testWeight').val(); // Получаем значение веса теста
    const testDate = $('#testDate').val();

    $.ajax({
      url: `http://localhost:3000/courses/${courseId}/add-test`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({ name: testForm, weight: testWeight, date: testDate }),
      success: function (data) {
        displayMessage(data.message, 'success');
        $form[0].reset(); // Сбрасываем форму
      },
      error: function (xhr) {
        const errorMessage = xhr.responseJSON?.message || 'Failed to add test.';
        displayMessage(errorMessage, 'danger');
      }
    });
  });

  function displayMessage(message, type) {
    const $messageDiv = $('#message-container');
    $messageDiv.text(message)
        .removeClass()
        .addClass(`alert alert-${type}`)
        .removeClass('d-none');

    setTimeout(() => {
      $messageDiv.addClass('d-none');
    }, 3000);
  }
});
