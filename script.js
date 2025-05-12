document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const productListElement = document.getElementById('productList');
    const cartItemsElement = document.getElementById('cartItems');
    const cartTotalElement = document.getElementById('cartTotal');
    const finalTotalElement = document.getElementById('finalTotal');
    const cartCountElement = document.getElementById('cartCount');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const errorMessageElement = document.getElementById('errorMessage');
    const cartToggleBtn = document.getElementById('cartToggleBtn');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const shoppingCartElement = document.getElementById('shoppingCart');
    const overlayElement = document.getElementById('overlay');
    const productSortElement = document.getElementById('productSort');
    const notificationToast = document.getElementById('notificationToast');
    const notificationMessage = document.getElementById('notificationMessage');

    // Product data - using more appealing images and descriptions
    const products = [
        {
            id: 'prod_001',
            name: 'Lollipop Swirl',
            image: 'https://images.unsplash.com/photo-1575224300306-1b8da36134ec?auto=format&fit=crop&q=80&w=500',
            price: 1.50,
            description: 'A rainbow swirl lollipop bursting with fruity flavors that dance on your tongue.'
        },
        {
            id: 'prod_002',
            name: 'BubbleTwist',
            image: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&q=80&w=500',
            price: 2.25,
            description: 'Chewy bubblegum with a surprising strawberry liquid center. A nostalgic favorite.'
        },
        {
            id: 'prod_003',
            name: 'ChocoDream Bar',
            image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&q=80&w=500',
            price: 3.00,
            description: 'Velvety smooth milk chocolate bar with caramel threads for an indulgent experience.'
        },
        {
            id: 'prod_004',
            name: 'SourBerry Twists',
            image: 'https://images.unsplash.com/photo-1563262924-641a8b3d397f?auto=format&fit=crop&q=80&w=500',
            price: 1.75,
            description: 'Intensely sour and sweet gummy twists made with real fruit juice. Pucker up!'
        },
        {
            id: 'prod_005',
            name: 'MintyFresh Chews',
            image: 'https://sworxbottling.com/wp-content/uploads/2025/05/Zazzy-3-e1746933412362.png',
            price: 2.00,
            description: 'Cool and refreshing mint chews that leave your breath feeling invigorated for hours.'
        },
        {
            id: 'prod_006',
            name: 'Gummy Bears',
            image: 'https://sworxbottling.com/wp-content/uploads/2025/05/Zazzy-3-e1746933412362.png',
            price: 2.50,
            description: 'Soft, chewy bears in assorted fruit flavors. Made with natural fruit extracts.'
        }
    ];

    let cart = []; // Format: [{ id, name, price, image, quantity }]
    let notificationTimeout; // For managing notification timeouts

    // --- Product Display ---
    function renderProducts(productArray = products) {
        if (!productListElement) return;
        
        // Remove loading indicator
        const loadingElement = document.querySelector('.loading-products');
        if (loadingElement) {
            loadingElement.remove();
        }
        
        // Clear existing products
        productListElement.innerHTML = '';
        
        productArray.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.setAttribute('data-id', product.id);
            
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <span class="price">$${product.price.toFixed(2)}</span>
                    <p class="description">${product.description}</p>
                    <button class="add-to-cart-btn">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                </div>
            `;
            
            productListElement.appendChild(productCard);
            
            // Add event listener to "Add to Cart" button
            const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
            addToCartBtn.addEventListener('click', () => {
                addToCart(product.id);
                // Add animation effect
                addToCartBtn.innerHTML = '<i class="fas fa-check"></i> Added';
                addToCartBtn.style.backgroundColor = 'var(--success-color)';
                
                setTimeout(() => {
                    addToCartBtn.innerHTML = '<i class="fas fa-shopping-cart"></i> Add to Cart';
                    addToCartBtn.style.backgroundColor = '';
                }, 1500);
            });
        });
    }

    // --- Cart Management ---
    function addToCart(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const cartItem = cart.find(item => item.id === productId);
        if (cartItem) {
            cartItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        
        showNotification(`${product.name} added to cart!`);
        updateCart();
    }

    function updateCartItemQuantity(productId, newQuantity) {
        const cartItem = cart.find(item => item.id === productId);
        if (cartItem) {
            cartItem.quantity = newQuantity;
            if (cartItem.quantity <= 0) {
                removeFromCart(productId, true); // true to suppress double notification
            } else {
                updateCart();
            }
        }
    }

    function removeFromCart(productId, suppressNotification = false) {
        const itemIndex = cart.findIndex(item => item.id === productId);
        if (itemIndex > -1) {
            const itemName = cart[itemIndex].name;
            cart.splice(itemIndex, 1);
            
            if (!suppressNotification) {
                showNotification(`${itemName} removed from cart`);
            }
            
            updateCart();
        }
    }

    function updateCart() {
        if (!cartItemsElement || !cartTotalElement || !cartCountElement) return;

        // Clear cart
        cartItemsElement.innerHTML = '';
        
        if (cart.length === 0) {
            cartItemsElement.innerHTML = `
                <div class="empty-cart-message">
                    <i class="fas fa-shopping-bag"></i>
                    Your cart is empty
                </div>
            `;
            checkoutBtn.disabled = true;
        } else {
            checkoutBtn.disabled = false;
            
            cart.forEach(item => {
                const cartItemEl = document.createElement('div');
                cartItemEl.className = 'cart-item';
                cartItemEl.setAttribute('data-id', item.id);
                
                cartItemEl.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <span class="price">$${item.price.toFixed(2)}</span>
                        <div class="cart-item-actions">
                            <div class="quantity-controls">
                                <button class="quantity-change" data-action="decrease">
                                    <i class="fas fa-minus"></i>
                                </button>
                                <input type="number" value="${item.quantity}" min="1" class="quantity-input" readonly>
                                <button class="quantity-change" data-action="increase">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                            <button class="remove-item-btn">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                `;
                
                cartItemsElement.appendChild(cartItemEl);
                
                // Add event listeners for cart item actions
                const decreaseBtn = cartItemEl.querySelector('[data-action="decrease"]');
                const increaseBtn = cartItemEl.querySelector('[data-action="increase"]');
                const removeBtn = cartItemEl.querySelector('.remove-item-btn');
                
                decreaseBtn.addEventListener('click', () => {
                    updateCartItemQuantity(item.id, item.quantity - 1);
                });
                
                increaseBtn.addEventListener('click', () => {
                    updateCartItemQuantity(item.id, item.quantity + 1);
                });
                
                removeBtn.addEventListener('click', () => {
                    removeFromCart(item.id);
                });
            });
        }

        // Update cart totals
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        cartTotalElement.textContent = subtotal.toFixed(2);
        finalTotalElement.textContent = subtotal.toFixed(2); // Same as subtotal since shipping is free
        cartCountElement.textContent = itemCount;
        
        // Save cart to localStorage for persistence
        localStorage.setItem('candyHavenCart', JSON.stringify(cart));
    }

    // --- Checkout Logic ---
    async function handleCheckout() {
        if (cart.length === 0) {
            showError("Your cart is empty. Please add items before checking out.");
            return;
        }

        // Disable button and show loading state
        checkoutBtn.disabled = true;
        loadingIndicator.style.display = 'flex';
        errorMessageElement.style.display = 'none';
        errorMessageElement.textContent = '';

        // Prepare order items
        const orderItems = cart.map(item => ({
            id: item.id,
            image: item.image,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
        }));

        // Generate order reference
        const orderReference = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

        try {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Simulate API call
            const phatfiApiUrl = `https://api.phatfi.com/api/create/payment/`;
            const webhookUrl = `https://api.phatfi.com/api/webhooks/payment`;
            const returnUrl = `https://store.phatfi.com/success.html`;
            
            console.log('Creating payment request:', {
                items: orderItems,
                reference: orderReference,
                webhookUrl: webhookUrl,
                returnUrl: returnUrl
            });
            
            // Simulate successful payment
            showNotification("Order placed successfully! Redirecting to payment page...");
            
            // Clear cart after successful order
            cart = [];
            updateCart();
            closeCart();

    
            const simulatedPhatfiSecretKey = process.env.api_key; // Placeholder
    
            const requestBody = {
                items: orderItems,
                reference: orderReference,
                webhookUrl: webhookUrl,
                returnUrl: returnUrl
            };
    
            const { data } = await axios.post(phatfiApiUrl, requestBody, {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${simulatedPhatfiSecretKey}`
                }
              });
             
              console.log(data)
            
            // In a real scenario, this would redirect to a payment page
            location.href = data?.paymentUrl;
            
        } catch (error) {
            console.error('Failed to create payment request:', error);
            showError(`An error occurred: ${error.message || 'Could not connect to payment server.'}`);
        } finally {
            checkoutBtn.disabled = false;
            loadingIndicator.style.display = 'none';
        }
    }

    // --- Product Sorting ---
    function sortProducts(sortType) {
        let sortedProducts = [...products];
        
        switch(sortType) {
            case 'price-low':
                sortedProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                sortedProducts.sort((a, b) => b.price - a.price);
                break;
            case 'name':
                sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            default:
                // Default keeps original order
                break;
        }
        
        renderProducts(sortedProducts);
    }

    // --- UI Helpers ---
    function toggleCart() {
        shoppingCartElement.classList.toggle('open');
        overlayElement.classList.toggle('active');
        
        // Prevent body scrolling when cart is open
        document.body.style.overflow = shoppingCartElement.classList.contains('open') ? 'hidden' : '';
    }
    
    function closeCart() {
        shoppingCartElement.classList.remove('open');
        overlayElement.classList.remove('active');
        document.body.style.overflow = '';
    }

    function showNotification(message) {
        // Clear any existing timeouts
        if (notificationTimeout) {
            clearTimeout(notificationTimeout);
        }
        
        // Update message and show notification
        notificationMessage.textContent = message;
        notificationToast.classList.add('show');
        
        // Auto-hide after 3 seconds
        notificationTimeout = setTimeout(() => {
            notificationToast.classList.remove('show');
        }, 3000);
    }

    function showError(message) {
        errorMessageElement.textContent = message;
        errorMessageElement.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorMessageElement.style.display = 'none';
        }, 5000);
    }

    // --- Event Listeners ---
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckout);
    }
    
    if (cartToggleBtn) {
        cartToggleBtn.addEventListener('click', toggleCart);
    }
    
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', closeCart);
    }
    
    if (overlayElement) {
        overlayElement.addEventListener('click', closeCart);
    }
    
    if (productSortElement) {
        productSortElement.addEventListener('change', (e) => {
            sortProducts(e.target.value);
        });
    }
    
    // Close notification when clicking the close button
    document.querySelector('.notification-close').addEventListener('click', () => {
        notificationToast.classList.remove('show');
        if (notificationTimeout) {
            clearTimeout(notificationTimeout);
        }
    });

    // --- Initial Setup ---
    function init() {
        // Load cart from localStorage if available
        const savedCart = localStorage.getItem('candyHavenCart');
        if (savedCart) {
            try {
                cart = JSON.parse(savedCart);
            } catch (e) {
                console.error('Failed to parse saved cart:', e);
                cart = [];
            }
        }
        
        // Simulate loading delay for products
        setTimeout(() => {
            renderProducts();
            updateCart();
        }, 800);
    }
    
    // Initialize the application
    init();
});