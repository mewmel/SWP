// Enhanced Blog Editor JavaScript
class BlogEditor {
    constructor() {
        this.post = {
            title: '',
            content: '',
            category: '',
            tags: [],
            status: 'draft'
        };

        this.isPreview = false;
        this.isFullscreen = false;
        this.wordCount = 0;
        this.readingTime = 0;
        this.autoSaveInterval = null;

        this.init();
    }

    init() {
        this.bindEvents();
        this.updateStatus();
        this.updateCurrentDate();
        this.startAutoSave();
        this.initDragAndDrop();
    }

    bindEvents() {
        // Preview toggle
        const previewBtn = document.getElementById('previewBtn');
        const previewText = document.getElementById('previewText');
        const editorSection = document.getElementById('editorSection');
        const previewSection = document.getElementById('previewSection');

        previewBtn.addEventListener('click', () => {
            this.isPreview = !this.isPreview;

            if (this.isPreview) {
                editorSection.style.display = 'none';
                previewSection.style.display = 'block';
                previewText.textContent = 'Chỉnh sửa';
                this.updatePreview();
            } else {
                editorSection.style.display = 'block';
                previewSection.style.display = 'none';
                previewText.textContent = 'Xem trước';
            }
        });

        // Fullscreen toggle
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
                this.toggleFullscreen();
            });
        }

        // Save draft
        document.getElementById('saveDraftBtn').addEventListener('click', () => {
            this.savePost('draft');
        });

        // Publish
        document.getElementById('publishBtn').addEventListener('click', () => {
            this.savePost('published');
        });

        // Title input
        const titleInput = document.getElementById('postTitle');
        titleInput.addEventListener('input', (e) => {
            this.post.title = e.target.value;
            this.updateWordCount();
        });

        // Content editor
        const contentEditor = document.getElementById('contentEditor');
        contentEditor.addEventListener('input', () => {
            this.post.content = contentEditor.innerHTML;
            this.updateWordCount();
            this.updateReadingTime();
        });

        // Category select
        const categorySelect = document.getElementById('categorySelect');
        categorySelect.addEventListener('change', (e) => {
            this.post.category = e.target.value;
        });

        // Tag management
        const tagInput = document.getElementById('tagInput');
        const addTagBtn = document.getElementById('addTagBtn');

        addTagBtn.addEventListener('click', () => {
            this.addTag();
        });

        tagInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addTag();
            }
        });

        // Toolbar buttons
        const toolbarBtns = document.querySelectorAll('.toolbar-btn[data-command]');
        toolbarBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const command = btn.dataset.command;
                const value = btn.dataset.value || null;
                this.execCommand(command, value);
                btn.classList.toggle('active');
                setTimeout(() => btn.classList.remove('active'), 200);
            });
        });

        // Keyboard shortcuts
        contentEditor.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'b':
                        e.preventDefault();
                        this.execCommand('bold');
                        break;
                    case 'i':
                        e.preventDefault();
                        this.execCommand('italic');
                        break;
                    case 'u':
                        e.preventDefault();
                        this.execCommand('underline');
                        break;
                    case 's':
                        e.preventDefault();
                        this.savePost('draft');
                        break;
                }
            }
        });
    }

    execCommand(command, value = null) {
        document.execCommand(command, false, value);
        document.getElementById('contentEditor').focus();
        this.updateWordCount();
    }

    addTag() {
        const tagInput = document.getElementById('tagInput');
        const tagValue = tagInput.value.trim();

        if (tagValue && !this.post.tags.includes(tagValue) && this.post.tags.length < 10) {
            this.post.tags.push(tagValue);
            this.renderTags();
            tagInput.value = '';
        } else if (this.post.tags.length >= 10) {
            this.showNotification('Chỉ được phép thêm tối đa 10 tag', 'warning');
        }
    }

    removeTag(tagToRemove) {
        this.post.tags = this.post.tags.filter(tag => tag !== tagToRemove);
        this.renderTags();
    }

    renderTags() {
        const tagsContainer = document.getElementById('tagsContainer');
        tagsContainer.innerHTML = '';

        this.post.tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag';
            tagElement.innerHTML = `
                ${tag}
                <button class="tag-remove" onclick="blogEditor.removeTag('${tag}')" type="button">×</button>
            `;
            tagsContainer.appendChild(tagElement);
        });
    }

    updatePreview() {
        const previewTitle = document.getElementById('previewTitle');
        const previewContent = document.getElementById('previewContent');
        const previewTags = document.getElementById('previewTags');

        previewTitle.textContent = this.post.title || 'Tiêu đề bài viết';
        previewContent.innerHTML = this.post.content || '<p>Nội dung bài viết sẽ hiển thị ở đây...</p>';

        // Render preview tags
        previewTags.innerHTML = '';
        this.post.tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag';
            tagElement.textContent = tag;
            previewTags.appendChild(tagElement);
        });
    }

    updateWordCount() {
        const content = document.getElementById('contentEditor').textContent || '';
        const title = document.getElementById('postTitle').value || '';
        const totalText = title + ' ' + content;

        this.wordCount = totalText.trim().split(/\s+/).filter(word => word.length > 0).length;

        const wordCountElement = document.getElementById('wordCount');
        if (wordCountElement) {
            wordCountElement.textContent = `${this.wordCount} từ`;
        }
    }

    updateReadingTime() {
        // Average reading speed: 200 words per minute
        const readingSpeed = 200;
        this.readingTime = Math.ceil(this.wordCount / readingSpeed) || 1;

        const readingTimeElement = document.getElementById('readingTime');
        if (readingTimeElement) {
            readingTimeElement.innerHTML = `<i class="fas fa-clock"></i> <span>~${this.readingTime} phút đọc</span>`;
        }
    }

    updateCurrentDate() {
        const currentDateElement = document.getElementById('currentDate');
        if (currentDateElement) {
            const now = new Date();
            const options = {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
            };
            currentDateElement.textContent = now.toLocaleDateString('vi-VN', options);
        }
    }

    toggleFullscreen() {
        const editorSection = document.getElementById('editorSection');
        const fullscreenBtn = document.getElementById('fullscreenBtn');

        this.isFullscreen = !this.isFullscreen;

        if (this.isFullscreen) {
            editorSection.style.position = 'fixed';
            editorSection.style.top = '0';
            editorSection.style.left = '0';
            editorSection.style.width = '100vw';
            editorSection.style.height = '100vh';
            editorSection.style.zIndex = '9999';
            editorSection.style.background = 'white';
            editorSection.style.padding = '2rem';

            const contentEditor = document.getElementById('contentEditor');
            contentEditor.style.minHeight = '80vh';

            fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
        } else {
            editorSection.style.position = '';
            editorSection.style.top = '';
            editorSection.style.left = '';
            editorSection.style.width = '';
            editorSection.style.height = '';
            editorSection.style.zIndex = '';
            editorSection.style.background = '';
            editorSection.style.padding = '';

            const contentEditor = document.getElementById('contentEditor');
            contentEditor.style.minHeight = '600px';

            fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
        }
    }

    savePost(status) {
        // Update post data
        this.post.title = document.getElementById('postTitle').value;
        this.post.content = document.getElementById('contentEditor').innerHTML;
        this.post.category = document.getElementById('categorySelect').value;
        this.post.status = status;

        // Validate required fields
        if (!this.post.title.trim()) {
            this.showNotification('Vui lòng nhập tiêu đề bài viết', 'error');
            return;
        }

        if (!this.post.content.trim()) {
            this.showNotification('Vui lòng nhập nội dung bài viết', 'error');
            return;
        }

        if (!this.post.category) {
            this.showNotification('Vui lòng chọn chuyên khoa', 'error');
            return;
        }

        // Simulate API call
        this.showLoadingState(status === 'draft' ? 'Đang lưu nháp...' : 'Đang xuất bản...');

        setTimeout(() => {
            this.hideLoadingState();
            this.post.status = status;
            this.updateStatus();

            const message = status === 'draft' ? 'Bài viết đã được lưu nháp!' : 'Bài viết đã được xuất bản thành công!';
            this.showNotification(message, 'success');

            // Save to localStorage for demo
            localStorage.setItem('blogPost', JSON.stringify(this.post));

            if (status === 'published') {
                localStorage.removeItem('blogPostDraft');
            }
        }, 1500);
    }

    startAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            this.autoSave();
        }, 30000); // Auto-save every 30 seconds
    }

    autoSave() {
        const title = document.getElementById('postTitle').value;
        const content = document.getElementById('contentEditor').innerHTML;

        if (title.trim() || content.trim()) {
            this.post.title = title;
            this.post.content = content;
            this.post.category = document.getElementById('categorySelect').value;

            localStorage.setItem('blogPostDraft', JSON.stringify(this.post));

            // Show auto-save indicator
            const autoSaveElement = document.getElementById('autoSave');
            if (autoSaveElement) {
                autoSaveElement.style.opacity = '1';
                setTimeout(() => {
                    autoSaveElement.style.opacity = '0.7';
                }, 2000);
            }
        }
    }

    updateStatus() {
        const statusDot = document.getElementById('statusDot');
        const statusText = document.getElementById('statusText');

        if (this.post.status === 'published') {
            statusDot.className = 'status-dot published';
            statusText.textContent = 'Đã xuất bản';
        } else {
            statusDot.className = 'status-dot';
            statusText.textContent = 'Bản nháp';
        }
    }

    showLoadingState(message) {
        const saveDraftBtn = document.getElementById('saveDraftBtn');
        const publishBtn = document.getElementById('publishBtn');

        saveDraftBtn.disabled = true;
        publishBtn.disabled = true;

        const originalPublishHTML = publishBtn.innerHTML;
        publishBtn.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            ${message}
        `;

        // Store original content to restore later
        publishBtn.dataset.originalContent = originalPublishHTML;
    }

    hideLoadingState() {
        const saveDraftBtn = document.getElementById('saveDraftBtn');
        const publishBtn = document.getElementById('publishBtn');

        saveDraftBtn.disabled = false;
        publishBtn.disabled = false;

        publishBtn.innerHTML = publishBtn.dataset.originalContent || `
            <i class="fas fa-paper-plane"></i>
            Xuất bản
        `;
    }

    showNotification(message, type = 'info', duration = 4000) {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.25rem;
            border-radius: 0.75rem;
            border: 1px solid;
            font-weight: 500;
            font-size: 0.875rem;
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
            max-width: 400px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
        `;

        // Apply colors based on type
        switch(type) {
            case 'success':
                notification.style.background = 'rgba(240, 253, 244, 0.95)';
                notification.style.borderColor = '#bbf7d0';
                notification.style.color = '#166534';
                break;
            case 'error':
                notification.style.background = 'rgba(254, 242, 242, 0.95)';
                notification.style.borderColor = '#fecaca';
                notification.style.color = '#dc2626';
                break;
            case 'warning':
                notification.style.background = 'rgba(255, 251, 235, 0.95)';
                notification.style.borderColor = '#fed7aa';
                notification.style.color = '#d97706';
                break;
            default:
                notification.style.background = 'rgba(239, 246, 255, 0.95)';
                notification.style.borderColor = '#bfdbfe';
                notification.style.color = '#1d4ed8';
        }

        notification.textContent = message;
        document.body.appendChild(notification);

        // Auto remove
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, duration);
    }

    loadDraft() {
        const draft = localStorage.getItem('blogPostDraft');
        if (draft) {
            const parsedDraft = JSON.parse(draft);

            document.getElementById('postTitle').value = parsedDraft.title || '';
            document.getElementById('contentEditor').innerHTML = parsedDraft.content || '';
            document.getElementById('categorySelect').value = parsedDraft.category || '';

            this.post = { ...parsedDraft };
            this.renderTags();
            this.updateStatus();
            this.updateWordCount();
            this.updateReadingTime();
        }
    }

    initDragAndDrop() {
        const contentEditor = document.getElementById('contentEditor');

        contentEditor.addEventListener('dragover', (e) => {
            e.preventDefault();
            contentEditor.style.background = '#f0f9ff';
        });

        contentEditor.addEventListener('dragleave', (e) => {
            e.preventDefault();
            contentEditor.style.background = '';
        });

        contentEditor.addEventListener('drop', (e) => {
            e.preventDefault();
            contentEditor.style.background = '';

            const files = Array.from(e.dataTransfer.files);
            files.forEach(file => {
                if (file.type.startsWith('image/')) {
                    this.handleImageUpload(file);
                }
            });
        });
    }

    handleImageUpload(file) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            this.showNotification('Kích thước ảnh không được vượt quá 5MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.style.margin = '1rem 0';
            img.style.borderRadius = '0.5rem';

            const contentEditor = document.getElementById('contentEditor');
            contentEditor.appendChild(img);

            this.updateWordCount();
            this.showNotification('Ảnh đã được thêm vào bài viết', 'success');
        };
        reader.readAsDataURL(file);
    }
}

// Format text function for toolbar select
function formatText(tag) {
    if (!tag) return;

    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const selectedText = range.toString();

        if (selectedText) {
            let wrappedText;
            switch(tag) {
                case 'h1':
                    wrappedText = `<h1>${selectedText}</h1>`;
                    break;
                case 'h2':
                    wrappedText = `<h2>${selectedText}</h2>`;
                    break;
                case 'h3':
                    wrappedText = `<h3>${selectedText}</h3>`;
                    break;
                case 'blockquote':
                    wrappedText = `<blockquote>${selectedText}</blockquote>`;
                    break;
                default:
                    wrappedText = `<p>${selectedText}</p>`;
            }

            range.deleteContents();
            range.insertNode(range.createContextualFragment(wrappedText));
            selection.removeAllRanges();

            blogEditor.updateWordCount();
        }
    }
}

// Insert code function
function insertCode() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const selectedText = range.toString() || 'your code here';

        const codeElement = document.createElement('pre');
        codeElement.innerHTML = `<code>${selectedText}</code>`;
        codeElement.style.background = '#f3f4f6';
        codeElement.style.padding = '1rem';
        codeElement.style.borderRadius = '0.5rem';
        codeElement.style.margin = '1rem 0';
        codeElement.style.overflow = 'auto';

        range.deleteContents();
        range.insertNode(codeElement);
        selection.removeAllRanges();

        blogEditor.updateWordCount();
    }
}

// Image modal functions
function insertImage() {
    document.getElementById('imageModal').style.display = 'block';
}

function closeImageModal() {
    document.getElementById('imageModal').style.display = 'none';
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('uploadArea').style.display = 'block';
    document.getElementById('imageInput').value = '';
}

function insertSelectedImage() {
    const img = document.getElementById('previewImg');
    const alt = document.getElementById('imageAlt').value;
    const caption = document.getElementById('imageCaption').value;

    if (img.src) {
        const contentEditor = document.getElementById('contentEditor');
        const imageHTML = `
            <div style="text-align: center; margin: 1.5rem 0;">
                <img src="${img.src}" alt="${alt}" style="max-width: 100%; height: auto; border-radius: 0.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                ${caption ? `<p style="font-style: italic; color: #6b7280; margin-top: 0.5rem; font-size: 0.875rem;">${caption}</p>` : ''}
            </div>
        `;

        contentEditor.insertAdjacentHTML('beforeend', imageHTML);
        closeImageModal();

        blogEditor.updateWordCount();
        blogEditor.showNotification('Ảnh đã được thêm vào bài viết', 'success');
    }
}

// Link modal functions
function insertLink() {
    const selection = window.getSelection();
    const selectedText = selection.toString();

    document.getElementById('linkText').value = selectedText;
    document.getElementById('linkModal').style.display = 'block';
}

function closeLinkModal() {
    document.getElementById('linkModal').style.display = 'none';
    document.getElementById('linkText').value = '';
    document.getElementById('linkUrl').value = '';
    document.getElementById('linkNewTab').checked = false;
}

function insertSelectedLink() {
    const text = document.getElementById('linkText').value;
    const url = document.getElementById('linkUrl').value;
    const newTab = document.getElementById('linkNewTab').checked;

    if (text && url) {
        const linkHTML = `<a href="${url}" ${newTab ? 'target="_blank" rel="noopener noreferrer"' : ''} style="color: #3b82f6; text-decoration: underline;">${text}</a>`;

        const contentEditor = document.getElementById('contentEditor');
        contentEditor.insertAdjacentHTML('beforeend', linkHTML);

        closeLinkModal();
        blogEditor.updateWordCount();
        blogEditor.showNotification('Liên kết đã được thêm', 'success');
    } else {
        blogEditor.showNotification('Vui lòng nhập đầy đủ thông tin liên kết', 'error');
    }
}

// Image upload handling
document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('imageInput');
    const uploadArea = document.getElementById('uploadArea');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');

    if (imageInput) {
        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                handleImageFile(file);
            }
        });
    }

    function handleImageFile(file) {
        if (!file.type.startsWith('image/')) {
            blogEditor.showNotification('Vui lòng chọn file ảnh hợp lệ', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            blogEditor.showNotification('Kích thước ảnh không được vượt quá 5MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            uploadArea.style.display = 'none';
            imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    // Drag and drop for upload area
    if (uploadArea) {
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');

            const file = e.dataTransfer.files[0];
            if (file) {
                handleImageFile(file);
            }
        });
    }
});

// Close modals when clicking outside
window.addEventListener('click', (event) => {
    const imageModal = document.getElementById('imageModal');
    const linkModal = document.getElementById('linkModal');

    if (event.target === imageModal) {
        closeImageModal();
    }

    if (event.target === linkModal) {
        closeLinkModal();
    }
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .fa-spin {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
    
    .upload-area.dragover {
        border-color: #3b82f6 !important;
        background: #f0f9ff !important;
        transform: scale(1.02);
    }
`;
document.head.appendChild(style);

// Initialize the blog editor
let blogEditor;
document.addEventListener('DOMContentLoaded', () => {
    blogEditor = new BlogEditor();

    // Load draft if exists
    blogEditor.loadDraft();

    // Initialize current date
    blogEditor.updateCurrentDate();

// Handle mobile menu
    const mobileMenuBtn = document.querySelector('.doctor-mobile-menu');
    const nav = document.querySelector('.doctor-nav');

    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', () => {
            nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
        });
    }

// Handle responsive behavior
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && nav) {
            nav.style.display = 'flex';
        }
    });
});

// Handle page unload warning for unsaved changes
window.addEventListener('beforeunload', (e) => {
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('contentEditor').innerHTML;

    if ((title.trim() || content.trim()) && blogEditor.post.status === 'draft') {
        e.preventDefault();
        e.returnValue = 'Bạn có thay đổi chưa được lưu. Bạn có chắc chắn muốn rời khỏi trang?';
        return e.returnValue;
    }
});