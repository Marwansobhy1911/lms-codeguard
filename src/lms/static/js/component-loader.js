async function loadComponents() {
    const components = [
        { id: 'header-container', url: '/includes/header.html' },
        { id: 'modals-container', url: '/includes/modals.html' },
        { id: 'dashboard-nav-container', url: '/includes/dashboard-nav.html' },
        { id: 'login-container', url: '/includes/views/login.html' },
        { id: 'student-container', url: '/includes/views/student.html' },
        { id: 'hr-container', url: '/includes/views/hr.html' },
        { id: 'media-container', url: '/includes/views/media.html' },
        { id: 'supporter-container', url: '/includes/views/supporter.html' },
        { id: 'instructor-container', url: '/includes/views/instructor.html' },
        { id: 'admin-container', url: '/includes/views/admin.html' },
        { id: 'cheating-container', url: '/includes/views/cheating.html' }
    ];

    await Promise.all(components.map(async (comp) => {
        const el = document.getElementById(comp.id);
        if (el) {
            try {
                const response = await fetch(comp.url);
                if (response.ok) {
                    const html = await response.text();
                    el.innerHTML = html;
                } else {
                    console.error('Failed to load ' + comp.url + ': ' + response.statusText);
                }
            } catch (err) {
                console.error('Error loading ' + comp.url, err);
            }
        }
    }));
}