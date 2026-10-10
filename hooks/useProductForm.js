import { useState, useCallback } from "react";

const MAX_TOTAL_SIZE = 40 * 1024 * 1024; // 40MB
const MAX_INDIVIDUAL_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 20 * 1024 * 1024; // 20MB for videos

export const useProductForm = (
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  supabase
) => {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    short_description: "",
    price: "",
    original_price: "",
    category_id: "",
    subcategory_id: "",
    stock: "",
    lengths: "",
    colors: "",
    textures: "",
    weight: "",
    origin_country: "Brazil",
    is_featured: false,
    is_new: false,
    is_sale: false,
    is_active: true,
    meta_title: "",
    meta_description: "",
  });

  const [errors, setErrors] = useState({});
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVideos, setUploadingVideos] = useState(false);

  const generateSlug = useCallback((name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      short_description: "",
      price: "",
      original_price: "",
      category_id: "",
      subcategory_id: "",
      stock: "",
      lengths: "",
      colors: "",
      textures: "",
      weight: "",
      origin_country: "Brazil",
      is_featured: false,
      is_new: false,
      is_sale: false,
      is_active: true,
      meta_title: "",
      meta_description: "",
    });
    setErrors({});
    setImages([]);
    setVideos([]);
  }, []);

  const formatFileSize = useCallback((bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = "Valid price is required";
    }

    if (!formData.stock || parseInt(formData.stock) < 0) {
      newErrors.stock = "Valid stock quantity is required";
    }

    if (!formData.category_id) {
      newErrors.category_id = "Category is required";
    }

    if (
      formData.original_price &&
      parseFloat(formData.original_price) <= parseFloat(formData.price)
    ) {
      newErrors.original_price =
        "Original price must be greater than current price";
    }

    if (formData.name.length > 100) {
      newErrors.name = "Product name must be 100 characters or less";
    }

    if (formData.slug && !/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug =
        "Slug can only contain lowercase letters, numbers, and hyphens";
    }

    // Validate media
    if (images.length === 0 && videos.length === 0) {
      newErrors.media = "At least one image or video is required";
    }

    const totalSize =
      images.reduce((sum, img) => sum + (img.size || 0), 0) +
      videos.reduce((sum, vid) => sum + (vid.size || 0), 0);

    if (totalSize > MAX_TOTAL_SIZE) {
      newErrors.media = `Total media size (${formatFileSize(
        totalSize
      )}) exceeds 40MB limit`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, images, videos, formatFileSize]);

  // Parse array field helper
  const parseArrayField = (value) => {
    if (typeof value === "string") {
      return value
        .split(",")
        .map((v) => v.trim())
        .filter((v) => v);
    }
    return Array.isArray(value) ? value : [];
  };

  // Upload single file to Supabase Storage with optimization
  const uploadFile = useCallback(
    async (file, folder, sortOrder) => {
      if (!supabase) throw new Error("Supabase client not available");

      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      // Upload with upsert option for better performance
      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(filePath);

      return {
        url: publicUrl,
        path: filePath,
        sortOrder,
        size: file.size,
      };
    },
    [supabase]
  );

  // Delete file from storage
  const deleteFile = useCallback(
    async (filePath) => {
      if (!supabase || !filePath) return;
      try {
        const path = filePath.includes("/")
          ? filePath.split("/").slice(-2).join("/")
          : filePath;

        await supabase.storage.from("product-images").remove([path]);
      } catch (error) {
        console.error("Error deleting file:", error);
      }
    },
    [supabase]
  );

  // Save product images to database
  const saveProductImages = useCallback(
    async (productId, uploadedFiles, fileMetadata, isVideo = false) => {
      if (!supabase) throw new Error("Supabase client not available");

      const records = uploadedFiles.map((uploaded, index) => {
        const metadata = fileMetadata[index];
        return {
          product_id: productId,
          image_url: uploaded.url,
          alt_text: `${formData.name} - ${isVideo ? "Video" : "Image"} ${
            index + 1
          }`,
          is_primary: metadata.isPrimary || false,
          sort_order: uploaded.sortOrder,
          file_size: uploaded.size,
          is_video: isVideo,
        };
      });

      const { data, error } = await supabase
        .from("product_images")
        .insert(records)
        .select();

      if (error) throw error;
      return data;
    },
    [supabase, formData.name]
  );

  // Handle media change (images and videos together)
  const handleMediaChange = useCallback(
    (newFiles) => {
      const totalCurrentSize =
        images.reduce((sum, img) => sum + (img.size || 0), 0) +
        videos.reduce((sum, vid) => sum + (vid.size || 0), 0);

      const validImages = [];
      const validVideos = [];
      let currentSize = totalCurrentSize;

      for (const file of newFiles) {
        const isVideo = file.type.startsWith("video/");
        const isImage = file.type.startsWith("image/");

        if (!isImage && !isVideo) {
          setErrors((prev) => ({
            ...prev,
            media: `${file.name} is not a valid image or video file`,
          }));
          continue;
        }

        // Check individual file size
        const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_INDIVIDUAL_SIZE;
        if (file.size > maxSize) {
          setErrors((prev) => ({
            ...prev,
            media: `${file.name} exceeds ${
              isVideo ? "20MB" : "10MB"
            } file size limit`,
          }));
          continue;
        }

        // Check total size
        if (currentSize + file.size > MAX_TOTAL_SIZE) {
          setErrors((prev) => ({
            ...prev,
            media: `Cannot add ${file.name}. Total size would exceed 40MB limit`,
          }));
          break;
        }

        currentSize += file.size;

        if (isVideo) {
          validVideos.push(file);
        } else {
          validImages.push(file);
        }
      }

      // Process valid images
      if (validImages.length > 0) {
        const newImages = validImages.map((file, index) => ({
          id: crypto.randomUUID(),
          file,
          preview: null,
          size: file.size,
          isPrimary: images.length === 0 && videos.length === 0 && index === 0,
          sortOrder: images.length + index,
        }));

        // Set previews asynchronously
        newImages.forEach((img, index) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            setImages((prev) =>
              prev.map((prevImg) =>
                prevImg.id === img.id
                  ? { ...prevImg, preview: e.target.result }
                  : prevImg
              )
            );
          };
          reader.readAsDataURL(validImages[index]);
        });

        setImages((prev) => [...prev, ...newImages]);
      }

      // Process valid videos
      if (validVideos.length > 0) {
        const newVideos = validVideos.map((file, index) => ({
          id: crypto.randomUUID(),
          file,
          url: URL.createObjectURL(file),
          size: file.size,
          isPrimary: images.length === 0 && videos.length === 0 && index === 0,
          sortOrder: videos.length + index,
        }));

        setVideos((prev) => [...prev, ...newVideos]);
      }

      if (validImages.length > 0 || validVideos.length > 0) {
        setErrors((prev) => ({ ...prev, media: "" }));
      }
    },
    [images, videos]
  );

  // Remove media (image or video)
  const handleRemoveMedia = useCallback(
    (index, isVideo) => {
      if (isVideo) {
        setVideos((prev) => {
          const newVideos = prev.filter((_, i) => i !== index);
          if (prev[index].isPrimary && newVideos.length > 0) {
            newVideos[0].isPrimary = true;
          } else if (prev[index].isPrimary && images.length > 0) {
            setImages((imgs) =>
              imgs.map((img, i) => ({ ...img, isPrimary: i === 0 }))
            );
          }
          return newVideos.map((vid, i) => ({ ...vid, sortOrder: i }));
        });
      } else {
        setImages((prev) => {
          const newImages = prev.filter((_, i) => i !== index);
          if (prev[index].isPrimary && newImages.length > 0) {
            newImages[0].isPrimary = true;
          } else if (prev[index].isPrimary && videos.length > 0) {
            setVideos((vids) =>
              vids.map((vid, i) => ({ ...vid, isPrimary: i === 0 }))
            );
          }
          return newImages.map((img, i) => ({ ...img, sortOrder: i }));
        });
      }
    },
    [images.length, videos.length]
  );

  // Set primary media
  const handleSetPrimaryMedia = useCallback((index, isVideo) => {
    if (isVideo) {
      setVideos((prev) =>
        prev.map((vid, i) => ({ ...vid, isPrimary: i === index }))
      );
      setImages((prev) => prev.map((img) => ({ ...img, isPrimary: false })));
    } else {
      setImages((prev) =>
        prev.map((img, i) => ({ ...img, isPrimary: i === index }))
      );
      setVideos((prev) => prev.map((vid) => ({ ...vid, isPrimary: false })));
    }
  }, []);

  // Reorder media
  const handleReorderMedia = useCallback((fromIndex, toIndex, isVideo) => {
    if (isVideo) {
      setVideos((prev) => {
        const newVideos = [...prev];
        const [moved] = newVideos.splice(fromIndex, 1);
        newVideos.splice(toIndex, 0, moved);
        return newVideos.map((vid, i) => ({ ...vid, sortOrder: i }));
      });
    } else {
      setImages((prev) => {
        const newImages = [...prev];
        const [moved] = newImages.splice(fromIndex, 1);
        newImages.splice(toIndex, 0, moved);
        return newImages.map((img, i) => ({ ...img, sortOrder: i }));
      });
    }
  }, []);

  const handleInputChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));

      if (name === "name") {
        setFormData((prev) => ({
          ...prev,
          slug: generateSlug(value),
        }));
      }

      setErrors((prev) => ({ ...prev, [name]: "" }));
    },
    [generateSlug]
  );

  const handleArrayInputChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e, selectedProduct, setProducts, closeModal) => {
      e.preventDefault();
      if (!validateForm()) {
        setErrors((prev) => ({
          ...prev,
          general: "Please fix the errors above before submitting",
        }));
        return;
      }

      setIsSubmitting(true);

      try {
        const productData = {
          ...formData,
          price: parseFloat(formData.price),
          original_price: formData.original_price
            ? parseFloat(formData.original_price)
            : null,
          stock: parseInt(formData.stock),
          category_id: formData.category_id || null, // THIS LINE
          subcategory_id: formData.subcategory_id || null,
          lengths: parseArrayField(formData.lengths),
          colors: parseArrayField(formData.colors),
          textures: parseArrayField(formData.textures),
        };

        if (selectedProduct) {
          // UPDATE EXISTING PRODUCT
          setUploadingImages(true);
          setUploadingVideos(true);

          try {
            // Update product data
            const { data: updatedProduct, error } = await supabase
              .from("products")
              .update(productData)
              .eq("id", selectedProduct.id)
              .select()
              .single();

            if (error) throw error;

            // Handle images and videos update
            const existingMedia = selectedProduct.images || [];

            // Delete removed media
            const existingUrls = existingMedia.map((m) => m.image_url);
            const newImageUrls = images
              .filter((img) => img.url)
              .map((img) => img.url);
            const newVideoUrls = videos
              .filter((vid) => vid.url)
              .map((vid) => vid.url);
            const allNewUrls = [...newImageUrls, ...newVideoUrls];

            const mediaToDelete = existingMedia.filter(
              (m) => !allNewUrls.includes(m.image_url)
            );

            if (mediaToDelete.length > 0) {
              for (const media of mediaToDelete) {
                await deleteFile(media.image_url);
              }
              const idsToDelete = mediaToDelete
                .map((m) => m.id)
                .filter(Boolean);
              if (idsToDelete.length > 0) {
                await supabase
                  .from("product_images")
                  .delete()
                  .in("id", idsToDelete);
              }
            }

            // Upload new images with better error handling
            const newImagesToUpload = images.filter((img) => img.file);
            if (newImagesToUpload.length > 0) {
              const uploadPromises = newImagesToUpload.map((img, idx) =>
                uploadFile(img.file, "products", img.sortOrder || idx).catch(
                  (err) => {
                    console.error(
                      `Failed to upload image ${img.file.name}:`,
                      err
                    );
                    throw new Error(`Failed to upload ${img.file.name}`);
                  }
                )
              );

              const uploadedImages = await Promise.allSettled(uploadPromises);
              const successfulUploads = uploadedImages
                .filter((result) => result.status === "fulfilled")
                .map((result) => result.value);

              if (successfulUploads.length > 0) {
                await saveProductImages(
                  selectedProduct.id,
                  successfulUploads,
                  newImagesToUpload.slice(0, successfulUploads.length),
                  false
                );
              }

              const failedCount = uploadedImages.filter(
                (r) => r.status === "rejected"
              ).length;
              if (failedCount > 0) {
                throw new Error(`${failedCount} image(s) failed to upload`);
              }
            }

            // Upload new videos with better error handling
            const newVideosToUpload = videos.filter((vid) => vid.file);
            if (newVideosToUpload.length > 0) {
              const uploadPromises = newVideosToUpload.map((vid, idx) =>
                uploadFile(vid.file, "videos", vid.sortOrder || idx).catch(
                  (err) => {
                    console.error(
                      `Failed to upload video ${vid.file.name}:`,
                      err
                    );
                    throw new Error(`Failed to upload ${vid.file.name}`);
                  }
                )
              );

              const uploadedVideos = await Promise.allSettled(uploadPromises);
              const successfulUploads = uploadedVideos
                .filter((result) => result.status === "fulfilled")
                .map((result) => result.value);

              if (successfulUploads.length > 0) {
                await saveProductImages(
                  selectedProduct.id,
                  successfulUploads,
                  newVideosToUpload.slice(0, successfulUploads.length),
                  true
                );
              }

              const failedCount = uploadedVideos.filter(
                (r) => r.status === "rejected"
              ).length;
              if (failedCount > 0) {
                throw new Error(`${failedCount} video(s) failed to upload`);
              }
            }

            // Update existing media metadata
            const mediaToUpdate = [
              ...images.filter((img) => img.id && !img.file),
              ...videos.filter((vid) => vid.id && !vid.file),
            ];

            for (const media of mediaToUpdate) {
              await supabase
                .from("product_images")
                .update({
                  is_primary: media.isPrimary || false,
                  sort_order: media.sortOrder,
                })
                .eq("id", media.id);
            }

            // Fetch updated media
            const { data: updatedMedia } = await supabase
              .from("product_images")
              .select("*")
              .eq("product_id", selectedProduct.id)
              .order("sort_order");

            const productWithMedia = {
              ...updatedProduct,
              images: updatedMedia || [],
            };

            await onUpdateProduct?.(productWithMedia);
            setProducts((prev) =>
              prev.map((p) =>
                p.id === selectedProduct.id ? productWithMedia : p
              )
            );
          } finally {
            setUploadingImages(false);
            setUploadingVideos(false);
          }
        } else {
          // CREATE NEW PRODUCT
          setUploadingImages(true);
          setUploadingVideos(true);

          try {
            const { data: newProduct, error: productError } = await supabase
              .from("products")
              .insert([productData])
              .select()
              .single();

            if (productError) throw productError;

            // Upload images
            const imagesToUpload = images.filter((img) => img.file);
            if (imagesToUpload.length > 0) {
              const uploadedImages = await Promise.all(
                imagesToUpload.map((img, idx) =>
                  uploadFile(img.file, "products", img.sortOrder || idx)
                )
              );
              await saveProductImages(
                newProduct.id,
                uploadedImages,
                images,
                false
              );
            }

            // Upload videos
            const videosToUpload = videos.filter((vid) => vid.file);
            if (videosToUpload.length > 0) {
              const uploadedVideos = await Promise.all(
                videosToUpload.map((vid, idx) =>
                  uploadFile(vid.file, "videos", vid.sortOrder || idx)
                )
              );
              await saveProductImages(
                newProduct.id,
                uploadedVideos,
                videos,
                true
              );
            }

            // Fetch saved media
            const { data: savedMedia } = await supabase
              .from("product_images")
              .select("*")
              .eq("product_id", newProduct.id)
              .order("sort_order");

            const productWithMedia = {
              ...newProduct,
              images: savedMedia || [],
            };

            await onAddProduct?.(productWithMedia);
            setProducts((prev) => [...prev, productWithMedia]);
          } finally {
            setUploadingImages(false);
            setUploadingVideos(false);
          }
        }

        resetForm();
        closeModal();
      } catch (error) {
        console.error("Error saving product:", error);
        setErrors((prev) => ({
          ...prev,
          general: error.message || "Failed to save product. Please try again.",
        }));
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      formData,
      images,
      videos,
      validateForm,
      uploadFile,
      saveProductImages,
      deleteFile,
      parseArrayField,
      onAddProduct,
      onUpdateProduct,
      resetForm,
      supabase,
    ]
  );

  const handleDelete = useCallback(
    async (product, setProducts, closeModal) => {
      try {
        if (product.images && product.images.length > 0) {
          for (const media of product.images) {
            await deleteFile(media.image_url);
          }
        }

        await onDeleteProduct?.(product.id);
        setProducts((prev) => prev.filter((p) => p.id !== product.id));
        closeModal();
        resetForm();
      } catch (error) {
        console.error("Error deleting product:", error);
        setErrors((prev) => ({
          ...prev,
          general: "Failed to delete product. Please try again.",
        }));
      }
    },
    [deleteFile, onDeleteProduct, resetForm]
  );

  const populateForm = useCallback(
    async (product) => {
      setFormData({
        name: product.name || "",
        slug: product.slug || "",
        description: product.description || "",
        short_description: product.short_description || "",
        price: product.price?.toString() || "",
        original_price: product.original_price?.toString() || "",
        category_id: product.category_id || "",
        subcategory_id: product.subcategory_id || "",
        stock: product.stock?.toString() || "",
        lengths: Array.isArray(product.lengths)
          ? product.lengths.join(", ")
          : "",
        colors: Array.isArray(product.colors) ? product.colors.join(", ") : "",
        textures: Array.isArray(product.textures)
          ? product.textures.join(", ")
          : "",
        weight: product.weight || "",
        origin_country: product.origin_country || "Brazil",
        is_featured: product.is_featured || false,
        is_new: product.is_new || false,
        is_sale: product.is_sale || false,
        is_active: product.is_active !== false,
        meta_title: product.meta_title || "",
        meta_description: product.meta_description || "",
      });

      if (supabase && product.id) {
        const { data: existingMedia } = await supabase
          .from("product_images")
          .select("*")
          .eq("product_id", product.id)
          .order("sort_order");

        if (existingMedia && existingMedia.length > 0) {
          const imageData = existingMedia
            .filter((m) => !m.is_video)
            .map((img, index) => ({
              id: img.id,
              url: img.image_url,
              preview: img.image_url,
              isPrimary: img.is_primary,
              sortOrder: img.sort_order || index,
              size: img.file_size || 0,
            }));

          const videoData = existingMedia
            .filter((m) => m.is_video)
            .map((vid, index) => ({
              id: vid.id,
              url: vid.image_url,
              isPrimary: vid.is_primary,
              sortOrder: vid.sort_order || index,
              size: vid.file_size || 0,
            }));

          setImages(imageData);
          setVideos(videoData);
        }
      }
    },
    [supabase]
  );

  return {
    formData,
    errors,
    images,
    videos,
    isSubmitting,
    uploadingImages,
    uploadingVideos,
    handleInputChange,
    handleArrayInputChange,
    handleMediaChange,
    handleRemoveMedia,
    handleSetPrimaryMedia,
    handleReorderMedia,
    handleSubmit,
    handleDelete,
    populateForm,
    resetForm,
  };
};
