import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { isNativeApp } from "./platform";

type ImageSourcePreference = "camera" | "gallery" | "prompt";

export async function pickImage(
  source: ImageSourcePreference = "prompt"
): Promise<string> {
  if (isNativeApp()) {
    return pickImageNative(source);
  }
  return pickImageWeb();
}

async function pickImageNative(
  source: ImageSourcePreference
): Promise<string> {
  const cameraSource =
    source === "camera"
      ? CameraSource.Camera
      : source === "gallery"
        ? CameraSource.Photos
        : CameraSource.Prompt;

  const photo = await Camera.getPhoto({
    quality: 80,
    allowEditing: false,
    resultType: CameraResultType.Base64,
    source: cameraSource,
  });

  if (!photo.base64String) {
    throw new Error("No image data returned from camera");
  }

  return photo.base64String;
}

function pickImageWeb(): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.style.display = "none";

    input.addEventListener("change", () => {
      const file = input.files?.[0];
      if (!file) {
        document.body.removeChild(input);
        reject(new Error("No file selected"));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        document.body.removeChild(input);
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = () => {
        document.body.removeChild(input);
        reject(new Error("Failed to read file"));
      };
      reader.readAsDataURL(file);
    });

    document.body.appendChild(input);
    input.click();
  });
}
