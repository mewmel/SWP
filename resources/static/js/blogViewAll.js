// Blog functionality
document.addEventListener('DOMContentLoaded', function() {
    loadHomepageBlogs();
    setupViewAllBlogs();
});

// Load blog posts for homepage
async function loadHomepageBlogs() {
    const blogGrid = document.getElementById('blogGrid');
    const loadingElement = document.getElementById('blogLoading');

    try {
        console.log('Loading homepage blogs...');
        const response = await fetch('/api/posts/homepage');

        if (response.ok) {
            const posts = await response.json();
            console.log('Homepage posts loaded:', posts);

            // Hide loading
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }

            if (!posts || posts.length === 0) {
                showNoBlogs();
                return;
            }

            renderHomepageBlogs(posts);
        } else {
            console.error('Failed to load homepage posts:', response.status);
            showBlogError('Không thể tải bài viết từ server');
        }
    } catch (error) {
        console.error('Error loading homepage blogs:', error);
        showBlogError('Lỗi kết nối khi tải bài viết');
    }
}

// Render homepage blogs
function renderHomepageBlogs(posts) {
    const blogGrid = document.getElementById('blogGrid');
    const viewAllBtn = document.getElementById('viewAllBlogs');
    if (!blogGrid) return;

    let html = '';

    // Show first 3 posts
    const visiblePosts = posts.slice(0, 3);
    const hiddenPosts = posts.slice(3, 6);

    // Render visible posts
    visiblePosts.forEach(post => {
        html += createBlogCard(post, false);
    });

    // Render hidden posts
    hiddenPosts.forEach(post => {
        html += createBlogCard(post, true);
    });

    blogGrid.innerHTML = html;

    // Show "View All" button if there are more than 3 posts
    if (viewAllBtn && posts.length > 3) {
        viewAllBtn.style.display = 'inline-block';
    }
}

// Create blog card HTML
function createBlogCard(post, isHidden = false) {
    const hiddenClass = isHidden ? ' hidden' : '';
    const imageUrl = post.hasImage ? `/api/posts/${post.postId}/image` : 'img/blog1.jpg';
    const formattedDate = formatDate(post.createdAt);

    return `
        <div class="blog-card${hiddenClass}">
            <div class="blog-image">
                <img src="${imageUrl}" alt="${post.title}" onerror="this.src='img/blog1.jpg'">
            </div>
            <div class="blog-content">
                <div class="blog-date">${formattedDate}</div>
                <h3>${post.title}</h3>
                <p>${post.summary || 'Nội dung bài viết...'}</p>
                <a href="blog-detail.html?id=${post.postId}" class="read-more">Đọc thêm <i class="fas fa-arrow-right"></i></a>
            </div>
        </div>
    `;
}



// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const months = [
        'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
        'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];
    return `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;
}

// Show no blogs message
function showNoBlogs() {
    const blogGrid = document.getElementById('blogGrid');
    if (!blogGrid) return;

    blogGrid.innerHTML = `
        <div class="blog-error">
            <div class="error-content">
                <i class="fas fa-newspaper" style="font-size: 3rem; color: #ddd; margin-bottom: 20px;"></i>
                <h3>Chưa có bài viết nào</h3>
                <p>Chúng tôi đang chuẩn bị những bài viết đầu tiên cho bạn.</p>
            </div>
        </div>
    `;
}

// Show blog error message
function showBlogError(errorMessage = '') {
    const blogGrid = document.getElementById('blogGrid');
    const loadingElement = document.getElementById('blogLoading');

    if (loadingElement) {
        loadingElement.style.display = 'none';
    }

    if (!blogGrid) return;

    blogGrid.innerHTML = `
        <div class="blog-error">
            <div class="error-content">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ddd; margin-bottom: 20px;"></i>
                <h3>Không thể tải bài viết</h3>
                <p>Có lỗi xảy ra khi tải bài viết. Vui lòng thử lại sau.</p>
                ${errorMessage ? `<p style="color: #ff6b6b; font-size: 0.9em; margin-top: 10px;">Chi tiết lỗi: ${errorMessage}</p>` : ''}
                <button onclick="loadHomepageBlogs()" style="margin-top: 15px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Thử lại
                </button>
            </div>
        </div>
    `;
}

// Setup "View All Blogs" functionality
function setupViewAllBlogs() {
    const viewAllBtn = document.getElementById('viewAllBlogs');
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', function(e) {
            e.preventDefault();
            loadAllBlogs();
        });
    }
}

// Load all blogs
async function loadAllBlogs() {
    try {
        console.log('Loading all blogs...');
        const response = await fetch('/api/posts/all');

        if (response.ok) {
            const posts = await response.json();
            console.log('All posts loaded:', posts);
            renderAllBlogs(posts);
        } else {
            console.error('Failed to load all posts:', response.status);
            showAllStaticBlogs();
        }
    } catch (error) {
        console.error('Error loading all blogs:', error);
        showAllStaticBlogs();
    }
}

// Render all blogs
function renderAllBlogs(posts) {
    const blogGrid = document.getElementById('blogGrid');
    if (!blogGrid) return;

    let html = '';

    posts.forEach(post => {
        html += createBlogCard(post, false);
    });

    blogGrid.innerHTML = html;

    // Hide "View All" button
    const viewAllBtn = document.getElementById('viewAllBlogs');
    if (viewAllBtn) {
        viewAllBtn.style.display = 'none';
    }
}

// Show all static blogs (fallback)
function showAllStaticBlogs() {
    console.log('No dynamic content available, showing static content');
    // This function is kept for compatibility but won't be used
    // since we removed all static content
}