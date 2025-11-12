// Simple client-side password protection for GitHub Pages
// Note: This is not cryptographically secure, but provides basic access control

(function() {
    'use strict';

    // Password hash (SHA-256 of "AWP2025")
    // This provides slight obfuscation but is not truly secure
    const PASSWORD_HASH = '2b1f4d4bcd4094888b2ed7ef69946327bea0e6b7567abd68a6e0f0c56410612b';
    const SESSION_KEY = 'awp_authenticated';

    // Check if already authenticated in this session
    if (sessionStorage.getItem(SESSION_KEY) === 'true') {
        console.log('Already authenticated');
        return; // Already authenticated, allow access
    }

    console.log('Authentication required - creating password prompt');

    // Simple hash function for password verification
    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Create password overlay
    function createPasswordOverlay() {
        console.log('Creating password overlay');

        const overlay = document.createElement('div');
        overlay.id = 'password-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #FF6B00 0%, #CC5500 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        `;

        overlay.innerHTML = `
            <div style="
                background: white;
                padding: 3rem;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                max-width: 400px;
                width: 90%;
                text-align: center;
            ">
                <h1 style="
                    color: #FF6B00;
                    margin-bottom: 1rem;
                    font-size: 2rem;
                ">AWP Safety</h1>
                <h2 style="
                    color: #343A40;
                    margin-bottom: 2rem;
                    font-size: 1.25rem;
                    font-weight: 400;
                ">TTC Calculator Access</h2>
                <p style="
                    color: #6C757D;
                    margin-bottom: 1.5rem;
                ">Please enter the password to access the calculator.</p>
                <form id="password-form">
                    <input
                        type="password"
                        id="password-input"
                        placeholder="Enter password"
                        autocomplete="off"
                        style="
                            width: 100%;
                            padding: 0.875rem;
                            border: 2px solid #DEE2E6;
                            border-radius: 8px;
                            font-size: 1rem;
                            margin-bottom: 1rem;
                            box-sizing: border-box;
                            transition: border-color 0.2s;
                        "
                    />
                    <button
                        type="submit"
                        style="
                            width: 100%;
                            padding: 0.875rem;
                            background: #FF6B00;
                            color: white;
                            border: none;
                            border-radius: 8px;
                            font-size: 1rem;
                            font-weight: 600;
                            cursor: pointer;
                            transition: background 0.2s;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                        "
                        onmouseover="this.style.background='#CC5500'"
                        onmouseout="this.style.background='#FF6B00'"
                    >Access Calculator</button>
                    <p id="error-message" style="
                        color: #DC3545;
                        margin-top: 1rem;
                        font-size: 0.875rem;
                        min-height: 1.5rem;
                        font-weight: 500;
                    "></p>
                </form>
                <p style="
                    color: #ADB5BD;
                    margin-top: 2rem;
                    font-size: 0.75rem;
                ">Authorized AWP Safety personnel only</p>
            </div>
        `;

        // Ensure body exists
        if (!document.body) {
            console.error('Document body not ready');
            return;
        }

        // Hide body content but not the overlay
        document.body.style.visibility = 'hidden';

        // Append overlay to body (it will be visible because of its own styles)
        document.body.appendChild(overlay);

        // Make overlay visible even though body is hidden
        overlay.style.visibility = 'visible';

        console.log('Password overlay added to page');

        // Focus password input
        const input = document.getElementById('password-input');
        input.focus();

        // Handle form submission
        document.getElementById('password-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await verifyPassword();
        });

        // Add focus styles
        input.addEventListener('focus', () => {
            input.style.borderColor = '#FF6B00';
        });
        input.addEventListener('blur', () => {
            input.style.borderColor = '#DEE2E6';
        });
    }

    // Verify password
    async function verifyPassword() {
        const input = document.getElementById('password-input');
        const errorMessage = document.getElementById('error-message');
        const password = input.value;

        // Clear previous error
        errorMessage.textContent = '';

        if (!password) {
            errorMessage.textContent = 'Please enter a password';
            input.focus();
            return;
        }

        // Show loading state
        const button = document.querySelector('#password-form button');
        const originalText = button.textContent;
        button.textContent = 'Verifying...';
        button.disabled = true;

        // Hash and verify password
        const hash = await hashPassword(password);

        if (hash === PASSWORD_HASH) {
            // Correct password
            sessionStorage.setItem(SESSION_KEY, 'true');

            // Show success state briefly
            button.textContent = '✓ Access Granted';
            button.style.background = '#28A745';

            // Remove overlay and show content
            setTimeout(() => {
                document.getElementById('password-overlay').remove();
                document.body.style.visibility = 'visible';
            }, 500);
        } else {
            // Incorrect password
            errorMessage.textContent = 'Incorrect password. Please try again.';
            button.textContent = originalText;
            button.disabled = false;
            input.value = '';
            input.focus();

            // Shake animation
            const form = document.getElementById('password-form');
            form.style.animation = 'shake 0.5s';
            setTimeout(() => {
                form.style.animation = '';
            }, 500);
        }
    }

    // Add shake animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
    `;
    document.head.appendChild(style);

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createPasswordOverlay);
    } else {
        createPasswordOverlay();
    }
})();
