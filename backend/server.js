const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3001;
const PYTHON_COMMAND = process.env.PYTHON_COMMAND || "python";

const UPLOAD_DIR = path.join(__dirname, "uploads");
const RELATED_IMAGES_DIR = path.join(__dirname, "public", "related-images");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(UPLOAD_DIR));
app.use("/related-images", express.static(RELATED_IMAGES_DIR));

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
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const classInfo = {
  cardboard: {
    viName: "Bìa carton",
    description:
      "Bìa carton là loại rác có thể tái chế, thường xuất hiện ở hộp giấy, thùng hàng hoặc bao bì đóng gói.",
    suggestion:
      "Nên làm phẳng bìa carton trước khi bỏ vào thùng rác tái chế.",
  },
  glass: {
    viName: "Thủy tinh",
    description:
      "Rác thủy tinh gồm chai, lọ hoặc vật dụng làm từ thủy tinh.",
    suggestion:
      "Nên bỏ riêng thủy tinh để tránh gây nguy hiểm và hỗ trợ tái chế hiệu quả.",
  },
  metal: {
    viName: "Kim loại",
    description:
      "Rác kim loại thường gồm lon nước, hộp thiếc, nắp chai hoặc vật dụng kim loại nhỏ.",
    suggestion:
      "Nên rửa sạch lon hoặc hộp kim loại trước khi bỏ vào thùng tái chế.",
  },
  paper: {
    viName: "Giấy",
    description:
      "Rác giấy gồm giấy in, báo, tạp chí, giấy viết hoặc các loại giấy khô.",
    suggestion:
      "Không nên bỏ giấy bị ướt hoặc dính dầu mỡ vào nhóm giấy tái chế.",
  },
  plastic: {
    viName: "Nhựa",
    description:
      "Rác nhựa gồm chai nhựa, hộp nhựa, ly nhựa, túi nhựa và bao bì nhựa.",
    suggestion:
      "Nên làm sạch và ép dẹp chai nhựa trước khi bỏ vào thùng tái chế.",
  },
  trash: {
    viName: "Rác khác",
    description:
      "Đây là nhóm rác khó tái chế hoặc không thuộc các nhóm phổ biến như giấy, nhựa, kim loại, thủy tinh.",
    suggestion:
      "Nên phân loại kỹ để tránh trộn lẫn với các loại rác có thể tái chế.",
  },
};

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

function runPythonPrediction(imagePath) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, "ml", "predict.py");

    const pythonProcess = spawn(PYTHON_COMMAND, [scriptPath, imagePath]);

    let result = "";
    let error = "";

    pythonProcess.stdout.on("data", (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      error += data.toString();
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(error || "Python prediction failed."));
      }

      try {
        const parsed = JSON.parse(result);
        resolve(parsed);
      } catch (err) {
        reject(new Error("Không đọc được kết quả trả về từ Python."));
      }
    });
  });
}

app.get("/", (req, res) => {
  res.json({
    message: "Garbage Classification Backend is running",
  });
});

app.post("/api/garbage/predict", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng upload ảnh.",
      });
    }

    const imagePath = req.file.path;
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const prediction = await runPythonPrediction(imagePath);

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

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});