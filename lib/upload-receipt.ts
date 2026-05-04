"use client";
import { storage } from "./firebase-client";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

/** Compress ảnh xuống max 1200px, quality 0.75 trước khi upload */
function compressImage(file: File, maxPx = 1200, quality = 0.75): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxPx || height > maxPx) {
        if (width > height) {
          height = Math.round((height * maxPx) / width);
          width = maxPx;
        } else {
          width = Math.round((width * maxPx) / height);
          height = maxPx;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas context unavailable"));
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Compression failed"))),
        "image/jpeg",
        quality
      );
    };
    img.onerror = reject;
    img.src = url;
  });
}

export async function uploadReceipt(
  file: File,
  userId: string,
  onProgress?: (pct: number) => void
): Promise<string> {
  // Compress trước khi upload
  let uploadBlob: Blob;
  try {
    uploadBlob = await compressImage(file);
  } catch {
    // Nếu compress lỗi thì dùng file gốc
    uploadBlob = file;
  }

  return new Promise((resolve, reject) => {
    const path = `receipts/${userId}/${Date.now()}.jpg`;
    const storageRef = ref(storage, path);
    const task = uploadBytesResumable(storageRef, uploadBlob, {
      contentType: "image/jpeg",
    });

    task.on(
      "state_changed",
      (snap) => {
        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        onProgress?.(pct);
      },
      (err) => reject(err),
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve(url);
      }
    );
  });
}
