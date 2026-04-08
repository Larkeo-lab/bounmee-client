# ใช้ Nginx เป็น Web Server
FROM nginx:alpine

# ตั้งค่าให้ Nginx รันบน Port 4173
RUN sed -i 's/listen       80;/listen       4173;/g' /etc/nginx/conf.d/default.conf

# ก๊อปปี้โฟลเดอร์ dist ที่คุณ Build จากเครื่องตัวเองเข้าไปใน Nginx
COPY dist /usr/share/nginx/html

# เปิด Port 4173
EXPOSE 4173

CMD ["nginx", "-g", "daemon off;"]
