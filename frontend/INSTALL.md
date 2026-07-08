# STEP BY STEP - Hướng dẫn cài đặt Garbage Classification Web

Dự án gồm 2 phần:

- `backend`: Node.js + Express + Python xử lý phân loại ảnh
- `frontend`: Vue 3 + Vite

---

## Bước 1: Mở thư mục project

Mở PowerShell và chạy:

```powershell
cd D:\study\CT312\garbage-classification-web
```

Cấu trúc project cần có:

```txt
garbage-classification-web/
├── backend/
├── frontend/
├── README.md
└── INSTALL.md
```

---

## Bước 2: Cài đặt backend

Đi vào thư mục backend:

```powershell
cd backend
```

Cài thư viện Node.js:

```powershell
npm install
```

Cài thư viện Python:

```powershell
pip install -r ml\requirements.txt
```

Nếu `pip` không chạy, dùng:

```powershell
python -m pip install -r ml\requirements.txt
```

hoặc:

```powershell
py -m pip install -r ml\requirements.txt
```

---

## Bước 3: Tạo file `.env`

Trong thư mục:

```txt
backend/
```

tạo file:

```txt
.env
```

Nội dung file `.env`:

```env
PORT=3001
PYTHON_COMMAND=python
```

Nếu máy chạy Python bằng lệnh `py`, sửa thành:

```env
PORT=3001
PYTHON_COMMAND=py
```

---

## Bước 4: Kiểm tra dataset

Dataset phải nằm trong thư mục:

```txt
backend/ml/dataset/
```

Cấu trúc đúng:

```txt
backend/ml/dataset/
├── cardboard/
├── glass/
├── metal/
├── paper/
├── plastic/
└── trash/
```

Trong mỗi folder phải có ảnh tương ứng.

Ví dụ:

```txt
backend/ml/dataset/plastic/plastic1.jpg
backend/ml/dataset/plastic/plastic2.jpg

backend/ml/dataset/glass/glass1.jpg
backend/ml/dataset/glass/glass2.jpg
```

Tên folder bắt buộc phải đúng:

```txt
cardboard
glass
metal
paper
plastic
trash
```

Không đổi thành tiếng Việt.

---

## Bước 5: Train model

Vẫn đang ở thư mục `backend`, chạy:

```powershell
python ml\train_model.py
```

Nếu lỗi lệnh `python`, dùng:

```powershell
py ml\train_model.py
```

Nếu train thành công, hệ thống sẽ tạo ra 2 file:

```txt
backend/ml/models/garbage_svm_model.pkl
backend/ml/models/label_encoder.pkl
```

Nếu chưa có 2 file này thì chức năng phân loại chưa chạy được.

---

## Bước 6: Thêm hình ảnh liên quan

Ảnh liên quan phải nằm trong:

```txt
backend/public/related-images/
```

Cấu trúc đúng:

```txt
backend/public/related-images/
├── cardboard/
├── glass/
├── metal/
├── paper/
├── plastic/
└── trash/
```

Ví dụ:

```txt
backend/public/related-images/plastic/plastic1.jpg
backend/public/related-images/plastic/plastic2.jpg

backend/public/related-images/glass/glass1.jpg
backend/public/related-images/glass/glass2.jpg
```

Nếu hệ thống dự đoán là `plastic`, nó sẽ lấy ảnh trong:

```txt
backend/public/related-images/plastic/
```

---

## Bước 7: Chạy backend

Vẫn ở thư mục `backend`, chạy:

```powershell
npm run dev
```

Nếu thành công sẽ hiện:

```txt
Backend running on http://localhost:3001
```

Kiểm tra backend bằng cách mở trình duyệt:

```txt
http://localhost:3001
```

Nếu đúng sẽ thấy:

```json
{
  "success": true,
  "message": "Garbage Classification Backend is running"
}
```

Giữ terminal này đang chạy, không tắt.

---

## Bước 8: Cài đặt frontend

Mở terminal PowerShell mới.

Đi vào thư mục frontend:

```powershell
cd D:\study\CT312\garbage-classification-web\frontend
```

Cài thư viện frontend:

```powershell
npm install
```

---

## Bước 9: Chạy frontend

Trong thư mục `frontend`, chạy:

```powershell
npm run dev
```

Nếu thành công sẽ hiện đường dẫn:

```txt
http://localhost:5173
```

Mở trình duyệt và truy cập:

```txt
http://localhost:5173
```

---

## Bước 10: Sử dụng hệ thống

Sau khi backend và frontend đều chạy:

1. Mở `http://localhost:5173`
2. Bấm chọn ảnh rác thải
3. Bấm nút **Phân loại rác**
4. Hệ thống sẽ hiển thị:
   - Loại rác dự đoán
   - Độ tin cậy
   - Mô tả loại rác
   - Gợi ý xử lý
   - Hình ảnh liên quan

---

# Tóm tắt lệnh chạy nhanh

## Terminal 1 - Backend

```powershell
cd D:\study\CT312\garbage-classification-web\backend
npm install
pip install -r ml\requirements.txt
python ml\train_model.py
npm run dev
```

## Terminal 2 - Frontend

```powershell
cd D:\study\CT312\garbage-classification-web\frontend
npm install
npm run dev
```

Mở:

```txt
http://localhost:5173
```

---

# Lỗi thường gặp

## 1. Lỗi dataset rỗng

Thông báo:

```txt
Dataset rỗng. Hãy thêm ảnh vào backend/ml/dataset trước.
```

Cách sửa:

Kiểm tra dataset đã đặt đúng chưa:

```txt
backend/ml/dataset/cardboard/
backend/ml/dataset/glass/
backend/ml/dataset/metal/
backend/ml/dataset/paper/
backend/ml/dataset/plastic/
backend/ml/dataset/trash/
```

---

## 2. Lỗi chưa có model

Thông báo:

```txt
Chưa có model. Hãy chạy lệnh: python ml/train_model.py
```

Cách sửa:

```powershell
cd D:\study\CT312\garbage-classification-web\backend
python ml\train_model.py
```

---

## 3. Lỗi Failed to fetch

Nguyên nhân thường là backend chưa chạy.

Cách sửa:

```powershell
cd D:\study\CT312\garbage-classification-web\backend
npm run dev
```

Sau đó kiểm tra:

```txt
http://localhost:3001
```

---

## 4. Lỗi Unexpected token '<'

Thông báo:

```txt
Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

Nguyên nhân:

Frontend đang gọi API nhưng nhận về HTML, thường do backend chưa chạy hoặc sai port.

Cách sửa:

Kiểm tra file:

```txt
frontend/src/services/wasteApi.js
```

Dòng này phải đúng:

```js
const API_BASE_URL = "http://localhost:3001";
```

---

## 5. Không hiển thị hình ảnh liên quan

Nguyên nhân:

- Chưa thêm ảnh vào `backend/public/related-images`
- Sai tên folder
- Model dự đoán class khác với folder có ảnh

Ví dụ nếu model dự đoán `glass`, phải có ảnh trong:

```txt
backend/public/related-images/glass/
```

Kiểm tra trực tiếp bằng trình duyệt:

```txt
http://localhost:3001/related-images/glass/glass1.jpg
```

Nếu ảnh không hiện, nghĩa là ảnh đặt sai vị trí hoặc sai tên file.

---

# Lưu ý quan trọng

- Phải chạy `python ml\train_model.py` trước khi phân loại.
- Backend và frontend phải chạy cùng lúc.
- Backend chạy ở `http://localhost:3001`.
- Frontend chạy ở `http://localhost:5173`.
- Field upload ảnh trong API là `image`.
- Tên folder dataset và ảnh liên quan phải là tiếng Anh: `cardboard`, `glass`, `metal`, `paper`, `plastic`, `trash`.
