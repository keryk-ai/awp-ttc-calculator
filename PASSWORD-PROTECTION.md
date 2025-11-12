# Password Protection

## Current Password

**Password**: `AWP2025`

This password is required to access the TTC Calculator on GitHub Pages.

## How It Works

The password protection is implemented using client-side JavaScript (`auth.js`):

1. When the page loads, all content is hidden
2. A password prompt overlay appears
3. User enters password
4. Password is hashed (SHA-256) and compared to stored hash
5. If correct, content is revealed and access is stored in `sessionStorage`
6. User stays authenticated for the browser session (closes when tab/browser closes)

## Security Notes

⚠️ **This is NOT cryptographically secure** ⚠️

This is client-side password protection, which means:
- Password hash is visible in the source code
- Technical users can bypass it by viewing source
- Provides basic access control for casual users only

**Best for**: Internal tools, deterring casual access, team-only resources
**NOT suitable for**: Protecting sensitive data, PII, financial information

## Changing the Password

To change the password:

1. **Generate new hash**:
   ```javascript
   // In browser console, run:
   const password = "YourNewPassword";
   crypto.subtle.digest('SHA-256', new TextEncoder().encode(password))
     .then(hash => {
       const hashArray = Array.from(new Uint8Array(hash));
       const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
       console.log('New password hash:', hashHex);
     });
   ```

2. **Update `auth.js`**:
   - Open `docs/auth.js`
   - Find line: `const PASSWORD_HASH = '...'`
   - Replace with your new hash
   - Commit and push

## Removing Password Protection

To remove password protection entirely:

1. Delete `docs/auth.js`
2. Remove script tag from `docs/index.html`:
   ```html
   <script src="auth.js"></script>
   ```
3. Commit and push

## Alternative Solutions

For stronger security, consider:

1. **Netlify** - Has built-in password protection with server-side validation
2. **Vercel** - Supports password protection in paid plans
3. **Private GitHub Repository** - Make repo private, only authorized users can access
4. **Custom Authentication** - Build a proper auth system with backend
5. **VPN/IP Restriction** - Restrict access by IP address

## Session Behavior

- **Authentication stored in**: `sessionStorage` (key: `awp_authenticated`)
- **Duration**: Lasts until browser tab/window is closed
- **Scope**: Per-tab (opening new tab requires re-authentication)
- **Clearing**: Close tab, or run `sessionStorage.clear()` in console
