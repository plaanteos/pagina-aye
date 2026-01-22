/* Payment System JavaScript */
(function() {
    'use strict';
    
    const PaymentSystem = {
        currentMethod: null,
        formValidation: {},
        cart: [],
        cartTotal: 0,
        
        init() {
            this.loadCartData();
            this.bindEvents();
            this.initCardValidation();
            this.initCopyFunctionality();
            this.updateCartSummary();
            this.updateCashMode(); // Inicializar modo de efectivo
        },
        
        loadCartData() {
            // Load cart from localStorage (from store.js)
            const cartData = localStorage.getItem('cart');
            const totalData = localStorage.getItem('cart_total');
            
            if (cartData) {
                this.cart = JSON.parse(cartData);
            }
            
            if (totalData) {
                this.cartTotal = parseFloat(totalData);
            }
            
            console.log('Cart loaded:', this.cart, 'Total:', this.cartTotal);
        },
        
        updateCartSummary() {
            // Update cart summary in payment section
            const summaryElement = document.getElementById('cart-summary');
            if (summaryElement && this.cart.length > 0) {
                let summaryHTML = '<h4>Resumen del Pedido</h4>';
                
                this.cart.forEach(item => {
                    summaryHTML += `
                        <div class="cart-item">
                            <span>${item.name} (x${item.quantity})</span>
                            <span>$${(item.price * item.quantity).toLocaleString('es-AR')}</span>
                        </div>
                    `;
                });
                
                summaryHTML += `
                    <div class="cart-total">
                        <strong>Total: $${this.cartTotal.toLocaleString('es-AR')} ARS</strong>
                    </div>
                `;
                
                summaryElement.innerHTML = summaryHTML;
            }
        },
        
        bindEvents() {
            // Payment method selection
            document.querySelectorAll('input[name="payment"]').forEach(radio => {
                radio.addEventListener('change', (e) => {
                    this.handlePaymentMethodChange(e.target.value);
                });
            });
            
            // Mercado Pago method selection
            document.querySelectorAll('input[name="mp-method"]').forEach(radio => {
                radio.addEventListener('change', (e) => {
                    this.handleMercadoPagoMethodChange(e.target.value);
                });
            });
            
            // Copy buttons
            document.querySelectorAll('.copy-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    this.copyToClipboard(e.target.dataset.target);
                });
            });
            
            // Installments change for cards
            const installmentsSelect = document.getElementById('installments');
            if (installmentsSelect) {
                installmentsSelect.addEventListener('change', (e) => {
                    const val = Math.min(12, Math.max(1, parseInt(e.target.value || '1')));
                    e.target.value = String(val);
                    this.updateInstallmentInfo(e.target.value);
                });
            }

            // Toggle efectivo por método de envío
            document.querySelectorAll('input[name="shipping"]').forEach(r => {
                r.addEventListener('change', () => this.updateCashMode());
            });
        },
        
        handlePaymentMethodChange(method) {
            this.currentMethod = method;
            
            // Hide all payment forms
            document.querySelectorAll('.payment-form').forEach(form => {
                form.classList.add('hidden');
            });
            
            // Show specific form based on method
            switch(method) {
                case 'mercadopago':
                    document.getElementById('mercadopagoForm').classList.remove('hidden');
                    break;
                case 'card':
                    document.getElementById('cardForm').classList.remove('hidden');
                    break;
                case 'cash':
                    document.getElementById('cashInfo').classList.remove('hidden');
                    this.updateCashMode();
                    break;
                case 'transfer':
                    document.getElementById('transferInfo').classList.remove('hidden');
                    break;
                    break;
            }
            
            this.updateSummary();
        },

        updateCashMode() {
            const pickup = document.querySelector('input[name="shipping"][value="pickup"]')?.checked;
            const delivery = document.querySelector('input[name="shipping"][value="delivery"]')?.checked;
            const cashPickup = document.getElementById('cashPickup');
            const cashDelivery = document.getElementById('cashDelivery');
            const cashDescription = document.getElementById('cashDescription');
            const cashBenefits = document.getElementById('cashBenefits');
            const shippingAddress = document.getElementById('shippingAddress');
            
            // Actualizar contenido de la opción de efectivo
            if (cashDescription && cashBenefits) {
                if (pickup) {
                    cashDescription.textContent = 'Pago en el local al retirar';
                    cashBenefits.innerHTML = `
                        <span class="benefit">✓ Sin comisiones</span>
                        <span class="benefit">✓ Retiro inmediato</span>
                    `;
                } else if (delivery) {
                    cashDescription.textContent = 'RapiPago, PagoFácil únicamente'; 
                    cashBenefits.innerHTML = `
                        <span class="benefit">✓ Sin comisiones</span>
                        <span class="benefit">✓ 48hs para pagar</span>
                    `;
                } else {
                    // Valor por defecto
                    cashDescription.textContent = 'RapiPago, PagoFácil, Pago Mis Cuentas';
                    cashBenefits.innerHTML = `
                        <span class="benefit">✓ Sin comisiones</span>
                        <span class="benefit">✓ 48hs para pagar</span>
                    `;
                }
            }
            
            // Manejar visibility de los modos de efectivo
            if (cashPickup && cashDelivery) {
                if (pickup) {
                    cashPickup.classList.remove('hidden');
                    cashDelivery.classList.add('hidden');
                } else if (delivery) {
                    cashDelivery.classList.remove('hidden');
                    cashPickup.classList.add('hidden');
                } else {
                    cashPickup.classList.add('hidden');
                    cashDelivery.classList.add('hidden');
                }
            }
            
            // Manejar campos de dirección: solo para delivery
            if (shippingAddress) {
                if (delivery) {
                    shippingAddress.classList.remove('hidden');
                } else {
                    shippingAddress.classList.add('hidden');
                    // Limpiar campos si se ocultan
                    const addressFields = shippingAddress.querySelectorAll('input');
                    addressFields.forEach(field => field.value = '');
                }
            }
        },
        
        handleMercadoPagoMethodChange(mpMethod) {
            console.log('Mercado Pago method selected:', mpMethod);
            // Here you would integrate with Mercado Pago SDK
        },
        
        initCardValidation() {
            const cardNumber = document.getElementById('cardNumber');
            const cardExpiry = document.getElementById('cardExpiry');
            const cardCVC = document.getElementById('cardCVC');
            
            if (cardNumber) {
                cardNumber.addEventListener('input', (e) => {
                    this.formatCardNumber(e.target);
                    this.detectCardType(e.target.value);
                });
            }
            
            if (cardExpiry) {
                cardExpiry.addEventListener('input', (e) => {
                    this.formatCardExpiry(e.target);
                });
            }
            
            if (cardCVC) {
                cardCVC.addEventListener('input', (e) => {
                    this.validateCVC(e.target);
                });
            }
        },
        
        formatCardNumber(input) {
            let value = input.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            input.value = formattedValue;
        },
        
        formatCardExpiry(input) {
            let value = input.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            input.value = value;
        },
        
        detectCardType(number) {
            const cardType = document.getElementById('cardType');
            if (!cardType) return;
            
            const cleanNumber = number.replace(/\s/g, '');
            
            if (/^4/.test(cleanNumber)) {
                cardType.innerHTML = '💳 Visa';
            } else if (/^5[1-5]/.test(cleanNumber)) {
                cardType.innerHTML = '💳 Mastercard';
            } else if (/^3[47]/.test(cleanNumber)) {
                cardType.innerHTML = '💳 American Express';
            } else {
                cardType.innerHTML = '';
            }
        },
        
        validateCVC(input) {
            const value = input.value.replace(/[^0-9]/g, '');
            input.value = value;
            
            if (value.length >= 3) {
                input.classList.add('valid');
            } else {
                input.classList.remove('valid');
            }
        },
        
        initCopyFunctionality() {
            document.querySelectorAll('.copyable').forEach(element => {
                element.addEventListener('click', () => {
                    this.copyToClipboard(element.dataset.copy);
                });
            });
        },
        
        copyToClipboard(text) {
            if (navigator.clipboard) {
                navigator.clipboard.writeText(text).then(() => {
                    this.showCopyNotification('Copiado al portapapeles');
                });
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                this.showCopyNotification('Copiado al portapapeles');
            }
        },
        
        showCopyNotification(message) {
            const notification = document.createElement('div');
            notification.className = 'copy-notification';
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--success);
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                z-index: 10000;
                font-weight: 600;
                animation: slideInRight 0.3s ease;
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 2000);
        },
        
        // Descuentos deshabilitados por política actual
        
        getCurrentTotal() {
            // Get current cart total
            const totalElement = document.getElementById('summaryTotal');
            if (totalElement) {
                const totalText = totalElement.textContent.replace(/[^0-9.,]/g, '');
                return parseFloat(totalText.replace(',', '.')) || 0;
            }
            return 0;
        },
        
        updateTotalDisplay(newTotal, discountText) {
            const totalElement = document.getElementById('summaryTotal');
            if (totalElement) {
                totalElement.innerHTML = `€${newTotal.toFixed(2)} <small style="color: var(--success); font-size: 0.8rem;">(${discountText})</small>`;
            }
        },
        
        updateInstallmentInfo(installments) {
            const installmentInfo = document.createElement('div');
            installmentInfo.className = 'installment-info';
            installmentInfo.style.cssText = `
                margin-top: 0.5rem;
                padding: 0.5rem;
                background: rgba(212, 175, 55, 0.1);
                border-radius: 4px;
                font-size: 0.85rem;
            `;
            
            const currentTotal = this.getCurrentTotal();
            const installmentAmount = currentTotal / parseInt(installments);
            
            if (installments === '1') {
                installmentInfo.innerHTML = `<strong>Pago único:</strong>$${currentTotal.toFixed(2)}`;
            } else if (installments <= '6') {
                installmentInfo.innerHTML = `<strong>${installments} cuotas sin interés:</strong>$${installmentAmount.toFixed(2)} por mes`;
            } else {
                const withInterest = installmentAmount * 1.15; // 15% interest for 12 months
                installmentInfo.innerHTML = `<strong>${installments} cuotas con interés:</strong>$${withInterest.toFixed(2)} por mes`;
            }
            
            // Remove existing installment info
            const existingInfo = document.querySelector('.installment-info');
            if (existingInfo) {
                existingInfo.remove();
            }
            
            // Add new installment info
            const installmentsSelect = document.getElementById('installments');
            if (installmentsSelect) {
                installmentsSelect.parentNode.appendChild(installmentInfo);
            }
        },
        
        updateSummary() {
            // Update checkout summary based on selected payment method
            // This would integrate with your existing cart system
            console.log('Updating summary for payment method:', this.currentMethod);
        },
        
        validatePaymentForm() {
            switch(this.currentMethod) {
                case 'card':
                    return this.validateCardForm();
                case 'mercadopago':
                    return this.validateMercadoPagoForm();
                case 'cash':
                case 'transfer':
                case 'digital':
                case 'crypto':
                    return true; // These don't require form validation
                default:
                    return false;
            }
        },
        
        validateCardForm() {
            const cardNumber = document.getElementById('cardNumber');
            const cardExpiry = document.getElementById('cardExpiry');
            const cardCVC = document.getElementById('cardCVC');
            const cardHolder = document.getElementById('cardHolder');
            
            let isValid = true;
            
            // Validate card number (basic Luhn algorithm)
            if (!cardNumber || !this.isValidCardNumber(cardNumber.value)) {
                this.showFieldError(cardNumber, 'Número de tarjeta inválido');
                isValid = false;
            }
            
            // Validate expiry
            if (!cardExpiry || !this.isValidExpiry(cardExpiry.value)) {
                this.showFieldError(cardExpiry, 'Fecha de vencimiento inválida');
                isValid = false;
            }
            
            // Validate CVC
            if (!cardCVC || cardCVC.value.length < 3) {
                this.showFieldError(cardCVC, 'Código de seguridad inválido');
                isValid = false;
            }
            
            // Validate card holder
            if (!cardHolder || cardHolder.value.length < 2) {
                this.showFieldError(cardHolder, 'Nombre del titular requerido');
                isValid = false;
            }
            
            return isValid;
        },
        
        validateMercadoPagoForm() {
            const selectedMethod = document.querySelector('input[name="mp-method"]:checked');
            return !!selectedMethod;
        },
        
        isValidCardNumber(number) {
            const cleanNumber = number.replace(/\s/g, '');
            return /^\d{13,19}$/.test(cleanNumber) && this.luhnCheck(cleanNumber);
        },
        
        luhnCheck(number) {
            let sum = 0;
            let isEven = false;
            
            for (let i = number.length - 1; i >= 0; i--) {
                let digit = parseInt(number.charAt(i));
                
                if (isEven) {
                    digit *= 2;
                    if (digit > 9) {
                        digit -= 9;
                    }
                }
                
                sum += digit;
                isEven = !isEven;
            }
            
            return sum % 10 === 0;
        },
        
        isValidExpiry(expiry) {
            const match = expiry.match(/^(\d{2})\/(\d{2})$/);
            if (!match) return false;
            
            const month = parseInt(match[1]);
            const year = parseInt('20' + match[2]);
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth() + 1;
            
            return month >= 1 && month <= 12 && 
                   (year > currentYear || (year === currentYear && month >= currentMonth));
        },
        
        showFieldError(field, message) {
            field.classList.add('error');
            
            // Remove existing error message
            const existingError = field.parentNode.querySelector('.field-error-message');
            if (existingError) {
                existingError.remove();
            }
            
            // Add new error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'field-error-message';
            errorDiv.textContent = message;
            errorDiv.style.cssText = `
                color: var(--danger);
                font-size: 0.75rem;
                margin-top: 0.25rem;
                font-weight: 500;
            `;
            
            field.parentNode.appendChild(errorDiv);
            
            // Remove error after user starts typing
            field.addEventListener('input', () => {
                field.classList.remove('error');
                const errorMsg = field.parentNode.querySelector('.field-error-message');
                if (errorMsg) {
                    errorMsg.remove();
                }
            }, { once: true });
        },
        
        async processPayment() {
            if (!this.validatePaymentForm()) {
                return false;
            }
            
            // Validate cart data
            if (!this.cart || this.cart.length === 0) {
                this.showPaymentError('Tu carrito está vacío. Agrega productos antes de proceder al pago.');
                return false;
            }
            
            // Show loading state
            this.showLoadingState();
            
            try {
                switch(this.currentMethod) {
                    case 'mercadopago':
                        return await this.processMercadoPago();
                    case 'card':
                        return this.processCard();
                    case 'cash':
                        return this.processCash();
                    case 'transfer':
                        return this.processTransfer();
                    default:
                        this.showPaymentError('Por favor selecciona un método de pago');
                        return false;
                }
            } catch (error) {
                console.error('Payment processing error:', error);
                this.showPaymentError('Error al procesar el pago: ' + error.message);
                return false;
            } finally {
                this.hideLoadingState();
            }
        },
        
        showLoadingState() {
            const submitBtn = document.querySelector('.submit-payment');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span>Procesando...</span>';
            }
        },
        
        hideLoadingState() {
            const submitBtn = document.querySelector('.submit-payment');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<span>Procesar Pago</span>';
            }
        },
        
        processMercadoPago() {
            // Here you would integrate with Mercado Pago API
            console.log('Processing Mercado Pago payment...');
            // Redirect to Mercado Pago checkout
            this.showPaymentSuccess('Redirigiendo a Mercado Pago...');
            return true;
        },
        
        async processMercadoPago() {
            try {
                const customerData = this.getCustomerData();
                const paymentData = this.getPaymentMethodData();
                
                const requestBody = {
                    items: this.cart.map(item => ({
                        id: item.id || item.name.toLowerCase().replace(/\s+/g, '-'),
                        title: item.name,
                        quantity: item.quantity,
                        price: item.price,
                        currency_id: 'ARS'
                    })),
                    customer: customerData,
                    payment_method: paymentData
                };
                
                console.log('Creating Mercado Pago preference...', requestBody);
                
                const response = await fetch('/.netlify/functions/mercadopago-create-preference', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody)
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const result = await response.json();
                
                // Store cart total for success page
                localStorage.setItem('cart_total', this.cartTotal.toString());
                
                // Redirect to Mercado Pago
                if (result.init_point) {
                    window.location.href = result.init_point;
                } else {
                    throw new Error('No se pudo obtener el enlace de pago');
                }
                
                return true;
                
            } catch (error) {
                console.error('Error processing Mercado Pago payment:', error);
                this.showPaymentError('Error al procesar el pago con Mercado Pago: ' + error.message);
                return false;
            }
        },
        
        getCustomerData() {
            return {
                name: document.getElementById('billing-name')?.value || '',
                surname: document.getElementById('billing-surname')?.value || '',
                email: document.getElementById('billing-email')?.value || '',
                phone: {
                    area_code: '11',
                    number: document.getElementById('billing-phone')?.value || ''
                },
                identification: {
                    type: 'DNI',
                    number: document.getElementById('billing-dni')?.value || ''
                },
                address: {
                    street: document.getElementById('billing-address')?.value || '',
                    number: parseInt(document.getElementById('billing-number')?.value) || 0,
                    zip_code: document.getElementById('billing-zip')?.value || ''
                }
            };
        },
        
        getPaymentMethodData() {
            const method = this.currentMethod;
            const mpMethod = document.querySelector('input[name="mp-method"]:checked')?.value;
            let installments = parseInt(document.getElementById('installments')?.value) || 1;
            if (mpMethod === 'debit-card') installments = 1;
            if (mpMethod === 'credit-card') installments = Math.min(12, Math.max(1, installments));
            return { type: method, method: mpMethod, installments };
        },
        
        processCard() {
            // Here you would integrate with your card processor
            console.log('Processing card payment...');
            this.showPaymentSuccess('Procesando pago con tarjeta...');
            return true;
        },
        
        processCash() {
            console.log('Processing cash payment...');
            this.showPaymentSuccess('Generando cupón de pago...');
            return true;
        },
        
        processTransfer() {
            console.log('Processing bank transfer...');
            this.showTransferOptions();
            return true;
        },
        
        showTransferOptions() {
            const transferModal = document.createElement('div');
            transferModal.className = 'transfer-modal';
            transferModal.innerHTML = `
                <div class="modal-overlay">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>🏦 Realizar Transferencia</h3>
                            <button class="close-modal">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="bank-data">
                                <h4>Datos Bancarios</h4>
                                <div class="bank-info">
                                    <p><strong>Banco:</strong> Banco Galicia</p>
                                    <p><strong>CBU:</strong> 0070999830004567890123</p>
                                    <p><strong>Alias:</strong> IHARA.LONDON.MP</p>
                                    <p><strong>Titular:</strong> Ihara & London S.A.S</p>
                                    <p><strong>CUIT:</strong> 30-12345678-9</p>
                                    <p><strong>Referencia:</strong> ${this.generateOrderReference()}</p>
                                </div>
                                <button class="copy-bank-data">📋 Copiar Datos</button>
                            </div>
                            
                            <div class="bank-apps">
                                <h4>Abrir en tu App Bancaria</h4>
                                <div class="bank-buttons">
                                    <button class="bank-btn galicia" onclick="PaymentSystem.openBankApp('galicia')">
                                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjRkY1NzIyIi8+Cjwvc3ZnPgo=" alt="Galicia">
                                        Banco Galicia
                                    </button>
                                    <button class="bank-btn santander" onclick="PaymentSystem.openBankApp('santander')">
                                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjRUMxQzI0Ii8+Cjwvc3ZnPgo=" alt="Santander">
                                        Banco Santander
                                    </button>
                                    <button class="bank-btn bbva" onclick="PaymentSystem.openBankApp('bbva')">
                                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjMDA0ODhBIi8+Cjwvc3ZnPgo=" alt="BBVA">
                                        Banco BBVA
                                    </button>
                                    <button class="bank-btn macro" onclick="PaymentSystem.openBankApp('macro')">
                                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjRkZEMTAwIi8+Cjwvc3ZnPgo=" alt="Macro">
                                        Banco Macro
                                    </button>
                                    <button class="bank-btn icbc" onclick="PaymentSystem.openBankApp('icbc')">
                                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjQzQxRTNBIi8+Cjwvc3ZnPgo=" alt="ICBC">
                                        Banco ICBC
                                    </button>
                                    <button class="bank-btn nacion" onclick="PaymentSystem.openBankApp('nacion')">
                                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjMDA0MEVGIS8+Cjwvc3ZnPgo=" alt="Nación">
                                        Banco Nación
                                    </button>
                                </div>
                            </div>
                            <div class="instructions">
                                <h4>📝 Instrucciones</h4>
                                <ol>
                                    <li>Copia los datos bancarios o abre tu app</li>
                                    <li>Transfiere el monto exacto: <strong>$${(this.cartTotal).toLocaleString('es-AR')}</strong></li>
                                    <li>Incluye la referencia en el concepto</li>
                                    <li>Envía el comprobante por WhatsApp</li>
                                </ol>
                                <a href="https://wa.me/5491123456789?text=Hola! Realicé una transferencia por mi pedido. Referencia: ${this.generateOrderReference()}" 
                                   class="whatsapp-btn" target="_blank">
                                    📱 Enviar Comprobante por WhatsApp
                                </a>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary close-modal">Cancelar</button>
                            <button class="btn-primary confirm-transfer">Confirmar Transferencia</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(transferModal);
            this.bindTransferModalEvents(transferModal);
        },
        
        generateOrderReference() {
            return `IH${Date.now().toString().slice(-6)}${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
        },
        
        bindTransferModalEvents(modal) {
            // Close modal events
            modal.querySelectorAll('.close-modal').forEach(btn => {
                btn.addEventListener('click', () => {
                    modal.remove();
                });
            });
            
            // Copy bank data
            modal.querySelector('.copy-bank-data').addEventListener('click', () => {
                this.copyBankData();
            });
            
            // Confirm transfer
            modal.querySelector('.confirm-transfer').addEventListener('click', () => {
                this.confirmTransfer();
                modal.remove();
            });
            
            // Close on overlay click
            modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
                if (e.target === e.currentTarget) {
                    modal.remove();
                }
            });
        },
        
        copyBankData() {
            const orderRef = this.generateOrderReference();
            const bankData = `Banco Galicia
CBU: 0070999830004567890123
Alias: IHARA.LONDON.MP
Titular: Ihara & London S.A.S
CUIT: 30-12345678-9
Monto: $${(this.cartTotal).toLocaleString('es-AR')} ARS
Referencia: ${orderRef}`;
            
            navigator.clipboard.writeText(bankData).then(() => {
                this.showNotification('✅ Datos bancarios copiados al portapapeles');
            }).catch(() => {
                this.showNotification('❌ Error al copiar. Anota los datos manualmente.');
            });
        },
        
        openBankApp(bank) {
            const amount = this.cartTotal;
            const reference = this.generateOrderReference();
            const cbu = '0070999830004567890123';
            
            const bankApps = {
                galicia: {
                    deep: `galicia://transfer?cbu=${cbu}&amount=${amount}&concept=${reference}`,
                    fallback: 'https://play.google.com/store/apps/details?id=ar.com.galicia.bancagalicia'
                },
                santander: {
                    deep: `santander://transfer?cbu=${cbu}&amount=${amount}&concept=${reference}`,
                    fallback: 'https://play.google.com/store/apps/details?id=com.santander.app'
                },
                bbva: {
                    deep: `bbva://transfer?cbu=${cbu}&amount=${amount}&concept=${reference}`,
                    fallback: 'https://play.google.com/store/apps/details?id=com.bbva.bbvanet'
                },
                macro: {
                    deep: `macro://transfer?cbu=${cbu}&amount=${amount}&concept=${reference}`,
                    fallback: 'https://play.google.com/store/apps/details?id=ar.com.macro.bancamacro'
                },
                icbc: {
                    deep: `icbc://transfer?cbu=${cbu}&amount=${amount}&concept=${reference}`,
                    fallback: 'https://play.google.com/store/apps/details?id=ar.com.icbc.bancaicbc'
                },
                nacion: {
                    deep: `nacion://transfer?cbu=${cbu}&amount=${amount}&concept=${reference}`,
                    fallback: 'https://play.google.com/store/apps/details?id=ar.gov.nacion.bna'
                }
            };
            
            const app = bankApps[bank];
            if (app) {
                // Try to open the app
                const link = document.createElement('a');
                link.href = app.deep;
                link.click();
                
                // Show fallback after a delay
                setTimeout(() => {
                    this.showAppFallback(bank, app.fallback);
                }, 2000);
            }
        },
        
        openWalletApp(wallet) {
            const amount = this.cartTotal * 0.9;
            const reference = this.generateOrderReference();
            const cbu = '0070999830004567890123';
            
            const walletApps = {
                mercadopago: {
                    deep: `mercadopago://transfer?cbu=${cbu}&amount=${amount}&concept=${reference}`,
                    fallback: 'https://play.google.com/store/apps/details?id=com.mercadopago.wallet'
                },
                uala: {
                    deep: `uala://transfer?cbu=${cbu}&amount=${amount}&concept=${reference}`,
                    fallback: 'https://play.google.com/store/apps/details?id=com.uala.app'
                },
                brubank: {
                    deep: `brubank://transfer?cbu=${cbu}&amount=${amount}&concept=${reference}`,
                    fallback: 'https://play.google.com/store/apps/details?id=ar.com.brubank.app'
                }
            };
            
            const app = walletApps[wallet];
            if (app) {
                const link = document.createElement('a');
                link.href = app.deep;
                link.click();
                
                setTimeout(() => {
                    this.showAppFallback(wallet, app.fallback);
                }, 2000);
            }
        },
        
        showAppFallback(appName, fallbackUrl) {
            const fallback = document.createElement('div');
            fallback.className = 'app-fallback';
            fallback.innerHTML = `
                <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                            background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); 
                            z-index: 10000; max-width: 400px; text-align: center;">
                    <h3>¿No se abrió la app?</h3>
                    <p>Si no tienes la app de ${appName} instalada, puedes descargarla:</p>
                    <a href="${fallbackUrl}" target="_blank" class="btn-primary" style="display: inline-block; margin: 1rem 0;">
                        📱 Descargar App
                    </a>
                    <br>
                    <button onclick="this.parentElement.parentElement.remove()" class="btn-secondary">
                        Cerrar
                    </button>
                </div>
            `;
            document.body.appendChild(fallback);
            
            setTimeout(() => {
                if (fallback.parentElement) {
                    fallback.remove();
                }
            }, 5000);
        },
        
        confirmTransfer() {
            // Store order data
            const orderData = {
                reference: this.generateOrderReference(),
                amount: this.cartTotal,
                items: this.cart,
                method: 'transfer',
                timestamp: new Date().toISOString()
            };
            
            localStorage.setItem('pending_order', JSON.stringify(orderData));
            
            this.showPaymentSuccess('✅ Transferencia registrada. Te contactaremos cuando confirmemos el pago.');
        },
        
        showNotification(message) {
            const notification = document.createElement('div');
            notification.className = 'payment-notification';
            notification.innerHTML = `
                <div style="position: fixed; top: 20px; right: 20px; background: #10b981; color: white; 
                            padding: 1rem 1.5rem; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); 
                            z-index: 10001; animation: slideIn 0.3s ease;">
                    ${message}
                </div>
            `;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 3000);
        },
        
        processDigitalWallet() {
            console.log('Processing digital wallet payment...');
            this.showDigitalWalletOptions();
            return true;
        },
        
        showDigitalWalletOptions() {
            const walletModal = document.createElement('div');
            walletModal.className = 'wallet-modal';
            walletModal.innerHTML = `
                <div class="modal-overlay">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>💳 Seleccionar Billetera Digital</h3>
                            <button class="close-modal">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="wallet-options">
                                <div class="wallet-option" onclick="PaymentSystem.selectWallet('mercadopago')">
                                    <div class="wallet-logo">💙</div>
                                    <div class="wallet-info">
                                        <h4>Mercado Pago</h4>
                                        <p>La billetera más popular de Argentina</p>
                                        <div class="wallet-features">
                                            <span>✓ Pago inmediato</span>
                                            <span>✓ Protección del comprador</span>
                                            <span>✓ QR Code</span>
                                        </div>
                                    </div>
                                    <div class="wallet-amount">
                                        $${this.cartTotal.toLocaleString('es-AR')} ARS
                                    </div>
                                </div>
                                
                                <div class="wallet-option" onclick="PaymentSystem.selectWallet('uala')">
                                    <div class="wallet-logo">💜</div>
                                    <div class="wallet-info">
                                        <h4>Ualá</h4>
                                        <p>Billetera digital y tarjeta prepaga</p>
                                        <div class="wallet-features">
                                            <span>✓ Sin comisiones</span>
                                            <span>✓ Transferencias gratuitas</span>
                                            <span>✓ Cashback</span>
                                        </div>
                                    </div>
                                    <div class="wallet-amount">
                                        $${this.cartTotal.toLocaleString('es-AR')} ARS
                                    </div>
                                </div>
                                
                                <div class="wallet-option" onclick="PaymentSystem.selectWallet('brubank')">
                                    <div class="wallet-logo">🖤</div>
                                    <div class="wallet-info">
                                        <h4>Brubank</h4>
                                        <p>Banco 100% digital</p>
                                        <div class="wallet-features">
                                            <span>✓ Cuenta gratuita</span>
                                            <span>✓ Transferencias ilimitadas</span>
                                            <span>✓ Inversiones</span>
                                        </div>
                                    </div>
                                    <div class="wallet-amount">
                                        $${this.cartTotal.toLocaleString('es-AR')} ARS
                                    </div>
                                </div>
                                
                                <div class="wallet-option" onclick="PaymentSystem.selectWallet('lemon')">
                                    <div class="wallet-logo">🍋</div>
                                    <div class="wallet-info">
                                        <h4>Lemon Cash</h4>
                                        <p>Crypto & Fintech</p>
                                        <div class="wallet-features">
                                            <span>✓ Crypto friendly</span>
                                            <span>✓ Dólar MEP</span>
                                            <span>✓ Staking</span>
                                        </div>
                                    </div>
                                    <div class="wallet-amount">
                                        $${this.cartTotal.toLocaleString('es-AR')} ARS
                                    </div>
                                </div>
                                
                                <div class="wallet-option" onclick="PaymentSystem.selectWallet('naranja')">
                                    <div class="wallet-logo">🧡</div>
                                    <div class="wallet-info">
                                        <h4>Naranja X</h4>
                                        <p>Más que una tarjeta</p>
                                        <div class="wallet-features">
                                            <span>✓ Cuenta digital</span>
                                            <span>✓ Beneficios exclusivos</span>
                                            <span>✓ Cuotas sin interés</span>
                                        </div>
                                    </div>
                                    <div class="wallet-amount">
                                        $${this.cartTotal.toLocaleString('es-AR')} ARS
                                    </div>
                                </div>
                                
                                <div class="wallet-option" onclick="PaymentSystem.selectWallet('modo')">
                                    <div class="wallet-logo">💚</div>
                                    <div class="wallet-info">
                                        <h4>MODO</h4>
                                        <p>Billetera de bancos argentinos</p>
                                        <div class="wallet-features">
                                            <span>✓ Respaldado por bancos</span>
                                            <span>✓ QR unificado</span>
                                            <span>✓ Sin comisiones</span>
                                        </div>
                                    </div>
                                    <div class="wallet-amount">
                                        $${this.cartTotal.toLocaleString('es-AR')} ARS
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(walletModal);
            this.bindWalletModalEvents(walletModal);
        },
        
        selectWallet(walletType) {
            const orderRef = this.generateOrderReference();
            const amount = this.cartTotal;
            const cbu = '0070999830004567890123'; // CBU de Ihara & London
            
            const walletLinks = {
                mercadopago: {
                    deep: `mercadopago://checkout?amount=${amount}&concept=Pedido Ihara & London - ${orderRef}&receiver_id=123456789`,
                    fallback: 'https://play.google.com/store/apps/details?id=com.mercadopago.wallet',
                    web: `https://www.mercadopago.com.ar/checkout/v1/redirect?amount=${amount}&concept=Pedido%20Ihara%20%26%20London%20-%20${orderRef}`
                },
                uala: {
                    deep: `uala://send?cbu=${cbu}&amount=${amount}&concept=Pedido ${orderRef}`,
                    fallback: 'https://play.google.com/store/apps/details?id=com.uala.app',
                    web: 'https://www.uala.com.ar'
                },
                brubank: {
                    deep: `brubank://transfer?cbu=${cbu}&amount=${amount}&concept=Pedido ${orderRef}`,
                    fallback: 'https://play.google.com/store/apps/details?id=ar.com.brubank.app',
                    web: 'https://brubank.com'
                },
                lemon: {
                    deep: `lemon://send?cbu=${cbu}&amount=${amount}&concept=Pedido ${orderRef}`,
                    fallback: 'https://play.google.com/store/apps/details?id=ar.com.lemon.cash',
                    web: 'https://lemon.me'
                },
                naranja: {
                    deep: `naranjax://pay?cbu=${cbu}&amount=${amount}&concept=Pedido ${orderRef}`,
                    fallback: 'https://play.google.com/store/apps/details?id=com.naranja.naranjax',
                    web: 'https://naranjax.com'
                },
                modo: {
                    deep: `modo://pay?cbu=${cbu}&amount=${amount}&concept=Pedido ${orderRef}`,
                    fallback: 'https://play.google.com/store/apps/details?id=ar.com.modo.app',
                    web: 'https://modo.com.ar'
                }
            };
            
            const wallet = walletLinks[walletType];
            if (wallet) {
                // Cerrar modal
                document.querySelector('.wallet-modal').remove();
                
                // Mostrar instrucciones
                this.showWalletInstructions(walletType, wallet, orderRef);
                
                // Intentar abrir la app
                const link = document.createElement('a');
                link.href = wallet.deep;
                link.click();
                
                // Fallback después de 2 segundos
                setTimeout(() => {
                    this.showWalletFallback(walletType, wallet);
                }, 2000);
            }
        },
        
        showWalletInstructions(walletType, wallet, orderRef) {
            const instructionsModal = document.createElement('div');
            instructionsModal.className = 'instructions-modal';
            instructionsModal.innerHTML = `
                <div class="modal-overlay">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>📱 Instrucciones de Pago</h3>
                            <button class="close-modal">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="wallet-instructions">
                                <div class="instruction-step">
                                    <div class="step-number">1</div>
                                    <div class="step-content">
                                        <h4>Abrir ${this.getWalletName(walletType)}</h4>
                                        <p>Si no se abrió automáticamente, toca el botón de abajo</p>
                                        <button class="open-wallet-btn" onclick="PaymentSystem.openWalletDirect('${walletType}')">
                                            Abrir ${this.getWalletName(walletType)}
                                        </button>
                                    </div>
                                </div>
                                
                                <div class="instruction-step">
                                    <div class="step-number">2</div>
                                    <div class="step-content">
                                        <h4>Datos para transferir</h4>
                                        <div class="transfer-data">
                                            <p><strong>CBU:</strong> 0070999830004567890123</p>
                                            <p><strong>Alias:</strong> IHARA.LONDON.MP</p>
                                            <p><strong>Titular:</strong> Ihara & London S.A.S</p>
                                            <p><strong>Monto:</strong> $${this.cartTotal.toLocaleString('es-AR')} ARS</p>
                                            <p><strong>Concepto:</strong> Pedido ${orderRef}</p>
                                        </div>
                                        <button class="copy-transfer-data" onclick="PaymentSystem.copyTransferData('${orderRef}')">
                                            📋 Copiar Datos
                                        </button>
                                    </div>
                                </div>
                                
                                <div class="instruction-step">
                                    <div class="step-number">3</div>
                                    <div class="step-content">
                                        <h4>Confirmar pago</h4>
                                        <p>Una vez realizada la transferencia, envíanos el comprobante</p>
                                        <a href="https://wa.me/5491123456789?text=Hola! Realicé el pago de mi pedido ${orderRef} desde ${this.getWalletName(walletType)}. Adjunto comprobante." 
                                           class="whatsapp-btn" target="_blank">
                                            📱 Enviar Comprobante
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary close-modal">Cancelar</button>
                            <button class="btn-primary" onclick="PaymentSystem.confirmWalletPayment('${walletType}', '${orderRef}')">
                                ✅ Pago Realizado
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(instructionsModal);
            this.bindModalEvents(instructionsModal);
        },
        
        getWalletName(walletType) {
            const names = {
                mercadopago: 'Mercado Pago',
                uala: 'Ualá',
                brubank: 'Brubank',
                lemon: 'Lemon Cash',
                naranja: 'Naranja X',
                modo: 'MODO'
            };
            return names[walletType] || walletType;
        },
        
        openWalletDirect(walletType) {
            // Lógica específica para cada wallet
            const apps = {
                mercadopago: 'com.mercadopago.wallet',
                uala: 'com.uala.app',
                brubank: 'ar.com.brubank.app',
                lemon: 'ar.com.lemon.cash',
                naranja: 'com.naranja.naranjax',
                modo: 'ar.com.modo.app'
            };
            
            // Intentar abrir la app nativa
            window.location.href = `intent://wallet#Intent;package=${apps[walletType]};scheme=https;end`;
        },
        
        copyTransferData(orderRef) {
            const transferData = `CBU: 0070999830004567890123
Alias: IHARA.LONDON.MP
Titular: Ihara & London S.A.S
Monto: $${this.cartTotal.toLocaleString('es-AR')} ARS
Concepto: Pedido ${orderRef}`;
            
            navigator.clipboard.writeText(transferData).then(() => {
                this.showNotification('✅ Datos copiados al portapapeles');
            }).catch(() => {
                this.showNotification('❌ Error al copiar. Anota los datos manualmente.');
            });
        },
        
        confirmWalletPayment(walletType, orderRef) {
            // Guardar datos del pedido
            const orderData = {
                reference: orderRef,
                amount: this.cartTotal,
                items: this.cart,
                method: 'digital_wallet',
                wallet: walletType,
                timestamp: new Date().toISOString()
            };
            
            localStorage.setItem('pending_order', JSON.stringify(orderData));
            
            // Cerrar modal
            document.querySelector('.instructions-modal').remove();
            
            this.showPaymentSuccess(`✅ Pago registrado con ${this.getWalletName(walletType)}. Te contactaremos cuando confirmemos el pago.`);
        },
        
        showWalletFallback(walletType, wallet) {
            // Verificar si el modal de instrucciones está abierto
            if (document.querySelector('.instructions-modal')) {
                return; // No mostrar fallback si ya hay instrucciones
            }
            
            const fallback = document.createElement('div');
            fallback.className = 'wallet-fallback';
            fallback.innerHTML = `
                <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                            background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); 
                            z-index: 10000; max-width: 400px; text-align: center;">
                    <h3>¿No se abrió ${this.getWalletName(walletType)}?</h3>
                    <p>Puedes descargar la app o usar la versión web:</p>
                    <div style="display: flex; gap: 1rem; justify-content: center; margin: 1rem 0;">
                        <a href="${wallet.fallback}" target="_blank" class="btn-primary">
                            📱 Descargar App
                        </a>
                        <a href="${wallet.web}" target="_blank" class="btn-secondary">
                            🌐 Versión Web
                        </a>
                    </div>
                    <button onclick="this.parentElement.parentElement.remove()" class="btn-secondary" style="margin-top: 1rem;">
                        Cerrar
                    </button>
                </div>
            `;
            document.body.appendChild(fallback);
            
            setTimeout(() => {
                if (fallback.parentElement) {
                    fallback.remove();
                }
            }, 8000);
        },
        
        bindWalletModalEvents(modal) {
            modal.querySelectorAll('.close-modal').forEach(btn => {
                btn.addEventListener('click', () => {
                    modal.remove();
                });
            });
            
            modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
                if (e.target === e.currentTarget) {
                    modal.remove();
                }
            });
        },
        
        bindModalEvents(modal) {
            modal.querySelectorAll('.close-modal').forEach(btn => {
                btn.addEventListener('click', () => {
                    modal.remove();
                });
            });
            
            modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
                if (e.target === e.currentTarget) {
                    modal.remove();
                }
            });
        },
        
        processCrypto() {
            console.log('Processing crypto payment...');
            this.showCryptoOptions();
            return true;
        },
        
        showCryptoOptions() {
            const cryptoModal = document.createElement('div');
            cryptoModal.className = 'crypto-modal';
            cryptoModal.innerHTML = `
                <div class="modal-overlay">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>₿ Pago con Criptomonedas</h3>
                            <button class="close-modal">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="crypto-discount">
                                <p><strong>🎉 ¡15% de descuento!</strong></p>
                                <p>Total a pagar: <strong>$${(this.cartTotal * 0.85).toLocaleString('es-AR')} ARS</strong></p>
                                <p class="crypto-equivalent">≈ ${this.calculateCryptoAmount(this.cartTotal * 0.85)} USD</p>
                            </div>
                            
                            <div class="crypto-currencies">
                                <h4>Selecciona tu criptomoneda</h4>
                                <div class="crypto-grid">
                                    <div class="crypto-option" onclick="PaymentSystem.selectCrypto('bitcoin')">
                                        <div class="crypto-icon">₿</div>
                                        <div class="crypto-name">Bitcoin</div>
                                        <div class="crypto-symbol">BTC</div>
                                        <div class="crypto-amount">${this.calculateCryptoAmount(this.cartTotal * 0.85, 'BTC')} BTC</div>
                                    </div>
                                    
                                    <div class="crypto-option" onclick="PaymentSystem.selectCrypto('ethereum')">
                                        <div class="crypto-icon">Ξ</div>
                                        <div class="crypto-name">Ethereum</div>
                                        <div class="crypto-symbol">ETH</div>
                                        <div class="crypto-amount">${this.calculateCryptoAmount(this.cartTotal * 0.85, 'ETH')} ETH</div>
                                    </div>
                                    
                                    <div class="crypto-option" onclick="PaymentSystem.selectCrypto('usdt')">
                                        <div class="crypto-icon">₮</div>
                                        <div class="crypto-name">Tether</div>
                                        <div class="crypto-symbol">USDT</div>
                                        <div class="crypto-amount">${this.calculateCryptoAmount(this.cartTotal * 0.85, 'USDT')} USDT</div>
                                    </div>
                                    
                                    <div class="crypto-option" onclick="PaymentSystem.selectCrypto('usdc')">
                                        <div class="crypto-icon">💵</div>
                                        <div class="crypto-name">USD Coin</div>
                                        <div class="crypto-symbol">USDC</div>
                                        <div class="crypto-amount">${this.calculateCryptoAmount(this.cartTotal * 0.85, 'USDC')} USDC</div>
                                    </div>
                                    
                                    <div class="crypto-option" onclick="PaymentSystem.selectCrypto('dai')">
                                        <div class="crypto-icon">◈</div>
                                        <div class="crypto-name">Dai</div>
                                        <div class="crypto-symbol">DAI</div>
                                        <div class="crypto-amount">${this.calculateCryptoAmount(this.cartTotal * 0.85, 'DAI')} DAI</div>
                                    </div>
                                    
                                    <div class="crypto-option" onclick="PaymentSystem.selectCrypto('bnb')">
                                        <div class="crypto-icon">🔸</div>
                                        <div class="crypto-name">Binance Coin</div>
                                        <div class="crypto-symbol">BNB</div>
                                        <div class="crypto-amount">${this.calculateCryptoAmount(this.cartTotal * 0.85, 'BNB')} BNB</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="crypto-info">
                                <h4>💡 Información importante</h4>
                                <ul>
                                    <li>Las cotizaciones se actualizan cada 5 minutos</li>
                                    <li>Tienes 30 minutos para completar el pago</li>
                                    <li>Envía el monto exacto para evitar retrasos</li>
                                    <li>Las transacciones son irreversibles</li>
                                    <li>Soporte para redes: Bitcoin, Ethereum, BSC, Polygon</li>
                                </ul>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary close-modal">Cancelar</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(cryptoModal);
            this.bindModalEvents(cryptoModal);
        },
        
        calculateCryptoAmount(arsAmount, crypto = 'USD') {
            // Cotizaciones aproximadas (en una implementación real, usar API)
            const exchangeRates = {
                USD: 1000, // 1 USD = 1000 ARS (aproximado)
                BTC: 95000, // 1 BTC = 95000 USD
                ETH: 3500,  // 1 ETH = 3500 USD
                USDT: 1,    // 1 USDT = 1 USD
                USDC: 1,    // 1 USDC = 1 USD
                DAI: 1,     // 1 DAI = 1 USD
                BNB: 600    // 1 BNB = 600 USD
            };
            
            const usdAmount = arsAmount / exchangeRates.USD;
            
            if (crypto === 'USD') return usdAmount.toFixed(2);
            
            const cryptoAmount = usdAmount / exchangeRates[crypto];
            
            // Formatear según la crypto
            if (crypto === 'BTC') return cryptoAmount.toFixed(8);
            if (crypto === 'ETH') return cryptoAmount.toFixed(6);
            return cryptoAmount.toFixed(4);
        },
        
        selectCrypto(cryptoType) {
            const orderRef = this.generateOrderReference();
            const discountedAmount = this.cartTotal * 0.85;
            const cryptoAmount = this.calculateCryptoAmount(discountedAmount, cryptoType.toUpperCase());
            
            // Cerrar modal de selección
            document.querySelector('.crypto-modal').remove();
            
            // Mostrar detalles de pago
            this.showCryptoPaymentDetails(cryptoType, cryptoAmount, orderRef);
        },
        
        showCryptoPaymentDetails(cryptoType, amount, orderRef) {
            const address = this.getCryptoAddress(cryptoType);
            const qrData = this.generateCryptoQR(cryptoType, address, amount);
            
            const paymentModal = document.createElement('div');
            paymentModal.className = 'crypto-payment-modal';
            paymentModal.innerHTML = `
                <div class="modal-overlay">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>${this.getCryptoIcon(cryptoType)} Pagar con ${this.getCryptoName(cryptoType)}</h3>
                            <button class="close-modal">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="payment-timer">
                                <div class="timer-icon">⏰</div>
                                <div class="timer-text">
                                    <strong>Tiempo restante: <span id="crypto-timer">30:00</span></strong>
                                    <p>La cotización se mantiene fija durante este tiempo</p>
                                </div>
                            </div>
                            
                            <div class="crypto-payment-info">
                                <div class="qr-section">
                                    <h4>📱 Escanea el código QR</h4>
                                    <div class="qr-code">
                                        <div class="qr-placeholder">
                                            <div class="qr-mock">
                                                <div class="qr-corner"></div>
                                                <div class="qr-corner"></div>
                                                <div class="qr-corner"></div>
                                                <div class="qr-corner"></div>
                                                <div class="qr-center">${cryptoType.toUpperCase()}</div>
                                            </div>
                                        </div>
                                        <p class="qr-note">Usa tu wallet favorita para escanear</p>
                                    </div>
                                </div>
                                
                                <div class="manual-payment">
                                    <h4>💻 O copia los datos manualmente</h4>
                                    <div class="crypto-details">
                                        <div class="detail-row">
                                            <label>Dirección:</label>
                                            <div class="crypto-address">
                                                ${address}
                                                <button class="copy-btn" onclick="PaymentSystem.copyToClipboard('${address}')">📋</button>
                                            </div>
                                        </div>
                                        
                                        <div class="detail-row">
                                            <label>Cantidad exacta:</label>
                                            <div class="crypto-amount-display">
                                                ${amount} ${cryptoType.toUpperCase()}
                                                <button class="copy-btn" onclick="PaymentSystem.copyToClipboard('${amount}')">📋</button>
                                            </div>
                                        </div>
                                        
                                        <div class="detail-row">
                                            <label>Referencia:</label>
                                            <div class="reference-display">
                                                ${orderRef}
                                                <button class="copy-btn" onclick="PaymentSystem.copyToClipboard('${orderRef}')">📋</button>
                                            </div>
                                        </div>
                                        
                                        <div class="detail-row">
                                            <label>Red:</label>
                                            <div class="network-display">
                                                ${this.getCryptoNetwork(cryptoType)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="popular-wallets">
                                    <h4>🔗 Abrir en wallet</h4>
                                    <div class="wallet-links">
                                        <button class="wallet-link" onclick="PaymentSystem.openCryptoWallet('metamask', '${cryptoType}', '${address}', '${amount}')">
                                            🦊 MetaMask
                                        </button>
                                        <button class="wallet-link" onclick="PaymentSystem.openCryptoWallet('trustwallet', '${cryptoType}', '${address}', '${amount}')">
                                            🛡️ Trust Wallet
                                        </button>
                                        <button class="wallet-link" onclick="PaymentSystem.openCryptoWallet('coinbase', '${cryptoType}', '${address}', '${amount}')">
                                            🔵 Coinbase
                                        </button>
                                        <button class="wallet-link" onclick="PaymentSystem.openCryptoWallet('binance', '${cryptoType}', '${address}', '${amount}')">
                                            🟡 Binance
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary close-modal">Cancelar</button>
                            <button class="btn-primary" onclick="PaymentSystem.confirmCryptoPayment('${cryptoType}', '${orderRef}')">
                                ✅ Ya envié el pago
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(paymentModal);
            this.bindModalEvents(paymentModal);
            this.startCryptoTimer();
        },
        
        getCryptoAddress(cryptoType) {
            // En una implementación real, estas serían addresses reales
            const addresses = {
                bitcoin: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
                ethereum: '0x742B8BFb4B4bF55e8E5A8B1f8B94Bb4B61A8B5A8',
                usdt: '0x742B8BFb4B4bF55e8E5A8B1f8B94Bb4B61A8B5A8',
                usdc: '0x742B8BFb4B4bF55e8E5A8B1f8B94Bb4B61A8B5A8',
                dai: '0x742B8BFb4B4bF55e8E5A8B1f8B94Bb4B61A8B5A8',
                bnb: 'bnb1grpf0955h0ykzq3ar5nmum7y6gdfl6lxfn46h2'
            };
            return addresses[cryptoType] || addresses.bitcoin;
        },
        
        getCryptoName(cryptoType) {
            const names = {
                bitcoin: 'Bitcoin',
                ethereum: 'Ethereum',
                usdt: 'Tether',
                usdc: 'USD Coin',
                dai: 'Dai',
                bnb: 'Binance Coin'
            };
            return names[cryptoType] || cryptoType;
        },
        
        getCryptoIcon(cryptoType) {
            const icons = {
                bitcoin: '₿',
                ethereum: 'Ξ',
                usdt: '₮',
                usdc: '💵',
                dai: '◈',
                bnb: '🔸'
            };
            return icons[cryptoType] || '₿';
        },
        
        getCryptoNetwork(cryptoType) {
            const networks = {
                bitcoin: 'Bitcoin Network',
                ethereum: 'Ethereum (ERC-20)',
                usdt: 'Ethereum (ERC-20)',
                usdc: 'Ethereum (ERC-20)',
                dai: 'Ethereum (ERC-20)',
                bnb: 'Binance Smart Chain'
            };
            return networks[cryptoType] || 'Bitcoin Network';
        },
        
        startCryptoTimer() {
            let timeLeft = 30 * 60; // 30 minutos en segundos
            const timerElement = document.getElementById('crypto-timer');
            
            const timer = setInterval(() => {
                const minutes = Math.floor(timeLeft / 60);
                const seconds = timeLeft % 60;
                timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                
                if (timeLeft <= 0) {
                    clearInterval(timer);
                    this.expireCryptoPayment();
                }
                
                timeLeft--;
            }, 1000);
        },
        
        expireCryptoPayment() {
            const modal = document.querySelector('.crypto-payment-modal');
            if (modal) {
                modal.querySelector('.modal-body').innerHTML = `
                    <div style="text-align: center; padding: 2rem;">
                        <div style="font-size: 4rem; margin-bottom: 1rem;">⏰</div>
                        <h3>Tiempo agotado</h3>
                        <p>El tiempo para completar el pago ha expirado. Las cotizaciones han cambiado.</p>
                        <button class="btn-primary" onclick="PaymentSystem.restartCryptoPayment()">
                            Reiniciar pago
                        </button>
                    </div>
                `;
            }
        },
        
        openCryptoWallet(wallet, cryptoType, address, amount) {
            const walletUrls = {
                metamask: `https://metamask.app.link/send/${address}?value=${amount}`,
                trustwallet: `trust://send?coin=${cryptoType}&address=${address}&amount=${amount}`,
                coinbase: `https://go.cb-w.com/send?address=${address}&amount=${amount}`,
                binance: `bnc://transfer?address=${address}&amount=${amount}&coin=${cryptoType}`
            };
            
            const url = walletUrls[wallet];
            if (url) {
                window.open(url, '_blank');
            }
        },
        
        confirmCryptoPayment(cryptoType, orderRef) {
            // Guardar datos del pedido
            const orderData = {
                reference: orderRef,
                amount: this.cartTotal * 0.85,
                originalAmount: this.cartTotal,
                discount: 0.15,
                items: this.cart,
                method: 'crypto',
                cryptoType: cryptoType,
                timestamp: new Date().toISOString()
            };
            
            localStorage.setItem('pending_order', JSON.stringify(orderData));
            
            // Cerrar modal
            document.querySelector('.crypto-payment-modal').remove();
            
            this.showPaymentSuccess(`✅ Pago con ${this.getCryptoName(cryptoType)} registrado. Verificaremos la transacción y te contactaremos pronto.`);
        },
        
        showPaymentError(message) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'payment-error';
            errorDiv.innerHTML = `
                <div style="background: #fee2e2; border: 1px solid #fecaca; color: #991b1b; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                    <strong>Error:</strong> ${message}
                </div>
            `;
            
            const paymentSection = document.getElementById('payment-section');
            if (paymentSection) {
                paymentSection.insertBefore(errorDiv, paymentSection.firstChild);
                setTimeout(() => errorDiv.remove(), 5000);
            }
        },
        
        showPaymentSuccess(message) {
            const notification = document.createElement('div');
            notification.className = 'payment-success-notification';
            notification.innerHTML = `
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span style="font-size: 2rem;">✅</span>
                    <div>
                        <h4 style="margin: 0; color: var(--success);">¡Pago Exitoso!</h4>
                        <p style="margin: 0.5rem 0 0; font-size: 0.9rem;">${message}</p>
                    </div>
                </div>
            `;
            notification.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 2rem;
                border-radius: 12px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                z-index: 10000;
                max-width: 400px;
                width: 90%;
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 3000);
        }
    };
    
    // Initialize payment system when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => PaymentSystem.init());
    } else {
        PaymentSystem.init();
    }
    
    // Make PaymentSystem available globally for integration
    window.PaymentSystem = PaymentSystem;
    
})();
