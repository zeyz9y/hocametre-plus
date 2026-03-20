import { Platform } from "react-native";

const CLOUDINARY_CLOUD_NAME = "didqpjsyq";
const CLOUDINARY_UPLOAD_PRESET = "hocametre_uploads";
const CLOUDINARY_FOLDER = "hocametre/notes";
const CLOUDINARY_PROFILE_FOLDER = "hocametre/profiles";

interface CloudinaryUploadOptions {
  folder?: string;
  resourceType?: "image" | "raw" | "video" | "auto";
  mimeType?: string;
  fileName?: string;
  fileExtension?: string;
}

export const uploadToCloudinary = async (
  uri: string,
  fileName: string,
  username: string,
  options?: CloudinaryUploadOptions
): Promise<{ secure_url: string; public_id: string }> => {
  try {
    const formattedFileName = `${username}_${fileName.replace(
      /[^a-zA-Z0-9]/g,
      "_"
    )}`;

    const {
      folder = CLOUDINARY_FOLDER,
      resourceType = "auto",
      mimeType = "application/pdf",
      fileExtension = ".pdf",
    } = options || {};

    const formData = new FormData();
    formData.append("file", {
      uri: Platform.OS === "ios" ? uri.replace("file://", "") : uri,
      type: mimeType,
      name: `${formattedFileName}${fileExtension}`,
    } as any);

    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", folder);
    formData.append("public_id", formattedFileName);
    formData.append("tags", username);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
      {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Cloudinary upload failed: ${errorData}`);
    }

    const data = await response.json();
    return {
      secure_url: data.secure_url,
      public_id: data.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};

export const uploadProfilePictureToCloudinary = async (
  uri: string,
  userId: string
): Promise<{ secure_url: string; public_id: string }> => {
  try {
    const timestamp = new Date().getTime();
    return await uploadToCloudinary(
      uri,
      `profile_${userId}_${timestamp}`,
      userId,
      {
        folder: CLOUDINARY_PROFILE_FOLDER,
        resourceType: "image",
        mimeType: "image/jpeg",
        fileExtension: ".jpg",
      }
    );
  } catch (error) {
    console.error("Profile picture upload error:", error);
    throw error;
  }
};

export const formatPdfViewUrl = (url: string): string => {
  return url.replace("/upload/", "/upload/fl_attachment/");
};

export const generatePdfThumbnail = (
  publicId: string,
  page: number = 1
): string => {
  if (!publicId) return "";

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/pg_${page}/w_300,h_400,c_fill,f_jpg,q_auto/${publicId}.jpg`;
};
