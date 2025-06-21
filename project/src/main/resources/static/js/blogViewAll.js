document.addEventListener('DOMContentLoaded', function() {
    const viewAllButton = document.getElementById('viewAllBlogs');
    const blogGrid = document.getElementById('blogGrid');
    const hiddenBlogs = document.querySelectorAll('.blog-card.hidden');
    let isExpanded = false;

    viewAllButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        if (!isExpanded) {
            // Hiển thị thêm các bài viết
            hiddenBlogs.forEach((blog, index) => {
                setTimeout(() => {
                    blog.classList.remove('hidden');
                    blog.classList.add('show');
                }, index * 100); // Thêm delay để tạo hiệu ứng lần lượt
            });
            viewAllButton.textContent = 'Thu gọn';
        } else {
            // Ẩn các bài viết phụ
            hiddenBlogs.forEach((blog) => {
                blog.classList.remove('show');
                blog.classList.add('hidden');
            });
            viewAllButton.textContent = 'Xem tất cả bài viết';
        }
        
        isExpanded = !isExpanded;
    });
});