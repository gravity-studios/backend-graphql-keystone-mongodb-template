# Nginx Dockerfile

# Set the base image to Ubuntu
FROM ubuntu:14.04.3

# System Level Configurations
ENV DEBIAN_FRONTEND noninteractive

# Update the repository and install stable nginx
RUN apt-get update
RUN apt-get install -y nginx git
RUN apt-get autoclean
#RUN echo "\ndaemon off;" >> /etc/nginx/nginx.conf
#RUN chown -R www-data:www-data /var/lib/nginx

# Custom Config
ADD devbox.default /etc/nginx/sites-available/default

# Add static files and change ownership
RUN mkdir -p /opt/app/static
WORKDIR /opt/app/static
ADD static .
#RUN chown -R www-data:www-data /opt/app/static

# Expose port
EXPOSE 80

# Run Nginx Server
ENTRYPOINT  ["nginx", "-g", "daemon off;"]