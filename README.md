ขั้นตอนแรก โคลนโปรเจคมมา โปรเจคนี้venvอาจมีปัญหา ต้องลบ venv และสร้างใหม่
1. cd ไปที่โปรเจคที่โคลนมา
2. rmdir /s /q venv #คำสั่งลบ venv
3. python -m venv venv #สร้าง venv ใหม่
4. venv\Scripts\activate #ใช้งาน venv

ต่อไป ใช้คำสั่งติดตั้ง django และ packgaesต่างๆ cd ไปที่ ไฟล์backend
1. pip install django #ติดตั้งdjango 
2. pip install -r requirements.txt #ตั้งแพ็คเกจ

ต่อมาในส่วน database ใช้ mysql  
1. mysql --version #คำสั้งตรวจสอบ mysql ว่ามีมั้ย
2. ถ้าไม่มี ให้ดาวโหลดทีที่  https://dev.mysql.com/downloads/installer
3. ติดตั้ง mysql สร้างรหัสผ่านroot ให้เสร็จ
4. เมื่อติดตั้งเสร็จลองใช้คำสั่ง mysql --version เพื่่อตรวจสอบว่าติดตั้งสำเร็จหรือไม่

ต่อมาสร้างdatabase ใหม่ ทำในcmd
1. ตัวอย่าง cd C:\Program Files\MySQL\MySQL Server 8.0\bin> #cd ไปที่ไฟล์ที่่ดาวโหลด mysql มา คัดลอกpath ถึงตัว bin เลย
2. mysql -u root -p #คำสั่งเข้าmysql และใส่รหัสที่เราสร้างไว้ตอนติดตั้ง
3. CREATE DATABASE toyland; #คำสั่ง สร้างดาต้าเบลดใหม่ ที่ใช้ชื่อ toyland เพราะใน database ใน setting.py ใน backendใช้ชื่อนี้ 

cd ไปที่ไฟล์backend 
1. python manage.py migrate #ใช้คำสั่งในterminal
2. python manage.py runserver  #เปิดใช้งานเซิร์ฟเวอร์

ในส่วนfrontend ใช้ react cd ไปที่ ไฟล์ frontend
1. node -v #ใช้คำสั่งนี้ตรวจสอบ ว่ามีnodejsหรือไม่ ถ้าไม่มีจะแสดงแบบนี้ The term 'node' is not recognized
2. https://nodejs.org #ให้เข้าเว็บไซต์นี้และดาวโหลดและติดตั้ง เมื่อติดตั้งเสร็จรีสตาร์ท PowerShell
3. npm -v #ใช้คำสั่งนี้ตรวจสอบว่าติดตั้งเสร็จแล้วหรือไม่ ถ้าแสดงเวอร์ชั่นแปลว่าติดตั้งสำเร็จ
4. npm install #ติดตั้ง dependencies (คำสั่งนี้จะติดตั้ง react-scripts และทุกอย่างที่ต้องใช้)
5. npm start #สั่งใช้งาน frontend

คำสั่งในการสร้างรหัสแอดมิน cd ไปที่ไฟล์ backend
1. python manage.py createsuperuser #สร้างอีเมลล์และรหัสแอดมิน











