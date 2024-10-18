document.getElementById('course-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const formData = new FormData(this);
    const data = {
      courseName: formData.get('courseName'),
      teacher: formData.get('teacher'),
      students: Array.from(document.querySelectorAll('input[name="student"]:checked')).map(checkbox => checkbox.value), 
      startDate: formData.get('startDate'),
    };

    console.log('Sending data:', data); 

    try {
      const response = await fetch('http://localhost:3000/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      document.getElementById('response-message').textContent = result.message;
    } catch (error) {
      document.getElementById('response-message').textContent = 'Error: ' + error;
    }
});


window.onload = async function() {
    try {
        const teacherResponse = await fetch('http://localhost:3000/teachers');
        if (!teacherResponse.ok) {
            throw new Error('Failed to fetch teachers');
        }
        const teachers = await teacherResponse.json();

        const studentResponse = await fetch('http://localhost:3000/students');
        if (!studentResponse.ok) {
            throw new Error('Failed to fetch students');
        }
        const students = await studentResponse.json();

        const teacherSelect = document.getElementById('teacher');
        students.forEach(student => {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.name = 'student';
            checkbox.value = student.id;

            const label = document.createElement('label');
            label.textContent = student.name;

            const div = document.createElement('div');
            div.appendChild(checkbox);
            div.appendChild(label);
            document.getElementById('students').appendChild(div);
        });

        teachers.forEach(teacher => {
            const option = document.createElement('option');
            option.value = teacher.id;
            option.textContent = teacher.name;
            teacherSelect.appendChild(option);
        });

    } catch (error) {
        console.error('Error loading teachers or students:', error);
    }
};
