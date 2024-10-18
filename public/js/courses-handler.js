document.addEventListener('DOMContentLoaded', async function() {
    try {
      // Zmiana na pełny adres URL z hostem i portem
      const response = await fetch('http://localhost:3000/courses');
      const courses = await response.json();
  
      const coursesList = document.getElementById('courses-list');
  
      if (courses.length === 0) {
        coursesList.innerHTML = '<p>No courses available at the moment.</p>';
        return;
      }
  
      // Dynamicznie tworzymy karty kursów
      courses.forEach(course => {
        const courseCard = document.createElement('div');
        courseCard.className = 'col-md-4 course-card';
  
        courseCard.innerHTML = `
          <div class="card">
            <div class="card-body">
              <h5 class="card-title course-name">${course.name}</h5>
              <p class="card-text course-teacher">Teacher: ${course.teacherName}</p>
              <p class="card-text course-date">Start Date: ${new Date(course.start_date).toLocaleDateString()}</p>
            </div>
          </div>
        `;
  
        coursesList.appendChild(courseCard);
      });
  
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  });
      

