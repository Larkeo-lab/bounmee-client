# ใช้ Nginx เป็น Web Server
FROM nginx:alpine

# ก๊อปปี้ไฟล์ที่ Build เสร็จแล้วเข้าเครื่อง
COPY dist /usr/share/nginx/html

# สร้างไฟล์ Configuration เพื่อรองรับ SPA Routing (แก้ปัญหา 404 ตอนสแกน)
RUN echo 'server { \
    listen 4173; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# เปิด Port 4173
EXPOSE 4173

CMD ["nginx", "-g", "daemon off;"]
