# Garbage Classification Web

Website phân loại hình ảnh rác thải. Người dùng upload ảnh rác thải lên hệ thống, sau đó hệ thống sẽ dự đoán loại rác và hiển thị các hình ảnh liên quan đến loại rác đó.

## 1. Giới thiệu đề tài

Dự án xây dựng một hệ thống phân loại rác thải tự động thông qua hình ảnh. Hệ thống hỗ trợ nhận diện các nhóm rác phổ biến như:

- Cardboard - Bìa carton
- Glass - Thủy tinh
- Metal - Kim loại
- Paper - Giấy
- Plastic - Nhựa
- Trash - Rác khác

Hệ thống có thể ứng dụng trong các mô hình thùng rác thông minh, robot tái chế hoặc hệ thống hỗ trợ phân loại rác tại nguồn.

## 2. Công nghệ sử dụng

### Frontend

- Vue 3
- Vite
- HTML
- CSS
- JavaScript

### Backend

- Node.js
- Express.js
- Multer
- CORS
- Dotenv
- Python script xử lý phân loại ảnh

## 3. Chức năng chính

- Upload ảnh rác từ máy tính
- Phân loại ảnh rác thành 6 nhóm
- Hiển thị kết quả dự đoán
- Hiển thị độ tin cậy
- Hiển thị mô tả loại rác
- Hiển thị gợi ý xử lý rác
- Hiển thị hình ảnh liên quan đến từng loại rác

## 4. Cấu trúc thư mục

```txt
garbage-classification-web/
│
├── README.md
├── INSTALL.md
│
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env
│   ├── uploads/
│   │
│   ├── public/
│   │   └── related-images/
│   │       ├── cardboard/
│   │       ├── glass/
│   │       ├── metal/
│   │       ├── paper/
│   │       ├── plastic/
│   │       └── trash/
│   │
│   └── ml/
│       ├── train_model.py
│       ├── predict.py
│       ├── requirements.txt
│       ├── models/
│       │   ├── garbage_svm_model.pkl
│       │   └── label_encoder.pkl
│       └── dataset/
│           ├── cardboard/
│           ├── glass/
│           ├── metal/
│           ├── paper/
│           ├── plastic/
│           └── trash/
│
└── frontend/
    ├── package.json
    ├── index.html
    └── src/
        ├── main.js
        ├── App.vue
        ├── style.css
        └── services/
            └── garbageApi.js
```

## 5. Dataset

Dataset gồm 6 nhóm ảnh rác:

```txt
cardboard
glass
metal
paper
plastic
trash
```

Sau khi tải dataset, đặt ảnh vào đúng thư mục:

```txt
backend/ml/dataset/cardboard/
backend/ml/dataset/glass/
backend/ml/dataset/metal/
backend/ml/dataset/paper/
backend/ml/dataset/plastic/
backend/ml/dataset/trash/
```

Tên thư mục phải đúng với tên class trong code.

## 6. Cài đặt Backend

Đi vào thư mục backend:

```bash
cd backend
```

Cài package Node.js:

```bash
npm install
```

Cài thư viện Python:

```bash
pip install -r ml/requirements.txt
```

Tạo file `.env` trong thư mục backend:

```env
PORT=3001
PYTHON_COMMAND=python
```

Nếu máy dùng lệnh `py`, đổi thành:

```env
PORT=3001
PYTHON_COMMAND=py
```

## 7. Train model

Trước khi chạy phân loại, cần train model:

```bash
python ml/train_model.py
```

Sau khi train thành công, hệ thống sẽ tạo 2 file:

```txt
backend/ml/models/garbage_svm_model.pkl
backend/ml/models/label_encoder.pkl
```

Nếu chưa có 2 file này, chức năng phân loại sẽ không chạy được.

## 8. Chạy Backend

Trong thư mục backend:

```bash
npm run dev
```

Backend chạy tại:

```txt
http://localhost:3001
```

Kiểm tra backend bằng cách mở trình duyệt:

```txt
http://localhost:3001
```

Kết quả đúng:

```json
{
  "success": true,
  "message": "Garbage Classification Backend is running"
}
```

## 9. Cài đặt Frontend

Mở terminal khác, đi vào thư mục frontend:

```bash
cd frontend
```

Cài thư viện:

```bash
npm install
```

Chạy frontend:

```bash
npm run dev
```

Frontend chạy tại:

```txt
http://localhost:5173
```

## 10. API chính

### POST `/api/waste/predict`

API dùng để nhận ảnh và trả về kết quả phân loại.

Endpoint:

```txt
http://localhost:3001/api/waste/predict
```

Kiểu dữ liệu gửi lên:

```txt
multipart/form-data
```

Tên field ảnh:

```txt
image
```

Response mẫu:

```json
{
  "success": true,
  "uploadedImage": "http://localhost:3001/uploads/example.jpg",
  "predictedClass": "plastic",
  "viName": "Nhựa",
  "description": "Rác nhựa gồm chai nhựa, hộp nhựa, ly nhựa, túi nhựa và các loại bao bì nhựa.",
  "suggestion": "Nên làm sạch và ép dẹp chai nhựa trước khi bỏ vào thùng tái chế.",
  "confidence": 85.42,
  "relatedImages": [
    "http://localhost:3001/related-images/plastic/plastic1.jpg",
    "http://localhost:3001/related-images/plastic/plastic2.jpg"
  ]
}
```

## 11. Hình ảnh liên quan

Để hiển thị hình ảnh liên quan, thêm ảnh mẫu vào thư mục:

```txt
backend/public/related-images/
```

Ví dụ:

```txt
backend/public/related-images/plastic/plastic1.jpg
backend/public/related-images/plastic/plastic2.jpg

backend/public/related-images/glass/glass1.jpg
backend/public/related-images/glass/glass2.jpg
```

Khi hệ thống dự đoán class là `plastic`, hệ thống sẽ lấy ảnh trong:

```txt
backend/public/related-images/plastic/
```

Lưu ý: nếu hệ thống dự đoán `cardboard` nhưng folder `cardboard` không có ảnh, phần hình ảnh liên quan sẽ không hiển thị.

## 12.1 Luồng hoạt động hệ thống

```txt
Người dùng upload ảnh rác thải
        ↓
Frontend Vue gửi ảnh đến Backend Node.js
        ↓
Backend lưu ảnh vào thư mục uploads
        ↓
Backend gọi file predict.py
        ↓
File predict.py xử lý và phân loại ảnh
        ↓
Backend nhận kết quả phân loại
        ↓
Backend bổ sung mô tả, gợi ý và ảnh liên quan
        ↓
Frontend hiển thị kết quả cho người dùng
```
## 12.2 Luồng hoạt động tổng thể
```txt
User upload ảnh
      │
      ▼
[Vue 3 Frontend]  ──POST /api/garbage/predict──>  [Express Server]
                                                         │
                                              lưu ảnh vào /uploads
                                                         │
                                         spawn python test_svm.py <path>
                                                         │
                                              [test_svm.py]
                                              ├─ Load svm_garbage_model.joblib
                                              ├─ MobileNetV2 trích xuất đặc trưng
                                              └─ LinearSVC dự đoán → in JSON
                                                         │
                                              trả về { predictedClass, confidence }
                                                         │
[Vue 3 Frontend]  <──JSON response───────────  [Express Server]
     │
     └─ Hiển thị: tên lớp, mô tả, gợi ý xử lý, ảnh liên quan
```
## 13. Cách chạy toàn bộ hệ thống

### Bước 1: Train model

```bash
cd backend
python ml/train_model.py
```

### Bước 2: Chạy backend

```bash
npm run dev
```

### Bước 3: Chạy frontend

Mở terminal khác:

```bash
cd frontend
npm run dev
```

Sau đó mở:

```txt
http://localhost:5173
```

## 14. Một số lỗi thường gặp

### Lỗi dataset rỗng

Thông báo:

```txt
Dataset rỗng. Hãy thêm ảnh vào backend/ml/dataset trước.
```

Cách sửa:

Kiểm tra đã đặt ảnh đúng thư mục chưa:

```txt
backend/ml/dataset/cardboard/
backend/ml/dataset/glass/
backend/ml/dataset/metal/
backend/ml/dataset/paper/
backend/ml/dataset/plastic/
backend/ml/dataset/trash/
```

### Lỗi chưa có model

Thông báo:

```txt
Chưa có model. Hãy chạy lệnh: python ml/train_model.py
```

Cách sửa:

```bash
cd backend
python ml/train_model.py
```

### Lỗi Failed to fetch

Nguyên nhân thường là backend chưa chạy.

Cách sửa:

```bash
cd backend
npm run dev
```

Kiểm tra backend tại:

```txt
http://localhost:3001
```

### Lỗi Unexpected token '<', '<!DOCTYPE ...' is not valid JSON

Nguyên nhân là frontend gọi API nhưng nhận về HTML thay vì JSON. Thường do sai port hoặc backend chưa chạy.

Kiểm tra file:

```txt
frontend/src/services/wasteApi.js
```

Đảm bảo API base URL là:

```js
const API_BASE_URL = "http://localhost:3001";
```

### Không hiển thị hình ảnh liên quan

Kiểm tra có ảnh trong thư mục tương ứng chưa:

```txt
backend/public/related-images/<predictedClass>/
```

Ví dụ nếu hệ thống dự đoán `glass`, cần có ảnh trong:

```txt
backend/public/related-images/glass/
```

Có thể test trực tiếp bằng trình duyệt:

```txt
http://localhost:3001/related-images/glass/glass1.jpg
```

## 15. Hạn chế của hệ thống

- Kết quả dự đoán phụ thuộc nhiều vào chất lượng dataset.
- Hệ thống có thể nhầm giữa các loại rác có hình dạng hoặc màu sắc giống nhau.
- Ảnh chụp thiếu sáng, bị mờ hoặc nền phức tạp có thể làm giảm độ chính xác.
- Cần bổ sung thêm dữ liệu thực tế để cải thiện kết quả phân loại.

## 16. Hướng phát triển

- Cải thiện độ chính xác của chức năng phân loại.
- Lưu lịch sử phân loại vào database.
- Thống kê số lượng rác theo từng loại.
- Thêm biểu đồ thống kê trên giao diện quản trị.
- Kết nối với phần cứng để điều khiển thùng rác thông minh.
- Phát triển chức năng nhận diện nhiều vật thể trong cùng một ảnh.

## 17. Tác giả

Dự án được xây dựng phục vụ học tập môn Khai khoáng Dữ liệu và thực hành xây dựng website phân loại hình ảnh rác thải.

## Hướng dẫn cài đặt

Xem chi tiết tại file [INSTALL.md](./INSTALL.md).
