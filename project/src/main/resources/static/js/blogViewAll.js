document.addEventListener('DOMContentLoaded', function() {
    const viewAllButton = document.getElementById('viewAllBlogs');
    const blogGrid = document.getElementById('blogGrid');
    let blogs = [];
    let isExpanded = false;
    const MAX_VISIBLE = 3; // số bài mặc định

    // Hàm render lại UI
    function renderBlogs() {
        blogGrid.innerHTML = '';
        const blogsToShow = isExpanded ? blogs : blogs.slice(0, MAX_VISIBLE);
        blogsToShow.forEach(blog => {
            const blogCard = document.createElement('div');
            blogCard.className = 'blog-card';
            blogCard.innerHTML = `
                <div class="blog-image">
                    <img src="${blog.imageUrl || 'img/blog1.jpg'}" alt="${blog.title}">
                    <div class="blog-category">${blog.category || ''}</div>
                </div>
                <div class="blog-content">
                    <div class="blog-date">${formatDate(blog.date)}</div>
                    <h3>${blog.title}</h3>
                    <p>${blog.summary}</p>
                    <a href="blog-detail.html?id=${blog.id}" class="read-more">Đọc thêm <i class="fas fa-arrow-right"></i></a>
                </div>
            `;
            blogGrid.appendChild(blogCard);
        });
    }

    // Hàm format date "2024-06-12" => "12 Tháng 6, 2024"
    function formatDate(dateStr) {
        if (!dateStr) return '';
        const [y, m, d] = dateStr.split('-');
        return `${parseInt(d)} Tháng ${parseInt(m)}, ${y}`;
    }

    // Fetch data từ API khi load trang
    fetch('/api/posts')
        .then(res => res.json())
        .then(data => {
            blogs = data || [];
            renderBlogs();
            if (viewAllButton) viewAllButton.style.display = blogs.length > MAX_VISIBLE ? 'inline-block' : 'none';
        })
        .catch(() => {
            blogGrid.innerHTML = '<p>Không tải được bài viết!</p>';
        });

    // Nút xem tất cả bài viết
    if (viewAllButton) {
        viewAllButton.addEventListener('click', function(e) {
            e.preventDefault();
            isExpanded = !isExpanded;
            renderBlogs();
            viewAllButton.textContent = isExpanded ? 'Thu gọn' : 'Xem tất cả bài viết';
        });
    }

    // Nếu cần, có thể gắn lại sự kiện click cho .read-more sau khi render xong
    // Nhưng nếu chỉ link thì khỏi, browser tự chuyển trang

});
