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
        this.loadDraft();
    }

    bindEvents() {
        document.getElementById('previewBtn').addEventListener('click', () => this.togglePreview());
        document.getElementById('saveDraftBtn').addEventListener('click', () => this.savePost('draft'));
        document.getElementById('publishBtn').addEventListener('click', () => this.savePost('published'));

        document.getElementById('postTitle').addEventListener('input', e => this.post.title = e.target.value);
        document.getElementById('postSummary').addEventListener('input', e => this.post.summary = e.target.value);
        document.getElementById('contentEditor').addEventListener('input', e => this.post.content = e.target.innerHTML);

        document.getElementById('uploadImageBtn').addEventListener('click', () => {
            document.getElementById('imageInput').click();
        });

        document.getElementById('imageInput').addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            files.forEach(file => {
                if (!file.type.startsWith('image/')) return;
                this.images.push(file);
            });
            this.renderImagePreview();
            e.target.value = "";
        });

        setInterval(() => this.autoSave(), 30000);
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
        if (!this.post.summary.trim()) return this.showNotification('Vui lòng nhập tóm tắt!', 'error');
        if (!this.post.content.trim()) return this.showNotification('Vui lòng nhập nội dung!', 'error');
        const docId = localStorage.getItem('docId');
        const formData = new FormData();
        formData.append('docId', docId || 1);
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
        .then(res => res.ok ? res.text() : Promise.reject('Lỗi khi lưu'))
        .then(msg => {
            this.showNotification(msg, 'success');
            this.resetForm();
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
        localStorage.removeItem('blogPostDraft');
    }

    updateStatus() {
        const dot = document.getElementById('statusDot');
        const text = document.getElementById('statusText');
        dot.className = this.post.status === 'published' ? 'status-dot published' : 'status-dot';
        text.textContent = this.post.status === 'published' ? 'Đã xuất bản' : 'Bản nháp';
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

    loadDraft() {
        const draft = localStorage.getItem('blogPostDraft');
        if (draft) {
            this.post = JSON.parse(draft);
            document.getElementById('postTitle').value = this.post.title;
            document.getElementById('postSummary').value = this.post.summary;
            document.getElementById('contentEditor').innerHTML = this.post.content;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.blogEditor = new BlogEditor();
});
