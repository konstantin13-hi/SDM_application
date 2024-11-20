
export function loadNavbar() {


    const navbar = `
        <nav class="navbar navbar-expand-lg navbar-light">
            <a class="navbar-brand" href="/views/homePage">My App</a>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav">
                    <li class="nav-item">
                        <a class="nav-link text-white" href="/views/addStudentPage">Add student</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link text-white" href="/views/addCoursePage.html">Add Course</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link text-white" href="/views/coursesPage.html">My Courses</a>
                    </li>
                </ul>
                <span class="navbar-text ml-auto">
                    <i class="settings-icon" data-toggle="modal" data-target="#settingsModal" title="Settings">Settings</i>
                </span>
            </div>
        </nav>
    `;
    document.getElementById('navbar-placeholder').innerHTML = navbar;
}
