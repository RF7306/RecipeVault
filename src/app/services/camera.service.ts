import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

@Injectable({ providedIn: 'root' })
export class CameraService {
  async capturePhoto(): Promise<string | null> {
    try {
      if (Capacitor.isNativePlatform()) {
        await Camera.requestPermissions();
      }

      const photo: Photo = await Camera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
        width: 800,
        height: 800
      });

      return photo.dataUrl ?? null;
    } catch {
      return null;
    }
  }

  async pickFromGallery(): Promise<string | null> {
    try {
      const photo: Photo = await Camera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
        width: 800,
        height: 800
      });

      return photo.dataUrl ?? null;
    } catch {
      return null;
    }
  }
}
