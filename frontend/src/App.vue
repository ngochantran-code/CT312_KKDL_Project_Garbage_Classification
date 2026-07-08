<template>
  <div class="page">
    <header class="hero">
      <div class="hero-content">
        <p class="eyebrow">Garbage Classification</p>

        <h1>Hệ thống phân loại hình ảnh rác</h1>

        <p class="subtitle">
          Upload hình ảnh rác thải, hệ thống sẽ dự đoán loại rác và hiển thị
          các hình ảnh liên quan đến nhóm rác đó.
        </p>

        <div class="hero-tags">
          <span>CNN</span>
          <span>SVM</span>
          <span>Vue.js</span>
          <span>Node.js</span>
        </div>
      </div>
    </header>

    <main class="main-layout">
      <section class="upload-card">
        <div class="card-title">
          <h2>Upload ảnh rác thải</h2>
          <p>Hỗ trợ JPG, JPEG, PNG, WEBP. Dung lượng tối đa 5MB.</p>
        </div>

        <label class="upload-box">
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            @change="handleFileChange"
          />

          <img
            v-if="previewUrl"
            :src="previewUrl"
            alt="Ảnh xem trước"
            class="preview-image"
          />

          <div v-else class="upload-placeholder">
            <div class="plus-icon">+</div>
            <strong>Nhấn để chọn ảnh</strong>
            <span>Ảnh càng rõ thì kết quả càng chính xác</span>
          </div>
        </label>

        <div v-if="selectedFile" class="file-info">
          <span>Tên file:</span>
          <strong>{{ selectedFile.name }}</strong>
        </div>

        <div v-if="errorMessage" class="error-box">
          {{ errorMessage }}
        </div>

        <div class="actions">
          <button
            class="primary-btn"
            :disabled="loading"
            @click="handlePredict"
          >
            {{ loading ? "Đang phân loại..." : "Phân loại rác" }}
          </button>

          <button
            class="secondary-btn"
            :disabled="loading"
            @click="handleReset"
          >
            Làm mới
          </button>
        </div>
      </section>

      <section class="result-card">
        <div v-if="!result" class="empty-state">
          <h2>Kết quả phân loại</h2>

          <p>
            Sau khi upload ảnh và bấm phân loại, kết quả sẽ hiển thị tại đây.
          </p>

          <div class="class-list">
            <span>Plastic</span>
            <span>Paper</span>
            <span>Glass</span>
            <span>Metal</span>
            <span>Cardboard</span>
            <span>Trash</span>
          </div>
        </div>

        <div v-else>
          <div class="result-header">
            <div>
              <p class="result-label">Loại rác dự đoán</p>
              <h2>{{ result.viName }}</h2>
              <span class="class-badge">{{ result.predictedClass }}</span>
            </div>

            <div class="confidence-box">
              <strong>{{ result.confidence }}%</strong>
              <span>tin cậy</span>
            </div>
          </div>

          <div class="result-body">
            <img
              :src="result.uploadedImage"
              alt="Ảnh đã upload"
              class="result-image"
            />

            <div class="result-text">
              <h3>Mô tả</h3>
              <p>{{ result.description }}</p>

              <h3>Gợi ý xử lý</h3>
              <p>{{ result.suggestion }}</p>
            </div>
          </div>

          <div class="related-section">
            <h3>Hình ảnh liên quan đến loại rác này</h3>

            <p
              v-if="!result.relatedImages || result.relatedImages.length === 0"
              class="muted"
            >
              Chưa có hình ảnh liên quan cho loại rác này.
            </p>

            <div v-else class="related-grid">
              <div
                v-for="(image, index) in result.relatedImages"
                :key="index"
                class="related-item"
              >
                <img :src="image" :alt="`Ảnh liên quan ${index + 1}`" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { predictGarbageImage } from "./services/garbageApi";

const selectedFile = ref(null);
const previewUrl = ref("");
const result = ref(null);
const loading = ref(false);
const errorMessage = ref("");

function handleFileChange(event) {
  const file = event.target.files?.[0];

  result.value = null;
  errorMessage.value = "";

  if (!file) {
    selectedFile.value = null;
    previewUrl.value = "";
    return;
  }

  if (!file.type.startsWith("image/")) {
    selectedFile.value = null;
    previewUrl.value = "";
    errorMessage.value = "Vui lòng chọn đúng file hình ảnh.";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    selectedFile.value = null;
    previewUrl.value = "";
    errorMessage.value = "Dung lượng ảnh không được vượt quá 5MB.";
    return;
  }

  selectedFile.value = file;
  previewUrl.value = URL.createObjectURL(file);
}

async function handlePredict() {
  if (!selectedFile.value) {
    errorMessage.value = "Vui lòng chọn ảnh trước khi phân loại.";
    return;
  }

  try {
    loading.value = true;
    errorMessage.value = "";
    result.value = null;

    const data = await predictGarbageImage(selectedFile.value);

    if (!data.success) {
      errorMessage.value = data.message || "Phân loại thất bại.";
      return;
    }

    result.value = data;
  } catch (error) {
    errorMessage.value = error.message || "Có lỗi xảy ra khi phân loại ảnh.";
  } finally {
    loading.value = false;
  }
}

function handleReset() {
  selectedFile.value = null;
  previewUrl.value = "";
  result.value = null;
  errorMessage.value = "";
}
</script>