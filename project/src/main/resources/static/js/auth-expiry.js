// Hàm lưu localStorage có thời hạn (ms)
function setWithExpiry(key, value, ttlMs) {
    const now = Date.now();
    const item = {
        value: value,
        expiry: now + ttlMs
    };
    localStorage.setItem(key, JSON.stringify(item));
}

// Hàm lấy localStorage có kiểm tra hết hạn
function getWithExpiry(key) {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;
    try {
        const item = JSON.parse(itemStr);
        if (!item.expiry) return item.value;
        if (Date.now() > item.expiry) {
            localStorage.removeItem(key);
            return null;
        }
        return item.value;
    } catch {
        return null;
    }
}

// Chặn truy cập các trang cần đăng nhập nếu chưa đăng nhập
const loginRequiredPages = [
    '/dashboard.html',
    '/ho-so-ca-nhan.html',
    '/lich-dieu-tri.html'
    // Thêm các trang cần bảo vệ khác nếu có
];

// Kiểm tra chính xác pathname kết thúc bằng tên file cần bảo vệ
if (loginRequiredPages.some(page => window.location.pathname.endsWith(page))) {
    if (!getWithExpiry('userFullName')) {
        window.location.href = "index.html";
    }
}