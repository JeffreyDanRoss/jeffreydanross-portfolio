# Jeffrey Dan Ross - Personal Website

A professional, high-performance static website for Jeffrey Dan Ross. Built using structured HTML5, Vanilla CSS3, and minimal interactive JavaScript.

The design utilizes a professional tech-firm aesthetic using deep charcoal, slate gray, navy blue, and subtle technology-inspired cyan accents. It presents Jeffrey as an Army Veteran, Operations Leader, Systems Builder, and Technology Enthusiast.

---

## File Structure

```
/css/style.css        # Responsive dark-theme variables, layouts, and components
/js/main.js           # Navigation controllers, accordion animations, form verification
/images/              # Asset storage (e.g. icons, backgrounds)
/index.html           # Home page & professional overview narrative
/experience.html      # Timelines for military, business ops, and automation systems
/projects.html        # Interactive accordion showing future and current projects
/technology.html      # Perspectives on AI, Blockchain, Governance, and emerging tech
/resume.html          # Web resume page and download handler
/resume.pdf           # Placeholder file for official resume
/contact.html         # Web contact form and direct email triggers
/Dockerfile           # Alpine Nginx builder setup
/docker-compose.yml   # Multi-container registry and Traefik proxy label bindings
/nginx.conf           # Gzip compression and clean routing rules
```

---

## Local Development

To run the website locally for review:

1. **Simple HTTP Server**:
   If you have Python installed, run this command in the project directory:
   ```bash
   python -m http.server 8000
   ```
   Open `http://localhost:8000` in your web browser.

2. **Docker Local Test**:
   Remove the `external: true` network flag in `docker-compose.yml` (or run a standalone container) to check formatting:
   ```bash
   docker build -t jeffrey-site .
   docker run -p 8080:80 jeffrey-site
   ```
   Open `http://localhost:8080` in your web browser.

---

## VPS Deployment Guide (Docker & Traefik)

This guide assumes your Linux VPS has **Docker**, **Docker Compose**, and an active **Traefik** proxy container listening on a shared network (usually named `traefik-public` or `web`).

### Step 1: Preparation
1. Upload this codebase directory to your Linux VPS (e.g. using `scp`, `rsync`, or cloning from a private Git repository to `/var/www/jeffrey-site`).
2. Replace `/var/www/jeffrey-site/resume.pdf` with your actual PDF resume.

### Step 2: Verification of Traefik Configuration
Ensure your Traefik router has Let's Encrypt configured. In `docker-compose.yml`:
- Update `Host(jeffreydanross.com)` to match your active domains.
- Confirm your Traefik network name matches `traefik-public`. If your proxy uses a network named `web` or `proxy`, update the network definition at the bottom of `docker-compose.yml`.
- Verify that your Traefik Let's Encrypt resolver name matches `letsencrypt`.

### Step 3: Run the Application
In your project directory on the VPS, execute:
```bash
docker compose up -d --build
```
This command:
1. Builds the Nginx container containing all HTML/CSS/JS/PDF assets.
2. Starts the service in detached mode (`-d`).
3. Connects the container to the external Traefik network, registering routes for `jeffreydanross.com` and `www.jeffreydanross.com`.
4. Handles automatic HTTPS certificate negotiation via Traefik.

---

## Alternative Deployment (Bare-Metal Nginx)

If you are running Nginx directly on the VPS host instead of inside Docker:

1. Copy all static files (`*.html`, `resume.pdf`, `/css`, `/js`, `/images`) to the Nginx root directory (usually `/var/www/html` or `/var/www/jeffreydanross`):
   ```bash
   mkdir -p /var/www/jeffreydanross
   cp -r * /var/www/jeffreydanross/
   ```

2. Point your Nginx virtual host configuration (`/etc/nginx/sites-available/jeffreydanross`) to your directory:
   ```nginx
   server {
       listen 80;
       server_name jeffreydanross.com www.jeffreydanross.com;
       root /var/www/jeffreydanross;
       index index.html;

       location / {
           try_files $uri $uri.html $uri/ =404;
       }

       error_page 404 /404.html;

       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|pdf)$ {
           expires 30d;
           add_header Cache-Control "public, no-transform";
       }
   }
   ```

3. Enable the site and restart Nginx:
   ```bash
   ln -s /etc/nginx/sites-available/jeffreydanross /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   ```
