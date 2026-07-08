import os
import cv2
import joblib
import numpy as np

from skimage.feature import hog
from sklearn.svm import SVC
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, "dataset")
MODEL_DIR = os.path.join(BASE_DIR, "models")

IMAGE_SIZE = (128, 128)

CLASSES = [
    "cardboard",
    "glass",
    "metal",
    "paper",
    "plastic",
    "trash"
]


def extract_hog_features(image_path):
    image = cv2.imread(image_path)

    if image is None:
        return None

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

    return features


def load_dataset():
    X = []
    y = []

    for class_name in CLASSES:
        class_dir = os.path.join(DATASET_DIR, class_name)

        if not os.path.exists(class_dir):
            print(f"Folder không tồn tại: {class_dir}")
            continue

        for filename in os.listdir(class_dir):
            if not filename.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
                continue

            image_path = os.path.join(class_dir, filename)
            features = extract_hog_features(image_path)

            if features is not None:
                X.append(features)
                y.append(class_name)

    return np.array(X), np.array(y)


def train():
    os.makedirs(MODEL_DIR, exist_ok=True)

    print("Đang đọc dataset...")
    X, y = load_dataset()

    print("Tổng số ảnh:", len(X))

    if len(X) == 0:
        raise Exception("Dataset rỗng. Hãy thêm ảnh vào backend/ml/dataset trước.")

    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y_encoded,
        test_size=0.2,
        random_state=42,
        stratify=y_encoded
    )

    model = Pipeline([
        ("scaler", StandardScaler()),
        ("svm", SVC(
            kernel="rbf",
            C=10,
            gamma="scale",
            probability=True
        ))
    ])

    print("Đang train SVM...")
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)

    accuracy = accuracy_score(y_test, y_pred)

    print("Accuracy:", accuracy)
    print(classification_report(
        y_test,
        y_pred,
        target_names=label_encoder.classes_
    ))

    model_path = os.path.join(MODEL_DIR, "waste_svm_model.pkl")
    encoder_path = os.path.join(MODEL_DIR, "label_encoder.pkl")

    joblib.dump(model, model_path)
    joblib.dump(label_encoder, encoder_path)

    print("Đã lưu model tại:", model_path)
    print("Đã lưu label encoder tại:", encoder_path)


if __name__ == "__main__":
    train()