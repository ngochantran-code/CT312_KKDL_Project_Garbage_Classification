const API_BASE_URL = "http://localhost:3001";

export async function predictGarbageImage(file) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${API_BASE_URL}/api/garbage/predict`, {
    method: "POST",
    body: formData,
  });

  const text = await response.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch (error) {
    console.error("Server trả về không phải JSON:", text);

    throw new Error(
      "Backend không trả về JSON. Kiểm tra backend có chạy ở http://localhost:3001 và có route /api/waste/predict chưa."
    );
  }

  if (!response.ok) {
    throw new Error(data.message || "Không thể phân loại ảnh.");
  }

  return data;
}