import { auth } from "../firebase/config";

const MAX_DIMENSION = 1400;
const JPEG_QUALITY = 0.78;

/* Redimensiona/comprime en el navegador antes de subir, para que la imagen
   quepa bajo el límite de tamaño del backend (las fotos de cámara/celular
   suelen pesar varios MB). SVG y GIF se dejan tal cual. Los PNG se mantienen
   como PNG (conservan transparencia real); solo el JPEG se re-comprime,
   ya que ese formato no tiene canal alfa que se pueda perder. */
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
  canvas.getContext("2d").drawImage(bitmap, 0, 0, width, height);

  const isPng = file.type === "image/png";
  const mime = isPng ? "image/png" : "image/jpeg";
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, mime, isPng ? undefined : JPEG_QUALITY));
  if (!blob) return file;
  const ext = isPng ? ".png" : ".jpg";
  return new File([blob], file.name.replace(/\.\w+$/, ext), { type: mime });
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
