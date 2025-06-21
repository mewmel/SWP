const loginRequiredPages = [
    '/dashboard.html',
    '/ho-so-ca-nhan.html',
    '/lich-dieu-tri.html'
    // ... các trang cần bảo vệ khác
];

if (loginRequiredPages.some(page => window.location.pathname.endsWith(page))) {
    if (!localStorage.getItem('userFullName')) {
        window.location.href = "index.html";
    }
}