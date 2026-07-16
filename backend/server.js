const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const http = require("http");
const { spawn, execFile } = require("child_process");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3001;

// Python executable trong venv
const VENV_PYTHON = path.join(__dirname, "..", ".venv", "Scripts", "python.exe");
const PYTHON_BIN = fs.existsSync(VENV_PYTHON) ? VENV_PYTHON : (process.env.PYTHON_COMMAND || "python");

const UPLOAD_DIR = path.join(__dirname, "uploads");
const RELATED_IMAGES_DIR = path.join(__dirname, "public", "related-images");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(UPLOAD_DIR));
app.use("/related-images", express.static(RELATED_IMAGES_DIR));

// =====================================================================
// MULTER CONFIG
// =====================================================================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = function (req, file, cb) {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Chỉ cho phép upload file ảnh JPG, PNG hoặc WEBP."), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// =====================================================================
// CLASS INFO
// =====================================================================
const classInfo = {
  cardboard: {
    viName: "Bìa carton",
    description:
      "Bìa carton là loại giấy cứng được tạo từ nhiều lớp giấy ép lại với nhau, thường được sử dụng để đóng gói và bảo vệ hàng hóa. Loại rác này bao gồm thùng carton, hộp giấy cứng, bìa đóng gói và các tấm carton. Đây là loại rác có thể tái chế.",
    suggestion:
      "Nên tháo băng keo nếu có, làm phẳng thùng carton và giữ khô ráo trước khi bỏ vào thùng rác tái chế.",
  },
  glass: {
    viName: "Thủy tinh",
    description:
      "Thủy tinh là vật liệu được sản xuất từ cát và các khoáng chất, có đặc tính trong suốt, cứng và có thể tái chế nhiều lần. Loại rác này bao gồm chai thủy tinh, lọ đựng thực phẩm, hũ mỹ phẩm, cốc và các vật dụng bằng thủy tinh.",
    suggestion:
      "Nên rửa sạch chai, lọ trước khi bỏ vào thùng tái chế. Nếu thủy tinh bị vỡ, hãy bọc cẩn thận để tránh gây nguy hiểm.",
  },
  metal: {
    viName: "Kim loại",
    description:
      "Kim loại là vật liệu có độ bền cao, thường được sử dụng để sản xuất bao bì và nhiều vật dụng trong sinh hoạt. Loại rác này bao gồm lon nước ngọt, lon bia, hộp đồ hộp, nắp chai kim loại, dây kim loại và các vật dụng bằng nhôm, sắt hoặc thép. Đây là loại rác có thể tái chế.",
    suggestion:
      "Nên làm sạch lon hoặc hộp kim loại trước khi bỏ vào thùng rác tái chế.",
  },
  paper: {
    viName: "Giấy",
    description:
      "Giấy là vật liệu được làm từ sợi thực vật, thường dùng để viết, in ấn và đóng gói. Loại rác này bao gồm giấy in, giấy viết, báo, tạp chí, sách cũ, tập vở và giấy quảng cáo còn sạch, khô. Đây là loại rác có thể tái chế.",
    suggestion:
      "Không nên bỏ giấy bị ướt, dính dầu mỡ hoặc thức ăn vào nhóm giấy tái chế.",
  },
  plastic: {
    viName: "Nhựa",
    description:
      "Nhựa là vật liệu tổng hợp có trọng lượng nhẹ, bền và được sử dụng phổ biến trong đời sống hằng ngày. Loại rác này bao gồm chai nhựa, hộp nhựa, ly nhựa, túi ni lông, bao bì thực phẩm và các vật dụng bằng nhựa. Nhiều loại nhựa có thể được tái chế.",
    suggestion:
      "Nên rửa sạch, ép dẹp chai hoặc hộp nhựa trước khi bỏ vào thùng rác tái chế.",
  },
  trash: {
    viName: "Rác khó tái chế",
    description:
      "Rác khó tái chế là những loại rác không thể hoặc rất khó được tái chế do tính chất vật liệu hoặc đã bị nhiễm bẩn. Nhóm này bao gồm giấy ăn đã qua sử dụng, khẩu trang, tã lót, gốm sứ vỡ, xốp bẩn, giấy dính dầu mỡ và các vật liệu hỗn hợp.",
    suggestion:
      "Nên bỏ riêng nhóm rác này để tránh làm ảnh hưởng đến quá trình tái chế các loại rác khác.",
  },
};

// =====================================================================
// GỌI PYTHON SCRIPT TRỰC TIẾP (FastAPI Server)
// =====================================================================
const uvicornPath = path.join(__dirname, "..", ".venv", "Scripts", "uvicorn.exe");
const uvicornCommand = fs.existsSync(uvicornPath) ? uvicornPath : "uvicorn";

console.log("[Node] Đang khởi động FastAPI Server...");

const pythonProcess = spawn(uvicornCommand, ["ml.test_svm:app", "--port", "8000"], {
  env: {
    ...process.env,
    PYTHONIOENCODING: "utf-8",
    PYTHONUTF8: "1",
    TF_CPP_MIN_LOG_LEVEL: "3",
    TF_ENABLE_ONEDNN_OPTS: "0"
  },
  cwd: __dirname
});

pythonProcess.stdout.on("data", (data) => {
  const output = data.toString("utf-8");
  const lines = output.split('\n');
  lines.forEach(line => {
    if (line.trim()) console.log(`[FastAPI] ${line.trim()}`);
  });
});

pythonProcess.stderr.on("data", (data) => {
  const output = data.toString("utf-8");
  const lines = output.split('\n');
  lines.forEach(line => {
    if (line.trim()) console.error(`[FastAPI] ${line.trim()}`);
  });
});

pythonProcess.on("close", (code) => {
  console.log(`[Node] FastAPI process exited with code ${code}`);
});

async function predictWithPython(imagePath) {
  console.log(`[Node] Gửi request tới FastAPI: ${imagePath}`);
  try {
    const response = await fetch("http://127.0.0.1:8000/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image_path: imagePath }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Lỗi từ FastAPI");
    }

    const data = await response.json();
    return {
      success: true,
      predictedClass: data.predictedClass,
      confidence: data.confidence
    };
  } catch (error) {
    console.error(`[Node] FastAPI Request Error: ${error.message}`);
    throw new Error(`Lỗi giao tiếp với FastAPI: ${error.message}`);
  }
}

// =====================================================================
// HELPER: ẢNH LIÊN QUAN
// =====================================================================
function getRelatedImages(className, req) {
  const classFolder = path.join(RELATED_IMAGES_DIR, className);

  console.log("Predicted class:", className);
  console.log("Related image folder:", classFolder);

  if (!fs.existsSync(classFolder)) {
    console.log("Folder ảnh liên quan không tồn tại:", classFolder);
    return [];
  }

  const files = fs
    .readdirSync(classFolder)
    .filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file))
    .slice(0, 6);

  console.log("Related files:", files);

  const baseUrl = `${req.protocol}://${req.get("host")}`;
  return files.map((file) => `${baseUrl}/related-images/${className}/${file}`);
}

// =====================================================================
// ROUTES
// =====================================================================
app.get("/", (req, res) => {
  res.json({
    message: "Garbage Classification Backend is running (Direct Python mode)",
  });
});

app.post("/api/garbage/predict", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Vui lòng upload ảnh." });
    }

    const imagePath = req.file.path;
    const prediction = await predictWithPython(imagePath);

    if (!prediction.success) {
      return res.status(500).json({
        success: false,
        message: prediction.message || "Không thể phân loại ảnh.",
      });
    }

    const predictedClass = prediction.predictedClass;
    const info = classInfo[predictedClass] || {
      viName: predictedClass,
      description: "",
      suggestion: "",
    };

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    return res.json({
      success: true,
      uploadedImage: `${baseUrl}/uploads/${req.file.filename}`,
      predictedClass,
      viName: info.viName,
      description: info.description,
      suggestion: info.suggestion,
      confidence: prediction.confidence,
      relatedImages: getRelatedImages(predictedClass, req),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
});

app.use((error, req, res, next) => {
  return res.status(400).json({
    success: false,
    message: error.message || "Upload thất bại.",
  });
});

// =====================================================================
// KHỞI ĐỘNG
// =====================================================================
app.listen(PORT, () => {
  console.log(`[Node] Backend running on http://localhost:${PORT}`);
});
