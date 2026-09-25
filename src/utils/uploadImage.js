import { auth } from "../firebase/config";

/* Sube un archivo a nuestro backend (server.js), autenticado con el token de Firebase Auth */
export async function uploadImage(file) {
  const token = await auth.currentUser.getIdToken();
  const formData = new FormData();
  formData.append("file", file);

  const resp = await fetch("/api/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const json = await resp.json();
  if (!resp.ok) throw new Error(json.error || "Error al subir la imagen");
  return json.url;
}
