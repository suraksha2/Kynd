# Deployment Guide — Contabo VPS (Apache)

This guide deploys the **Helpr** project on a Contabo VPS that already runs **Apache**.

## Architecture

| Component        | Path             | Tech              | Port | Notes |
|------------------|------------------|-------------------|------|-------|
| Frontend (SPA)   | `/`              | Vite + React      | —    | Static build → `dist/`, served by Apache |
| Backend / Admin  | `/backend/db`    | Next.js 14        | 3001 | API routes under `/api/*`, runs via PM2 |
| Database         | —                | MySQL             | 3306 | DB name: `urban_service` |

Apache serves the static SPA and **reverse-proxies `/api`** to the Next.js
backend on `localhost:3001`. This keeps everything on one domain (no CORS, no
hardcoded `localhost` in the browser).

---

## 0. Prerequisites

- A Contabo VPS with root/sudo access and Apache already installed.
- A domain (or subdomain) pointed at the VPS IP, e.g. `helpr.example.com`.
- SSH access to the server.

```bash
sudo apt update && sudo apt upgrade -y
```

---

## 1. Install Node.js (LTS) + PM2

```bash
# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v && npm -v

# PM2 process manager (keeps the Next.js backend alive + auto-start on reboot)
sudo npm install -g pm2
```

---

## 2. Install & configure MySQL

```bash
sudo apt install -y mysql-server
sudo systemctl enable --now mysql
sudo mysql_secure_installation
```

Create the database and a dedicated user:

```bash
sudo mysql
```

```sql
CREATE DATABASE urban_service CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'helpr'@'localhost' IDENTIFIED BY 'CHANGE_ME_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON urban_service.* TO 'helpr'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 3. Get the code onto the server

```bash
sudo mkdir -p /var/www/helpr
sudo chown -R $USER:$USER /var/www/helpr
cd /var/www/helpr

# Option A: clone from your git remote
git clone <YOUR_REPO_URL> .

# Option B: copy from your machine (run locally, not on server)
# rsync -av --exclude node_modules --exclude dist ./ user@SERVER_IP:/var/www/helpr/
```

---

## 4. Configure the backend environment

Create `/var/www/helpr/backend/db/.env.local`:

```bash
nano /var/www/helpr/backend/db/.env.local
```

```env
MYSQL_HOST=localhost
MYSQL_USER=helpr
MYSQL_PASSWORD=CHANGE_ME_STRONG_PASSWORD
MYSQL_DATABASE=urban_service

# Generate with: openssl rand -hex 32
SESSION_SECRET=replace_with_a_long_random_64_char_secret

WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
```

Import the schema/seed data:

```bash
mysql -u helpr -p urban_service < /var/www/helpr/backend/db/db.sql
```

---

## 5. IMPORTANT — Fix the hardcoded API URL in the frontend

The frontend currently points at `http://localhost:3001`, which only works on
your dev machine. For production, switch it to a **relative `/api` base** so the
browser hits the same domain (Apache then proxies it to the backend).

Affected files:
- `src/context/AuthContext.jsx`  → `const API_BASE = 'http://localhost:3001/api'`
- `src/context/ServicesContext.jsx` → `let url = 'http://localhost:3001/api/services'`
- `src/pages/AdminPanel.jsx` → `const API_BASE = "http://localhost:3001/api";`
- `src/components/home/Hero.jsx` → `const API_BASE = 'http://localhost:3001'`

**Recommended:** use a Vite env variable. Create `.env.production` in the
project root:

```env
VITE_API_BASE=/api
```

Then change each hardcoded base to read from the env var, e.g.:

```js
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api'
```

(For `Hero.jsx`, which uses `${API_BASE}/api/cities`, set
`VITE_API_BASE=''` semantics carefully — simplest is to make all of them use
`/api` and call `${API_BASE}/cities`.)

> If you prefer not to touch the code, you can instead serve the app from the
> same host and proxy `http://localhost:3001` — but the relative `/api`
> approach is cleaner and avoids mixed-content/CORS issues over HTTPS.

---

## 6. Build & run the backend (Next.js) with PM2

```bash
cd /var/www/helpr/backend/db
npm ci          # or: npm install
npm run build   # next build
pm2 start npm --name helpr-backend -- start   # runs `next start -p 3001`
pm2 save
pm2 startup     # follow the printed command to enable auto-start on boot
```

Verify it's listening:

```bash
curl http://localhost:3001/api/services
```

---

## 7. Build the frontend (static SPA)

```bash
cd /var/www/helpr
npm ci
npm run build   # outputs to dist/
```

The static site is now in `/var/www/helpr/dist`.

---

## 8. Configure Apache

Enable the required modules:

```bash
sudo a2enmod proxy proxy_http rewrite headers ssl
sudo systemctl restart apache2
```

Create the virtual host `/etc/apache2/sites-available/helpr.conf`:

```apache
<VirtualHost *:80>
    ServerName helpr.example.com
    DocumentRoot /var/www/helpr/dist

    <Directory /var/www/helpr/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    # Reverse-proxy API calls to the Next.js backend
    ProxyPreserveHost On
    ProxyPass        /api  http://127.0.0.1:3001/api
    ProxyPassReverse /api  http://127.0.0.1:3001/api

    # SPA fallback: send non-file, non-/api requests to index.html
    RewriteEngine On
    RewriteCond %{REQUEST_URI} !^/api
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^ /index.html [L]

    ErrorLog  ${APACHE_LOG_DIR}/helpr_error.log
    CustomLog ${APACHE_LOG_DIR}/helpr_access.log combined
</VirtualHost>
```

Enable the site and reload:

```bash
sudo a2ensite helpr.conf
sudo a2dissite 000-default.conf   # optional: disable the default site
sudo apache2ctl configtest
sudo systemctl reload apache2
```

---

## 9. Enable HTTPS (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-apache
sudo certbot --apache -d helpr.example.com
```

Certbot rewrites the vhost to add the `:443` block and HTTP→HTTPS redirect.
Auto-renewal is installed as a systemd timer; test it with:

```bash
sudo certbot renew --dry-run
```

---

## 10. Verify

- Visit `https://helpr.example.com` → SPA loads.
- `https://helpr.example.com/api/services` → returns JSON.
- Admin login + dashboard work (they hit `/api/...` via the proxy).

---

## Redeploy / Update workflow

```bash
cd /var/www/helpr
git pull

# Backend
cd backend/db && npm ci && npm run build && pm2 restart helpr-backend

# Frontend
cd /var/www/helpr && npm ci && npm run build
sudo systemctl reload apache2
```

---

## Troubleshooting

- **502 on `/api`** → backend not running. Check `pm2 status` and `pm2 logs helpr-backend`.
- **Blank page / 404 on refresh** → SPA fallback `RewriteRule` missing or `mod_rewrite` not enabled.
- **API works on server but not browser** → frontend still pointing at `localhost:3001`; revisit Step 5 and rebuild.
- **DB connection errors** → check `.env.local` credentials and `sudo systemctl status mysql`.
- **Firewall** → ensure ports 80/443 are open (`sudo ufw allow 'Apache Full'`); keep 3001 internal only.
