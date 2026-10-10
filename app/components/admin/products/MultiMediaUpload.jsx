// MultiMediaUpload.jsx
import React, { useRef, useState } from "react";
import {
  Package,
  Upload,
  Image as ImageIcon,
  Star,
  GripVertical,
  Trash2,
  AlertCircle,
  Play,
} from "lucide-react";

const MultiMediaUpload = ({
  images = [],
  videos = [],
  onMediaChange,
  onRemoveMedia,
  onSetPrimaryMedia,
  onReorderMedia,
  uploadingImages,
  uploadingVideos,
  errors,
  maxTotalSize = 40 * 1024 * 1024,
}) => {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [dragType, setDragType] = useState(null); // 'image' or 'video'
  const fileInputRef = useRef(null);

  const totalSize =
    images.reduce((sum, img) => sum + (img.size || 0), 0) +
    videos.reduce((sum, vid) => sum + (vid.size || 0), 0);
  const remainingSize = maxTotalSize - totalSize;

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    onMediaChange(files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    onMediaChange(files);
  };

  const handleDragStart = (e, index, isVideo) => {
    setDraggedIndex(index);
    setDragType(isVideo ? "video" : "image");
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index, isVideo) => {
    e.preventDefault();
    if (
      draggedIndex !== null &&
      dragType === (isVideo ? "video" : "image") &&
      draggedIndex !== index
    ) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && dragType) {
      onReorderMedia(draggedIndex, dragOverIndex, dragType === "video");
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
    setDragType(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Product Media (Images & Videos)
        </label>
        <div className="text-xs text-gray-500">
          {formatFileSize(totalSize)} / {formatFileSize(maxTotalSize)} used
        </div>
      </div>

      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="relative border-2 border-dashed border-gray-200 rounded-lg p-6 hover:border-pink-400 transition-colors cursor-pointer group"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-2">
          <div className="p-3 bg-pink-50 rounded-full group-hover:bg-pink-100 transition-colors">
            <Upload className="w-6 h-6 text-pink-600" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, WebP, MP4, WebM up to 10MB per file
            </p>
            <p className="text-xs text-gray-500">
              Remaining space: {formatFileSize(remainingSize)}
            </p>
          </div>
        </div>
      </div>

      {errors?.media && (
        <div className="bg-red-50 p-3 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errors.media}</span>
        </div>
      )}

      {(uploadingImages || uploadingVideos) && (
        <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
          <span>
            Uploading {uploadingImages ? "images" : ""}
            {uploadingImages && uploadingVideos ? " and " : ""}
            {uploadingVideos ? "videos" : ""}...
          </span>
        </div>
      )}

      {/* Images Section */}
      {images.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Images</p>
          <p className="text-xs text-gray-600">
            Drag images to reorder • Click star to set as primary
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={image.id || index}
                draggable
                onDragStart={(e) => handleDragStart(e, index, false)}
                onDragOver={(e) => handleDragOver(e, index, false)}
                onDragEnd={handleDragEnd}
                className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                  dragOverIndex === index && dragType === "image"
                    ? "border-pink-400 scale-105"
                    : "border-gray-200"
                } ${
                  draggedIndex === index && dragType === "image"
                    ? "opacity-50"
                    : ""
                } ${image.isPrimary ? "ring-2 ring-pink-500" : ""}`}
              >
                <div className="absolute top-2 left-2 z-10 bg-white/90 rounded p-1 cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="w-4 h-4 text-gray-600" />
                </div>
                {image.isPrimary && (
                  <div className="absolute top-2 right-2 z-10 bg-pink-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    Primary
                  </div>
                )}
                <div className="aspect-square bg-gray-100">
                  <img
                    src={image.preview || image.url}
                    alt={`Product ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {!image.isPrimary && (
                    <button
                      type="button"
                      onClick={() => onSetPrimaryMedia(index, false)}
                      className="p-2 bg-white rounded-full hover:bg-pink-50 transition-colors"
                      title="Set as primary"
                    >
                      <Star className="w-4 h-4 text-pink-600" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onRemoveMedia(index, false)}
                    className="p-2 bg-white rounded-full hover:bg-red-50 transition-colors"
                    title="Remove image"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {formatFileSize(image.size || 0)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Videos Section */}
      {videos.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Videos</p>
          <p className="text-xs text-gray-600">
            Drag videos to reorder • Click star to set as primary
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {videos.map((video, index) => (
              <div
                key={video.id || index}
                draggable
                onDragStart={(e) => handleDragStart(e, index, true)}
                onDragOver={(e) => handleDragOver(e, index, true)}
                onDragEnd={handleDragEnd}
                className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                  dragOverIndex === index && dragType === "video"
                    ? "border-pink-400 scale-105"
                    : "border-gray-200"
                } ${
                  draggedIndex === index && dragType === "video"
                    ? "opacity-50"
                    : ""
                } ${video.isPrimary ? "ring-2 ring-pink-500" : ""}`}
              >
                <div className="absolute top-2 left-2 z-10 bg-white/90 rounded p-1 cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="w-4 h-4 text-gray-600" />
                </div>
                {video.isPrimary && (
                  <div className="absolute top-2 right-2 z-10 bg-pink-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    Primary
                  </div>
                )}
                <div className="aspect-square bg-gray-100 relative">
                  <video
                    src={video.url}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    playsInline
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="w-12 h-12 text-white/80" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {!video.isPrimary && (
                    <button
                      type="button"
                      onClick={() => onSetPrimaryMedia(index, true)}
                      className="p-2 bg-white rounded-full hover:bg-pink-50 transition-colors"
                      title="Set as primary"
                    >
                      <Star className="w-4 h-4 text-pink-600" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onRemoveMedia(index, true)}
                    className="p-2 bg-white rounded-full hover:bg-red-50 transition-colors"
                    title="Remove video"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {formatFileSize(video.size || 0)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {images.length === 0 && videos.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No media uploaded yet</p>
        </div>
      )}
    </div>
  );
};

export default MultiMediaUpload;
