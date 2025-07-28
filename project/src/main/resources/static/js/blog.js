class BlogEditor {
    constructor() {
        this.post = {
            title: '',
            content: '',
            summary: '',
            postStatus: 'draft'
        };
        this.images = [];
        this.isPreview = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateStatus();
    }

    bindEvents() {
        const previewBtn = document.getElementById('previewBtn');
        const saveDraftBtn = document.getElementById('saveDraftBtn');
        const publishBtn = document.getElementById('publishBtn');
        const postTitle = document.getElementById('postTitle');
        const postSummary = document.getElementById('postSummary');
        const contentEditor = document.getElementById('contentEditor');
        const uploadImageBtn = document.getElementById('uploadImageBtn');
        const imageInput = document.getElementById('imageInput');

        if (previewBtn) {
            previewBtn.addEventListener('click', () => this.togglePreview());
        }
        if (saveDraftBtn) {
            saveDraftBtn.addEventListener('click', () => this.savePost('draft'));
        }
        if (publishBtn) {
            publishBtn.addEventListener('click', () => this.savePost('published'));
        }

        if (postTitle) {
            postTitle.addEventListener('input', e => this.post.title = e.target.value);
        }
        if (postSummary) {
            postSummary.addEventListener('input', e => this.post.summary = e.target.value);
        }
        if (contentEditor) {
            contentEditor.addEventListener('input', e => this.post.content = e.target.innerHTML);
        }

        if (uploadImageBtn) {
            uploadImageBtn.addEventListener('click', () => {
                if (imageInput) imageInput.click();
            });
        }

        if (imageInput) {
            imageInput.addEventListener('change', (e) => {
                const files = Array.from(e.target.files);
                files.forEach(file => {
                    if (!file.type.startsWith('image/')) return;
                    this.images.push(file);
                });
                this.renderImagePreview();
                e.target.value = "";
            });
        }
    }

    togglePreview() {
        this.isPreview = !this.isPreview;
        const editorSection = document.getElementById('editorSection');
        const previewSection = document.getElementById('previewSection');
        const previewText = document.getElementById('previewText');

        editorSection.style.display = this.isPreview ? 'none' : 'block';
        previewSection.style.display = this.isPreview ? 'block' : 'none';
        previewText.textContent = this.isPreview ? 'Chỉnh sửa' : 'Xem trước';

        if (this.isPreview) this.updatePreview();
    }

updatePreview() {
    document.getElementById('previewTitle').textContent = this.post.title;

    const previewContent = document.getElementById('previewContent');
    previewContent.innerHTML = '';

    // Render ảnh lên trước content
    if (this.images.length) {
        this.images.forEach(file => {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.style.cssText = 'width: 100%; max-width: 600px; height: auto; margin-bottom: 12px; border-radius: 8px;';
            previewContent.appendChild(img);
        });
    }

    // Render nội dung bài viết sau ảnh
    previewContent.innerHTML += this.post.content;
}


    renderImagePreview() {
        const previewDiv = document.getElementById('imagePreview');
        previewDiv.innerHTML = '';
        if (this.images.length) {
            previewDiv.style.display = 'block';
            this.images.forEach(file => {
                const img = document.createElement('img');
                img.src = URL.createObjectURL(file);
                img.style.cssText = 'width: 100px; height: auto; margin: 6px; border-radius: 6px;';
                previewDiv.appendChild(img);
            });
        } else {
            previewDiv.style.display = 'none';
        }
    }

    savePost(postStatus) {
        this.post.title = document.getElementById('postTitle').value;
        this.post.summary = document.getElementById('postSummary').value;
        this.post.content = document.getElementById('contentEditor').innerHTML;
        this.post.postStatus = postStatus;

        if (!this.post.title.trim()) return this.showNotification('Vui lòng nhập tiêu đề!', 'error');
        if (!this.post.content.trim()) return this.showNotification('Vui lòng nhập nội dung!', 'error');
        
        const docId = localStorage.getItem('docId') || 1;
        
        // If editing existing draft, update instead of create
        if (window.currentEditingPostId) {
            this.updateExistingPost(postStatus, docId);
        } else {
            this.createNewPost(postStatus, docId);
        }
    }

    createNewPost(postStatus, docId) {
        const formData = new FormData();
        formData.append('title', this.post.title);
        formData.append('summary', this.post.summary);
        formData.append('content', this.post.content);
        formData.append('postStatus', postStatus);

        this.images.forEach(file => formData.append('images', file));

        this.showLoadingState(postStatus === 'draft' ? 'Đang lưu nháp...' : 'Đang xuất bản...');

        fetch(`/api/posts/create/${docId}`, {
            method: 'POST',
            body: formData
        })
        .then(res => {
            if (!res.ok) {
                return Promise.reject('Lỗi khi lưu');
            }
            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return res.json();
            } else {
                return res.text().then(text => ({ message: text }));
            }
        })
        .then(result => {
            this.showNotification(postStatus === 'draft' ? 'Bản nháp đã được lưu thành công!' : 'Bài viết đã được xuất bản thành công!', 'success');
            
            // Update current editing post ID if it's a new draft
            if (postStatus === 'draft' && result.postId) {
                window.currentEditingPostId = result.postId;
            }
            
            // Reload draft posts
            if (typeof loadDraftPosts === 'function') {
                loadDraftPosts();
            }
            
            if (postStatus === 'published') {
                this.resetForm();
            }
        })
        .catch(err => this.showNotification(err, 'error'))
        .finally(() => this.hideLoadingState());
    }

    updateExistingPost(postStatus, docId) {
        const postData = {
            title: this.post.title,
            summary: this.post.summary,
            content: this.post.content,
            postStatus: postStatus
        };

        this.showLoadingState(postStatus === 'draft' ? 'Đang cập nhật nháp...' : 'Đang xuất bản...');

        fetch(`/api/posts/${window.currentEditingPostId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        })
        .then(res => res.ok ? res.json() : Promise.reject('Lỗi khi cập nhật'))
        .then(result => {
            this.showNotification(postStatus === 'draft' ? 'Bản nháp đã được cập nhật thành công!' : 'Bài viết đã được xuất bản thành công!', 'success');
            
            // Reload draft posts
            if (typeof loadDraftPosts === 'function') {
                loadDraftPosts();
            }
            
            if (postStatus === 'published') {
            this.resetForm();
                window.currentEditingPostId = null;
            }
        })
        .catch(err => this.showNotification(err, 'error'))
        .finally(() => this.hideLoadingState());
    }

    resetForm() {
        this.post = { title: '', content: '', summary: '', postStatus: 'draft' };
        this.images = [];
        document.getElementById('postTitle').value = '';
        document.getElementById('postSummary').value = '';
        document.getElementById('contentEditor').innerHTML = '';
        this.renderImagePreview();
        window.currentEditingPostId = null; // Clear current editing post ID
    }

    updateStatus() {
        const dot = document.getElementById('statusDot');
        const text = document.getElementById('statusText');
        
        if (dot && text) {
            dot.className = this.post.postStatus === 'published' ? 'status-dot published' : 'status-dot';
            text.textContent = this.post.postStatus === 'published' ? 'Đã xuất bản' : 'Bản nháp';
        }
    }

    showNotification(message, type = 'info') {
        alert(`${type.toUpperCase()}: ${message}`);
    }

    showLoadingState(message) {
        const btn = document.getElementById('publishBtn');
        btn.disabled = true;
        btn.innerHTML = message;
    }

    hideLoadingState() {
        const btn = document.getElementById('publishBtn');
        btn.disabled = false;
        btn.innerHTML = 'Xuất bản';
    }




}

// Initialize Blog Editor and Draft Posts Management
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Blog Editor
    window.blogEditor = new BlogEditor();
    
    // Initialize Draft Posts Management
    loadDraftPosts();
    setupDraftActions();
});

// Load draft posts
async function loadDraftPosts() {
    const draftContainer = document.getElementById('draftPostsContainer');
    const loadingElement = document.getElementById('draftLoading');
    const noDraftsElement = document.getElementById('noDrafts');
    
    if (!draftContainer) return;
    
    try {
        console.log('Loading draft posts...');
        const response = await fetch('/api/posts/drafts');
        
        if (response.ok) {
            const drafts = await response.json();
            console.log('Draft posts loaded:', drafts);
            
            // Hide loading
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
            
            if (!drafts || drafts.length === 0) {
                showNoDrafts();
                return;
            }
            
            renderDraftPosts(drafts);
            
            // Hide no drafts message if it was showing
            const noDraftsElement = document.getElementById('noDrafts');
            if (noDraftsElement) {
                noDraftsElement.style.display = 'none';
            }
        } else {
            console.error('Failed to load draft posts:', response.status);
            showDraftError('Không thể tải bài viết nháp từ server');
        }
    } catch (error) {
        console.error('Error loading draft posts:', error);
        showDraftError('Lỗi kết nối khi tải bài viết nháp');
    }
}

// Toggle draft section
function toggleDraftSection() {
    const draftSection = document.getElementById('draftPostsSection');
    const draftContainer = document.getElementById('draftPostsContainer');
    const toggleBtn = document.getElementById('toggleDraftsBtn');
    
    if (!draftSection || !draftContainer || !toggleBtn) return;
    
    const isCollapsed = draftSection.classList.contains('collapsed');
    
    if (isCollapsed) {
        // Expand
        draftSection.classList.remove('collapsed');
        draftSection.classList.add('expanded');
        draftContainer.style.display = 'block';
        toggleBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
    } else {
        // Collapse
        draftSection.classList.remove('expanded');
        draftSection.classList.add('collapsed');
        draftContainer.style.display = 'none';
        toggleBtn.innerHTML = '<i class="fas fa-chevron-down"></i>';
    }
}

// Render draft posts
function renderDraftPosts(drafts) {
    const draftContainer = document.getElementById('draftPostsContainer');
    const draftCount = document.getElementById('draftCount');
    if (!draftContainer) return;
    
    // Update draft count
    if (draftCount) {
        draftCount.textContent = `(${drafts.length})`;
    }
    
    let html = '';
    
    drafts.forEach(draft => {
        html += createDraftPostCard(draft);
    });
    
    draftContainer.innerHTML = html;
}

// Create draft post card
function createDraftPostCard(draft) {
    const date = new Date(draft.createdAt).toLocaleDateString('vi-VN');
    const summary = draft.summary || 'Chưa có tóm tắt';
    
    return `
        <div class="draft-post-card" data-post-id="${draft.postId}">
            <div class="draft-post-header">
                <h3 class="draft-post-title">${draft.title || 'Chưa có tiêu đề'}</h3>
                <div class="draft-post-actions">
                    <button class="btn btn-edit" onclick="editDraftPost(${draft.postId})" title="Chỉnh sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-publish" onclick="publishDraftPost(${draft.postId})" title="Xuất bản">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                    <button class="btn btn-delete" onclick="deleteDraftPost(${draft.postId})" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
            <div class="draft-post-summary">${summary}</div>
            
            <div class="draft-post-meta">
                <div class="draft-post-date">
                    <i class="fas fa-calendar"></i>
                    <span>${date}</span>
                </div>
                <div class="draft-post-status">
                    <i class="fas fa-save"></i>
                    <span>Bản nháp</span>
                </div>
            </div>
        </div>
    `;
}

// Show draft error
function showDraftError(errorMessage = '') {
    const draftContainer = document.getElementById('draftPostsContainer');
    const loadingElement = document.getElementById('draftLoading');
    
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
    
    if (!draftContainer) return;
    
    draftContainer.innerHTML = `
        <div class="draft-error">
            <div class="error-content">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Không thể tải bài viết nháp</h3>
                <p>Có lỗi xảy ra khi tải bài viết nháp. Vui lòng thử lại sau.</p>
                ${errorMessage ? `<p style="color: #ff6b6b; font-size: 0.9em; margin-top: 10px;">Chi tiết lỗi: ${errorMessage}</p>` : ''}
                <button onclick="loadDraftPosts()" style="margin-top: 15px; padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Thử lại
                </button>
            </div>
        </div>
    `;
}

// Setup draft actions
function setupDraftActions() {
    const refreshBtn = document.getElementById('refreshDraftsBtn');
    const toggleBtn = document.getElementById('toggleDraftsBtn');
    const draftHeader = document.getElementById('draftHeader');
    const draftSection = document.getElementById('draftPostsSection');
    
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            loadDraftPosts();
        });
    }
    
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleDraftSection();
        });
    }
    
    if (draftHeader) {
        draftHeader.addEventListener('click', function(e) {
            // Don't toggle if clicking on buttons
            if (e.target.closest('button')) {
                return;
            }
            toggleDraftSection();
        });
    }
    
    // Initialize collapsed state
    if (draftSection) {
        draftSection.classList.add('collapsed');
    }
}

// Edit draft post
async function editDraftPost(postId) {
    try {
        console.log('Loading draft post for editing:', postId);
        const response = await fetch(`/api/posts/${postId}`);
        
        if (response.ok) {
            const post = await response.json();
            console.log('Draft post loaded:', post);
            
            // Fill the editor with draft data
            fillEditorWithDraft(post);
            
            // Scroll to editor
            document.querySelector('.blog-editor-container').scrollIntoView({ 
                behavior: 'smooth' 
            });
            
        } else {
            console.error('Failed to load draft post:', response.status);
            alert('Không thể tải bài viết nháp để chỉnh sửa');
        }
    } catch (error) {
        console.error('Error loading draft post:', error);
        alert('Lỗi khi tải bài viết nháp');
    }
}

// Fill editor with draft data
function fillEditorWithDraft(post) {
    // Fill title
    const titleInput = document.getElementById('postTitle');
    if (titleInput) {
        titleInput.value = post.title || '';
    }
    
    // Fill summary
    const summaryInput = document.getElementById('postSummary');
    if (summaryInput) {
        summaryInput.value = post.summary || '';
    }
    
    // Fill content
    const contentEditor = document.getElementById('contentEditor');
    if (contentEditor) {
        contentEditor.innerHTML = post.content || '';
    }
    
    // Update current post ID for saving
    window.currentEditingPostId = post.postId;
    
    // Update blog editor state
    if (window.blogEditor) {
        window.blogEditor.post.title = post.title || '';
        window.blogEditor.post.summary = post.summary || '';
        window.blogEditor.post.content = post.content || '';
        window.blogEditor.updateStatus();
    }
    
    // Update status
    updateStatus('Bản nháp', 'draft');
    
    console.log('Editor filled with draft data');
}

// Publish draft post
async function publishDraftPost(postId) {
    if (!confirm('Bạn có chắc chắn muốn xuất bản bài viết này?')) {
        return;
    }
    
    try {
        console.log('Publishing draft post:', postId);
        const response = await fetch(`/api/posts/${postId}/publish`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                postStatus: 'published'
            })
        });
        
        if (response.ok) {
            console.log('Draft post published successfully');
            alert('Bài viết đã được xuất bản thành công!');
            
            // Reload draft posts
            loadDraftPosts();
            
        } else {
            console.error('Failed to publish draft post:', response.status);
            alert('Không thể xuất bản bài viết');
        }
    } catch (error) {
        console.error('Error publishing draft post:', error);
        alert('Lỗi khi xuất bản bài viết');
    }
}

// Delete draft post
async function deleteDraftPost(postId) {
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết nháp này? Hành động này không thể hoàn tác.')) {
        return;
    }
    
    try {
        console.log('Deleting draft post:', postId);
        const response = await fetch(`/api/posts/${postId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            console.log('Draft post deleted successfully');
            alert('Bài viết nháp đã được xóa thành công!');
            
            // Reload draft posts
            loadDraftPosts();
            
        } else {
            console.error('Failed to delete draft post:', response.status);
            alert('Không thể xóa bài viết nháp');
        }
    } catch (error) {
        console.error('Error deleting draft post:', error);
        alert('Lỗi khi xóa bài viết nháp');
    }
}

// Update status indicator
function updateStatus(text, type = 'draft') {
    const statusText = document.getElementById('statusText');
    const statusDot = document.getElementById('statusDot');
    
    if (statusText) {
        statusText.textContent = text;
    }
    
    if (statusDot) {
        statusDot.className = 'status-dot';
        if (type === 'published') {
            statusDot.classList.add('published');
        }
    }
}

// Setup save draft functionality (this is now handled by BlogEditor class)
// The saveDraft function below is kept for compatibility but not used

// Save draft post
async function saveDraft() {
    const title = document.getElementById('postTitle').value.trim();
    const summary = document.getElementById('postSummary').value.trim();
    const content = document.getElementById('contentEditor').innerHTML.trim();
    
    if (!title) {
        alert('Vui lòng nhập tiêu đề bài viết');
        return;
    }
    
    if (!content) {
        alert('Vui lòng nhập nội dung bài viết');
        return;
    }
    
    try {
        console.log('Saving draft post...');
        
        // Get current doctor ID (you may need to adjust this based on your auth system)
        const doctorId = 1; // Default doctor ID, should get from session/auth
        
        const postData = {
            title: title,
            summary: summary,
            content: content,
            postStatus: 'draft'
        };
        
        let url = '/api/posts/create/' + doctorId;
        let method = 'POST';
        
        // If editing existing draft, update instead of create
        if (window.currentEditingPostId) {
            url = '/api/posts/' + window.currentEditingPostId;
            method = 'PUT';
        }
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('Draft saved successfully:', result);
            alert('Bản nháp đã được lưu thành công!');
            
            // Update current editing post ID if it's a new draft
            if (!window.currentEditingPostId && result.postId) {
                window.currentEditingPostId = result.postId;
            }
            
            // Reload draft posts
            loadDraftPosts();
            
            // Update status
            updateStatus('Bản nháp', 'draft');
            
        } else {
            console.error('Failed to save draft:', response.status);
            alert('Không thể lưu bản nháp');
        }
            } catch (error) {
            console.error('Error saving draft:', error);
            alert('Lỗi khi lưu bản nháp');
        }
    }

// Show no drafts message
function showNoDrafts() {
    const draftContainer = document.getElementById('draftPostsContainer');
    const draftCount = document.getElementById('draftCount');
    const noDraftsElement = document.getElementById('noDrafts');
    
    if (draftCount) {
        draftCount.textContent = '(0)';
    }
    
    if (draftContainer) {
        draftContainer.style.display = 'none';
    }
    
    if (noDraftsElement) {
        noDraftsElement.style.display = 'block';
    }
}
