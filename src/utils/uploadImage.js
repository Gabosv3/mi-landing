import { auth } from "../firebase/config";

const MAX_DIMENSION = 1400;
const JPEG_QUALITY = 0.78;

/* Redimensiona/comprime en el navegador antes de subir, para que la imagen
   quepa bajo el límite de tamaño del backend (las fotos de cámara/celular
   suelen pesar varios MB). SVG y GIF se dejan tal cual. */
async function compressImage(file) {
  if (file.type === "image/svg+xml" || file.type === "image/gif") return file;

  const bitmap = await createImageBitmap(file);
  let { width, height } = bitmap;
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  // JPEG no soporta transparencia: sin esto, las zonas transparentes de PNGs
  // (fondos, logos) salen negras en vez de blancas al convertir.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY));
  if (!blob) return file;
  return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" });
}

/* Sube un archivo a nuestro backend (server.js), autenticado con el token de Firebase Auth */
export async function uploadImage(file) {
  const token = await auth.currentUser.getIdToken();
  const compressed = await compressImage(file);

  const formData = new FormData();
  formData.append("file", compressed);

  const resp = await fetch("/api/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const json = await resp.json();
  if (!resp.ok) throw new Error(json.error || "Error al subir la imagen");
  return json.url;
}
