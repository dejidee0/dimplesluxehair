// src/components/admin/products/hooks/useImageUpload.js

import { useState } from "react";
import { IMAGE_UPLOAD } from "../utils/constants";

export const useImageUpload = (supabase) => {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState("");

  const uploadImage = async (file) => {
    if (!supabase) {
      throw new Error("Supabase client not provided");
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;
    const filePath = `${IMAGE_UPLOAD.FOLDER_PATH}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(IMAGE_UPLOAD.BUCKET_NAME)
      .upload(filePath, file);

    if (error) {
      throw error;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(IMAGE_UPLOAD.BUCKET_NAME).getPublicUrl(filePath);

    return publicUrl;
  };

  const deleteImage = async (imageUrl) => {
    if (!supabase || !imageUrl) return;

    try {
      const urlParts = imageUrl.split("/");
      const filePath = urlParts.slice(-2).join("/");

      await supabase.storage.from(IMAGE_UPLOAD.BUCKET_NAME).remove([filePath]);
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  const handleImageChange = (file) => {
    if (!file) return;

    // Validate file type
    if (!IMAGE_UPLOAD.ALLOWED_TYPES.includes(file.type)) {
      setImageError("Please select a valid image file (JPEG, PNG, or WebP)");
      return;
    }

    // Validate file size
    if (file.size > IMAGE_UPLOAD.MAX_SIZE) {
      setImageError("Image size must be less than 5MB");
      return;
    }

    setImageFile(file);
    setImageError("");

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageError("");
  };

  const resetImageState = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageError("");
    setUploadingImage(false);
  };

  const processImageUpload = async (existingImageUrl = null) => {
    if (!imageFile) return existingImageUrl;

    setUploadingImage(true);
    try {
      const newImageUrl = await uploadImage(imageFile);

      // Delete old image if exists and is different
      if (existingImageUrl && existingImageUrl !== newImageUrl) {
        await deleteImage(existingImageUrl);
      }

      return newImageUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      setImageError("Failed to upload image. Please try again.");
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  return {
    imageFile,
    imagePreview,
    uploadingImage,
    imageError,
    setImagePreview,
    handleImageChange,
    removeImage,
    resetImageState,
    processImageUpload,
    deleteImage,
  };
};
