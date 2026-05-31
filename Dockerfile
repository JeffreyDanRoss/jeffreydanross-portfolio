# ==========================================================================
# Jeffrey Dan Ross - Personal Website Dockerfile
# Builds a lightweight, high-performance container serving static assets via Nginx.
# ==========================================================================

FROM nginx:alpine

# Copy custom Nginx web server configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy static web pages and assets
COPY index.html /usr/share/nginx/html/
COPY experience.html /usr/share/nginx/html/
COPY projects.html /usr/share/nginx/html/
COPY technology.html /usr/share/nginx/html/
COPY resume.html /usr/share/nginx/html/
COPY contact.html /usr/share/nginx/html/
COPY resume.pdf /usr/share/nginx/html/

# Copy CSS and JS directories
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/

# Copy images directory
COPY images/ /usr/share/nginx/html/images/

# Expose standard HTTP port
EXPOSE 80

# Run Nginx in foreground to allow Docker container logging
CMD ["nginx", "-g", "daemon off;"]
