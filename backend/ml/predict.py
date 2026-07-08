import os
import sys
import json
import cv2
import joblib
import numpy as np

from skimage.feature import hog


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")

MODEL_PATH = os.path.join(MODEL_DIR, "waste_svm_model.pkl")
LABEL_ENCODER_PATH = os.path.join(MODEL_DIR, "label_encoder.pkl")

IMAGE_SIZE = (128, 128)


def extract_hog_features(image_path):
    image = cv2.imread(image_path)

    if image is None:
        raise Exception("Không thể đọc ảnh.")

    image = cv2.resize(image, IMAGE_SIZE)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    features = hog(
        gray,
        orientations=9,
        pixels_per_cell=(8, 8),
        cells_per_block=(2, 2),
        block_norm="L2-Hys",
        transform_sqrt=True
    )

    return features.reshape(1, -1)


def predict(image_path):
    if not os.path.exists(MODEL_PATH):
        raise Exception(
            "Chưa có model. Hãy chạy python ml/train_model.py trước.")

    if not os.path.exists(LABEL_ENCODER_PATH):
        raise Exception(
            "Chưa có label encoder. Hãy chạy python ml/train_model.py trước.")

    model = joblib.load(MODEL_PATH)
    label_encoder = joblib.load(LABEL_ENCODER_PATH)

    features = extract_hog_features(image_path)

    predicted_encoded = model.predict(features)[0]
    predicted_class = label_encoder.inverse_transform([predicted_encoded])[0]

    probabilities = model.predict_proba(features)[0]
    confidence = float(np.max(probabilities) * 100)

    return {
        "success": True,
        "predictedClass": predicted_class,
        "confidence": round(confidence, 2)
    }


if __name__ == "__main__":
    try:
        if len(sys.argv) < 2:
            raise Exception("Thiếu đường dẫn ảnh.")

        image_path = sys.argv[1]
        result = predict(image_path)

        print(json.dumps(result, ensure_ascii=False))

    except Exception as e:
        print(json.dumps({
            "success": False,
            "message": str(e)
        }, ensure_ascii=False))
        sys.exit(1)
