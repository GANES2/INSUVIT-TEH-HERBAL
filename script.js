// Global Variables
let cart = [];
let cartCount = 0;
let wishlist = [];
let currentUser = null;
let isLoggedIn = false;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    showLoadingScreen();
    loadCartFromStorage();
    loadWishlistFromStorage();
    loadUserFromStorage();
    updateCartDisplay();
    updateUIBasedOnAuth();
    initializeEventListeners();

    // Hide loading screen after resources loaded
    window.addEventListener('load', () => {
        setTimeout(() => {
            hideLoadingScreen();
        }, 1000);
    });
});

// ===== LOADING SCREEN FUNCTIONS =====
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 500);
    }
}

// ===== AUTHENTICATION FUNCTIONS =====
function showLoginTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.login-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    const selectedTab = document.getElementById(tabName + 'Tab');
    const selectedBtn = document.querySelector(`[onclick*="${tabName}"]`);

    if (selectedTab) selectedTab.classList.add('active');
    if (selectedBtn) selectedBtn.classList.add('active');
}

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const button = input.nextElementSibling;
    if (!button) return;

    const icon = button.querySelector('i');
    if (!icon) return;

    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    return password.length >= 8;
}

function checkPasswordStrength(password) {
    let strength = 0;
    const checks = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        numbers: /\d/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    strength = Object.values(checks).filter(Boolean).length;

    const strengthBar = document.querySelector('.strength-fill');
    const strengthText = document.querySelector('.strength-text');

    if (strengthBar && strengthText) {
        const percentage = (strength / 5) * 100;
        strengthBar.style.width = percentage + '%';

        if (strength < 2) {
            strengthBar.style.background = '#ff4757';
            strengthText.textContent = 'Password lemah';
        } else if (strength < 4) {
            strengthBar.style.background = '#ffa502';
            strengthText.textContent = 'Password sedang';
        } else {
            strengthBar.style.background = '#2ed573';
            strengthText.textContent = 'Password kuat';
        }
    }

    return strength >= 3;
}

function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const remember = document.getElementById('rememberMe');

    if (!email || !password) {
        showNotification('Form tidak lengkap', 'error');
        return;
    }

    if (validateEmail(email.value) && password.value.length > 0) {
        const submitBtn = event.target.querySelector('.btn-submit');
        showLoadingButton(submitBtn, 'Memproses...');

        setTimeout(() => {
            // Create mock user
            currentUser = {
                id: Date.now(),
                email: email.value,
                firstName: 'John',
                lastName: 'Doe',
                phone: '+62 812-3456-7890',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=center',
                joinDate: new Date().toISOString(),
                remember: remember ? remember.checked : false
            };

            isLoggedIn = true;
            saveUserToStorage();
            updateUIBasedOnAuth();
            closeLoginModal();
            showNotification('Login berhasil! Selamat datang ' + currentUser.firstName, 'success');
            resetLoadingButton(submitBtn, '<i class="fas fa-sign-in-alt"></i> Masuk');
        }, 1500);
    } else {
        showNotification('Email atau password tidak valid', 'error');
    }
}

function handleRegister(event) {
    event.preventDefault();
    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const email = document.getElementById('registerEmail');
    const phone = document.getElementById('phoneNumber');
    const password = document.getElementById('registerPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    const terms = document.querySelector('input[name="terms"]');

    if (!firstName || !lastName || !email || !phone || !password || !confirmPassword || !terms) {
        showNotification('Form tidak lengkap', 'error');
        return;
    }

    // Validation
    if (!validateEmail(email.value)) {
        showNotification('Format email tidak valid', 'error');
        return;
    }

    if (!validatePassword(password.value)) {
        showNotification('Password minimal 8 karakter', 'error');
        return;
    }

    if (password.value !== confirmPassword.value) {
        showNotification('Konfirmasi password tidak cocok', 'error');
        return;
    }

    if (!terms.checked) {
        showNotification('Harap setujui syarat dan ketentuan', 'error');
        return;
    }

    const submitBtn = event.target.querySelector('.btn-submit');
    showLoadingButton(submitBtn, 'Mendaftar...');

    setTimeout(() => {
        currentUser = {
            id: Date.now(),
            email: email.value,
            firstName: firstName.value,
            lastName: lastName.value,
            phone: phone.value,
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=center',
            joinDate: new Date().toISOString()
        };

        isLoggedIn = true;
        saveUserToStorage();
        updateUIBasedOnAuth();
        closeLoginModal();
        showNotification('Pendaftaran berhasil! Selamat bergabung ' + currentUser.firstName, 'success');
        resetLoadingButton(submitBtn, '<i class="fas fa-user-plus"></i> Daftar Sekarang');
    }, 1500);
}

function handleForgotPassword(event) {
    event.preventDefault();
    const email = document.getElementById('forgotEmail');

    if (!email) {
        showNotification('Form tidak lengkap', 'error');
        return;
    }

    if (!validateEmail(email.value)) {
        showNotification('Format email tidak valid', 'error');
        return;
    }

    const submitBtn = event.target.querySelector('.btn-submit');
    showLoadingButton(submitBtn, 'Mengirim...');

    setTimeout(() => {
        showNotification('Link reset password telah dikirim ke email Anda', 'success');
        resetLoadingButton(submitBtn, '<i class="fas fa-paper-plane"></i> Kirim Link Reset');
        showLoginTab('login');
    }, 1500);
}

function socialLogin(provider) {
    showNotification(`Login dengan ${provider} akan segera tersedia`, 'info');
}

function logout() {
    currentUser = null;
    isLoggedIn = false;
    localStorage.removeItem('insuvit_user');
    updateUIBasedOnAuth();
    closeUserDropdown();
    showNotification('Anda telah keluar dari akun', 'success');
}

function updateUIBasedOnAuth() {
    const loginBtn = document.getElementById('loginBtn');
    const userBtn = document.getElementById('userBtn');
    const headerUserName = document.getElementById('headerUserName');
    const headerUserAvatar = document.getElementById('headerUserAvatar');

    if (!loginBtn || !userBtn) return;

    if (isLoggedIn && currentUser) {
        loginBtn.style.display = 'none';
        userBtn.style.display = 'flex';

        if (headerUserName) headerUserName.textContent = currentUser.firstName;
        if (headerUserAvatar) headerUserAvatar.src = currentUser.avatar;

        // Update profile dropdown
        const userName = document.getElementById('userName');
        const userEmail = document.getElementById('userEmail');
        const userAvatar = document.getElementById('userAvatar');

        if (userName) userName.textContent = currentUser.firstName + ' ' + currentUser.lastName;
        if (userEmail) userEmail.textContent = currentUser.email;
        if (userAvatar) userAvatar.src = currentUser.avatar;
    } else {
        loginBtn.style.display = 'flex';
        userBtn.style.display = 'none';
    }
}

function toggleUserDropdown() {
    const dropdown = document.getElementById('userProfileDropdown');
    if (!dropdown) return;

    const isVisible = dropdown.style.display === 'block';
    dropdown.style.display = isVisible ? 'none' : 'block';

    if (!isVisible) {
        // Position dropdown
        const userBtn = document.getElementById('userBtn');
        if (userBtn) {
            const rect = userBtn.getBoundingClientRect();
            dropdown.style.top = (rect.bottom + 10) + 'px';
            dropdown.style.right = '20px';
        }
    }
}

function closeUserDropdown() {
    const dropdown = document.getElementById('userProfileDropdown');
    if (dropdown) dropdown.style.display = 'none';
}

// ===== USER PROFILE FUNCTIONS =====
function showUserProfile() {
    closeUserDropdown();
    const modal = document.getElementById('profileModal');
    if (!modal) return;

    // Populate form with current user data
    if (currentUser) {
        const fields = {
            'profileFirstName': currentUser.firstName || '',
            'profileLastName': currentUser.lastName || '',
            'profileEmail': currentUser.email || '',
            'profilePhone': currentUser.phone || '',
            'profileAddress': currentUser.address || '',
            'profileBirthdate': currentUser.birthdate || '',
            'profileGender': currentUser.gender || 'male'
        };

        Object.entries(fields).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.value = value;
        });

        const profileAvatar = document.getElementById('profileAvatar');
        if (profileAvatar && currentUser.avatar) {
            profileAvatar.src = currentUser.avatar;
        }
    }

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeProfileModal() {
    const modal = document.getElementById('profileModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function showOrderHistory() {
    closeUserDropdown();
    showNotification('Fitur riwayat pesanan akan segera tersedia', 'info');
}

function showWishlist() {
    closeUserDropdown();
    showNotification('Fitur wishlist akan segera tersedia', 'info');
}

function showSettings() {
    closeUserDropdown();
    showNotification('Fitur pengaturan akan segera tersedia', 'info');
}

// ===== UTILITY FUNCTIONS =====
function showLoadingButton(button, text) {
    if (!button) return;
    const originalHTML = button.innerHTML;
    button.dataset.originalHTML = originalHTML;
    button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${text}`;
    button.disabled = true;
}

function resetLoadingButton(button, html) {
    if (!button) return;
    button.innerHTML = html;
    button.disabled = false;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;

    const icon = type === 'success' ? 'check-circle' : 
                 type === 'error' ? 'exclamation-circle' : 
                 type === 'warning' ? 'exclamation-triangle' : 'info-circle';

    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}

// ===== WISHLIST FUNCTIONS =====
function toggleWishlist(productId, event) {
    event.stopPropagation();
    const button = event.target.closest('.wishlist-btn');
    if (!button) return;

    const icon = button.querySelector('i');
    if (!icon) return;

    if (wishlist.includes(productId)) {
        // Remove from wishlist
        wishlist = wishlist.filter(id => id !== productId);
        icon.classList.replace('fas', 'far');
        button.classList.remove('active');
        showNotification('Produk dihapus dari wishlist', 'info');
    } else {
        // Add to wishlist
        wishlist.push(productId);
        icon.classList.replace('far', 'fas');
        button.classList.add('active');
        showNotification('Produk ditambahkan ke wishlist', 'success');
    }

    saveWishlistToStorage();
}

// ===== IMAGE MODAL FUNCTIONS =====
function openImageModal(imageSrc, caption) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalCaption = document.getElementById('modalCaption');

    if (!modal || !modalImage || !modalCaption) return;

    modalImage.src = imageSrc;
    modalCaption.textContent = caption;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeImageModal() {
    const modal = document.getElementById('imageModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// ===== CART FUNCTIONS =====
function addToCart(id, name, price, image) {
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: id,
            name: name,
            price: price,
            image: image,
            quantity: 1
        });
    }

    updateCartDisplay();
    saveCartToStorage();
    showAddToCartNotification(name);
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartDisplay();
    saveCartToStorage();
}

function updateQuantity(id, change) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(id);
        } else {
            updateCartDisplay();
            saveCartToStorage();
        }
    }
}

function updateCartDisplay() {
    cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountEl = document.getElementById('cartCount');
    if (cartCountEl) cartCountEl.textContent = cartCount;

    const cartItems = document.getElementById('cartItems');
    const cartSummary = document.getElementById('cartSummary');

    if (!cartItems || !cartSummary) return;

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Keranjang belanja Anda masih kosong</p>
                <button onclick="closeCartModal(); scrollToSection('produk')" class="btn-secondary">Mulai Belanja</button>
            </div>
        `;
        cartSummary.style.display = 'none';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p class="cart-item-price">Rp ${item.price.toLocaleString('id-ID')}</p>
                </div>
                <div class="cart-item-controls">
                    <button onclick="updateQuantity('${item.id}', -1)" class="qty-btn">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity">${item.quantity}</span>
                    <button onclick="updateQuantity('${item.id}', 1)" class="qty-btn">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <div class="cart-item-total">
                    Rp ${(item.price * item.quantity).toLocaleString('id-ID')}
                </div>
                <button onclick="removeFromCart('${item.id}')" class="remove-item">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const subtotalEl = document.getElementById('subtotal');
        const totalAmountEl = document.getElementById('totalAmount');

        if (subtotalEl) subtotalEl.textContent = `Rp ${subtotal.toLocaleString('id-ID')}`;
        if (totalAmountEl) totalAmountEl.textContent = `Rp ${subtotal.toLocaleString('id-ID')}`;

        cartSummary.style.display = 'block';
    }
}

function showAddToCartNotification(itemName) {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${itemName} ditambahkan ke keranjang!</span>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// ===== CART MODAL FUNCTIONS =====
function openCartModal() {
    const modal = document.getElementById('cartModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeCartModal() {
    const modal = document.getElementById('cartModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// ===== CHECKOUT FUNCTIONS =====
function openCheckoutModal() {
    if (cart.length === 0) return;

    // Show guest notice if not logged in
    const guestNotice = document.getElementById('guestNotice');
    if (guestNotice) {
        guestNotice.style.display = isLoggedIn ? 'none' : 'block';
    }

    closeCartModal();

    const modal = document.getElementById('checkoutModal');
    const checkoutItems = document.getElementById('checkoutItems');
    const checkoutTotal = document.getElementById('checkoutTotal');

    if (!modal || !checkoutItems || !checkoutTotal) return;

    checkoutItems.innerHTML = cart.map(item => `
        <div class="checkout-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="checkout-item-details">
                <h5>${item.name}</h5>
                <p>Qty: ${item.quantity} × Rp ${item.price.toLocaleString('id-ID')}</p>
            </div>
            <div class="checkout-item-total">
                Rp ${(item.price * item.quantity).toLocaleString('id-ID')}
            </div>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    checkoutTotal.textContent = `Rp ${total.toLocaleString('id-ID')}`;

    // Pre-fill form if user is logged in
    if (currentUser && isLoggedIn) {
        const fullNameInput = document.querySelector('input[name="fullName"]');
        const phoneInput = document.querySelector('input[name="phone"]');
        const emailInput = document.querySelector('input[name="email"]');

        if (fullNameInput) fullNameInput.value = `${currentUser.firstName} ${currentUser.lastName}`;
        if (phoneInput) phoneInput.value = currentUser.phone || '';
        if (emailInput) emailInput.value = currentUser.email || '';
    }

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function processOrder() {
    const form = document.getElementById('checkoutForm');
    const paymentMethod = document.querySelector('input[name="payment"]:checked');

    if (!form) {
        showNotification('Form tidak ditemukan', 'error');
        return;
    }

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    if (!paymentMethod) {
        showNotification('Silakan pilih metode pembayaran', 'warning');
        return;
    }

    const formData = new FormData(form);
    const orderData = {
        orderId: 'INS-' + Date.now(),
        customer: {
            fullName: formData.get('fullName'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            address: formData.get('address'),
            city: formData.get('city'),
            postal: formData.get('postal')
        },
        items: cart,
        paymentMethod: paymentMethod.value,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        orderDate: new Date().toLocaleDateString('id-ID'),
        status: 'processing'
    };

    const orderBtn = document.querySelector('.btn-order');
    showLoadingButton(orderBtn, 'Memproses Pesanan...');

    setTimeout(() => {
        showSuccessModal(orderData);
        clearCart();
        closeCheckoutModal();
        resetLoadingButton(orderBtn, '<i class="fas fa-check-circle"></i> Buat Pesanan');

        // Save order to user's history if logged in
        if (isLoggedIn && currentUser) {
            if (!currentUser.orders) currentUser.orders = [];
            currentUser.orders.push(orderData);
            saveUserToStorage();
        }
    }, 2000);
}

function showSuccessModal(orderData) {
    const modal = document.getElementById('successModal');
    const orderDetails = document.getElementById('orderDetails');

    if (!modal || !orderDetails) return;

    orderDetails.innerHTML = `
        <div class="order-info">
            <p><strong>ID Pesanan:</strong> ${orderData.orderId}</p>
            <p><strong>Nama:</strong> ${orderData.customer.fullName}</p>
            <p><strong>Telepon:</strong> ${orderData.customer.phone}</p>
            <p><strong>Alamat:</strong> ${orderData.customer.address}, ${orderData.customer.city}</p>
            <p><strong>Pembayaran:</strong> ${getPaymentMethodName(orderData.paymentMethod)}</p>
            <p><strong>Total:</strong> Rp ${orderData.total.toLocaleString('id-ID')}</p>
            <p><strong>Tanggal:</strong> ${orderData.orderDate}</p>
            <p><strong>Status:</strong> <span class="status-processing">Sedang Diproses</span></p>
        </div>
    `;

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeSuccessModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        scrollToSection('home');
    }
}

function getPaymentMethodName(method) {
    const methods = {
        'dana': 'DANA',
        'gopay': 'GoPay',
        'shopeepay': 'ShopeePay',
        'qris': 'QRIS',
        'bca': 'Transfer BCA',
        'mandiri': 'Transfer Mandiri',
        'bri': 'Transfer BRI',
        'bni': 'Transfer BNI'
    };
    return methods[method] || method;
}

function clearCart() {
    cart = [];
    updateCartDisplay();
    saveCartToStorage();
}

// ===== LOGIN MODAL FUNCTIONS =====
function openLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        showLoginTab('login');
    }
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// ===== STORAGE FUNCTIONS =====
function saveCartToStorage() {
    localStorage.setItem('insuvit_cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('insuvit_cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch (e) {
            console.error('Error loading cart:', e);
            cart = [];
        }
    }
}

function saveWishlistToStorage() {
    localStorage.setItem('insuvit_wishlist', JSON.stringify(wishlist));
}

function loadWishlistFromStorage() {
    const savedWishlist = localStorage.getItem('insuvit_wishlist');
    if (savedWishlist) {
        try {
            wishlist = JSON.parse(savedWishlist);

            // Update wishlist UI
            wishlist.forEach(productId => {
                const button = document.querySelector(`[onclick*="toggleWishlist('${productId}"`);
                if (button && button.classList.contains('wishlist-btn')) {
                    button.classList.add('active');
                    const icon = button.querySelector('i');
                    if (icon) icon.classList.replace('far', 'fas');
                }
            });
        } catch (e) {
            console.error('Error loading wishlist:', e);
            wishlist = [];
        }
    }
}

function saveUserToStorage() {
    if (currentUser) {
        localStorage.setItem('insuvit_user', JSON.stringify({
            user: currentUser,
            isLoggedIn: isLoggedIn,
            timestamp: Date.now()
        }));
    }
}

function loadUserFromStorage() {
    const savedData = localStorage.getItem('insuvit_user');
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            const dayInMs = 24 * 60 * 60 * 1000;

            // Check if data is not expired (7 days) or user chose to be remembered
            if (data.user.remember || (Date.now() - data.timestamp) < (7 * dayInMs)) {
                currentUser = data.user;
                isLoggedIn = data.isLoggedIn;
            }
        } catch (e) {
            console.error('Error loading user:', e);
        }
    }
}

// ===== NAVIGATION FUNCTIONS =====
function scrollToSection(sectionId) {
    const target = document.getElementById(sectionId);
    if (target) {
        target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// ===== EVENT LISTENERS =====
function initializeEventListeners() {
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            const navbarUl = document.querySelector('.navbar ul');
            if (navbarUl) navbarUl.classList.toggle('show');

            const icon = this.querySelector('i');
            if (icon) {
                if (icon.classList.contains('fa-bars')) {
                    icon.classList.replace('fa-bars', 'fa-times');
                } else {
                    icon.classList.replace('fa-times', 'fa-bars');
                }
            }
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href && href !== '#') {
                e.preventDefault();
                const targetId = href.substring(1);
                if (targetId) {
                    scrollToSection(targetId);
                }
            }
        });
    });

    // Header scroll effect
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        if (header) {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    });

    // Close modals and dropdowns when clicking outside
    window.addEventListener('click', function(event) {
        // Close user dropdown if clicking outside
        const userDropdown = document.getElementById('userProfileDropdown');
        const userBtn = document.getElementById('userBtn');
        if (userDropdown && userBtn && 
            userDropdown.style.display === 'block' && 
            !userDropdown.contains(event.target) && 
            !userBtn.contains(event.target)) {
            closeUserDropdown();
        }

        // Close modals when clicking on backdrop
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Form submissions
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const forgotForm = document.getElementById('forgotForm');
    const profileForm = document.getElementById('profileForm');

    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    if (forgotForm) forgotForm.addEventListener('submit', handleForgotPassword);

    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (currentUser) {
                currentUser.firstName = document.getElementById('profileFirstName')?.value || currentUser.firstName;
                currentUser.lastName = document.getElementById('profileLastName')?.value || currentUser.lastName;
                currentUser.email = document.getElementById('profileEmail')?.value || currentUser.email;
                currentUser.phone = document.getElementById('profilePhone')?.value || currentUser.phone;
                currentUser.address = document.getElementById('profileAddress')?.value || currentUser.address;
                currentUser.birthdate = document.getElementById('profileBirthdate')?.value || currentUser.birthdate;
                currentUser.gender = document.getElementById('profileGender')?.value || currentUser.gender;

                saveUserToStorage();
                updateUIBasedOnAuth();
                closeProfileModal();
                showNotification('Profil berhasil diperbarui', 'success');
            }
        });
    }

    // Password strength checker
    const registerPassword = document.getElementById('registerPassword');
    if (registerPassword) {
        registerPassword.addEventListener('input', function() {
            checkPasswordStrength(this.value);
        });
    }

    // Confirm password validation
    const confirmPassword = document.getElementById('confirmPassword');
    if (confirmPassword) {
        confirmPassword.addEventListener('input', function() {
            const password = document.getElementById('registerPassword');
            const matchText = document.querySelector('.password-match');

            if (password && matchText) {
                if (this.value !== password.value) {
                    matchText.textContent = 'Password tidak cocok';
                    matchText.style.color = '#ff4757';
                } else {
                    matchText.textContent = 'Password cocok';
                    matchText.style.color = '#2ed573';
                }
            }
        });
    }

    // Payment method selection
    document.querySelectorAll('.payment-option').forEach(option => {
        option.addEventListener('click', function() {
            const radio = this.querySelector('input[type="radio"]');
            if (radio) radio.checked = true;

            document.querySelectorAll('.payment-option').forEach(opt => {
                opt.classList.remove('active');
            });

            this.classList.add('active');
        });
    });

    // Newsletter form
    const newsletterBtn = document.querySelector('.newsletter-form button');
    if (newsletterBtn) {
        newsletterBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const emailInput = document.querySelector('.newsletter-form input');
            if (emailInput) {
                const email = emailInput.value;
                if (email && validateEmail(email)) {
                    showNotification('Terima kasih! Anda telah berlangganan newsletter kami', 'success');
                    emailInput.value = '';
                } else {
                    showNotification('Masukkan email yang valid', 'error');
                }
            }
        });
    }

    // Product card animation on scroll
    const observeElements = document.querySelectorAll('.product-card, .gallery-item, .contact-item');
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });

    observeElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Escape key to close modals
    if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (modal.style.display === 'block') {
                modal.style.display = 'none';
            }
        });
        document.body.style.overflow = 'auto';
        closeUserDropdown();
    }

    // Ctrl+K to open search
    if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        showNotification('Fitur pencarian akan segera tersedia', 'info');
    }
});
