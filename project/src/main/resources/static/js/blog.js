// Blog Editor JavaScript
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
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateStatus();
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
        });

        // Content editor
        const contentEditor = document.getElementById('contentEditor');
        contentEditor.addEventListener('input', () => {
            this.post.content = contentEditor.innerHTML;
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
            });
        });

        // Auto-save every 30 seconds
        setInterval(() => {
            this.autoSave();
        }, 30000);
    }

    execCommand(command, value = null) {
        document.execCommand(command, false, value);
        document.getElementById('contentEditor').focus();
    }

    addTag() {
        const tagInput = document.getElementById('tagInput');
        const tagValue = tagInput.value.trim();
        
        if (tagValue && !this.post.tags.includes(tagValue)) {
            this.post.tags.push(tagValue);
            this.renderTags();
            tagInput.value = '';
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
        
        previewTitle.textContent = this.post.title || 'Tiêu đề bài viết';
        previewContent.innerHTML = this.post.content || 'Nội dung bài viết sẽ hiển thị ở đây...';
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
            this.updateStatus();
            
            const message = status === 'draft' ? 'Bài viết đã được lưu nháp!' : 'Bài viết đã được xuất bản!';
            this.showNotification(message, 'success');
            
            // Save to localStorage for demo
            localStorage.setItem('blogPost', JSON.stringify(this.post));
        }, 1500);
    }

    autoSave() {
        if (this.post.title || this.post.content) {
            this.post.title = document.getElementById('postTitle').value;
            this.post.content = document.getElementById('contentEditor').innerHTML;
            this.post.category = document.getElementById('categorySelect').value;
            
            localStorage.setItem('blogPostDraft', JSON.stringify(this.post));
            this.showNotification('Đã tự động lưu', 'info', 2000);
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
        publishBtn.innerHTML = `
            <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg>
            ${message}
        `;
    }

    hideLoadingState() {
        const saveDraftBtn = document.getElementById('saveDraftBtn');
        const publishBtn = document.getElementById('publishBtn');
        
        saveDraftBtn.disabled = false;
        publishBtn.disabled = false;
        publishBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
            </svg>
            Xuất bản
        `;
    }

    showNotification(message, type = 'info', duration = 4000) {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const colors = {
            success: 'bg-green-50 border-green-200 text-green-800',
            error: 'bg-red-50 border-red-200 text-red-800',
            info: 'bg-blue-50 border-blue-200 text-blue-800',
            warning: 'bg-yellow-50 border-yellow-200 text-yellow-800'
        };

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 16px;
            border-radius: 8px;
            border: 1px solid;
            font-weight: 500;
            font-size: 14px;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        `;

        // Apply colors based on type
        switch(type) {
            case 'success':
                notification.style.background = '#f0fdf4';
                notification.style.borderColor = '#bbf7d0';
                notification.style.color = '#166534';
                break;
            case 'error':
                notification.style.background = '#fef2f2';
                notification.style.borderColor = '#fecaca';
                notification.style.color = '#dc2626';
                break;
            case 'warning':
                notification.style.background = '#fffbeb';
                notification.style.borderColor = '#fed7aa';
                notification.style.color = '#d97706';
                break;
            default:
                notification.style.background = '#eff6ff';
                notification.style.borderColor = '#bfdbfe';
                notification.style.color = '#1d4ed8';
        }

        notification.textContent = message;
        document.body.appendChild(notification);

        // Auto remove
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
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
        }
    }
}

// Modal handling
const patientListModal = document.getElementById('patientListModal');
const managementItem = document.querySelector('.management-item');
const closeBtn = document.querySelector('#patientListModal .close');

// Sample patient data (replace with actual data from your backend)
const patients = [
    {
        id: 'BN001',
        name: 'Nguyễn Văn A',
        birthDate: '1990-05-15',
        phone: '0901234567',
        address: 'Hà Nội'
    },
    {
        id: 'BN002',
        name: 'Trần Thị B',
        birthDate: '1988-08-20',
        phone: '0912345678',
        address: 'Hồ Chí Minh'
    },
    // Add more patient data as needed
];

// Open modal when clicking on management item
managementItem.addEventListener('click', () => {
    patientListModal.style.display = 'block';
    renderPatientList(patients);
});

// Close modal when clicking on close button
closeBtn.addEventListener('click', () => {
    patientListModal.style.display = 'none';
});

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    if (event.target === patientListModal) {
        patientListModal.style.display = 'none';
    }
});

// Function to render patient list
function renderPatientList(patientData) {
    const tbody = document.querySelector('.patient-table tbody');
    tbody.innerHTML = '';

    patientData.forEach(patient => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${patient.id}</td>
            <td>${patient.name}</td>
            <td>${formatDate(patient.birthDate)}</td>
            <td>${patient.phone}</td>
            <td>${patient.address}</td>
            <td>
                <button class="action-btn view-btn" onclick="viewPatient('${patient.id}')">Xem</button>
                <button class="action-btn edit-btn" onclick="editPatient('${patient.id}')">Sửa</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Search functionality
const searchInput = document.querySelector('.search-patient .search-input');
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredPatients = patients.filter(patient => 
        patient.name.toLowerCase().includes(searchTerm) ||
        patient.id.toLowerCase().includes(searchTerm) ||
        patient.phone.includes(searchTerm)
    );
    renderPatientList(filteredPatients);
});

// Utility function to format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
}

// Patient actions
function viewPatient(id) {
    console.log('Viewing patient:', id);
    // Add your view patient logic here
}

function editPatient(id) {
    console.log('Editing patient:', id);
    // Add your edit patient logic here
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
            
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .animate-spin {
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
`;
document.head.appendChild(style);

// Initialize the blog editor
let blogEditor;
document.addEventListener('DOMContentLoaded', () => {
    blogEditor = new BlogEditor();
    
    // Load draft if exists
    blogEditor.loadDraft();
    
    // Add some sample content for demo
    if (!localStorage.getItem('blogPostDraft')) {
        document.getElementById('postTitle').value = 'Hướng dẫn chăm sóc trẻ em trong mùa đông';
        document.getElementById('contentEditor').innerHTML = `
            <p>Mùa đông là thời điểm trẻ em dễ mắc các bệnh về đường hô hấp. Dưới đây là một số lưu ý quan trọng:</p>
            
            <h3>1. Giữ ấm cho trẻ</h3>
            <p>Đảm bảo trẻ được mặc đủ ấm, đặc biệt chú ý đến vùng cổ, tay và chân.</p>
            
            <h3>2. Dinh dưỡng hợp lý</h3>
            <p>Bổ sung vitamin C từ các loại trái cây như cam, quýt, kiwi để tăng cường sức đề kháng.</p>
            
            <h3>3. Vệ sinh cá nhân</h3>
            <p>Rửa tay thường xuyên bằng xà phòng, đặc biệt trước khi ăn và sau khi về nhà.</p>
        `;
        document.getElementById('categorySelect').value = 'nhi-khoa';
        
        blogEditor.post.tags = ['chăm sóc trẻ em', 'mùa đông', 'sức khỏe'];
        blogEditor.renderTags();
    }
});

// Handle mobile menu
document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.nav');
    
    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', () => {
            nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
        });
    }
});

// Handle responsive behavior
window.addEventListener('resize', () => {
    const nav = document.querySelector('.nav');
    if (window.innerWidth > 768 && nav) {
        nav.style.display = 'flex';
    }
});