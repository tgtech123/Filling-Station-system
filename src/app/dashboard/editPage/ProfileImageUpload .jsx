'use client';

import { useState, useRef } from 'react';
import { Camera } from 'lucide-react';

const ProfileImageUpload = ({onImageChange}) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-6">
      {/* Profile Image Container */}
      <div className="relative">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg relative">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Profile preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
              <div className="text-gray-600 text-center">
                <Camera size={24} className="mx-auto mb-2" />
                <span className="text-xs">No Image</span>
              </div>
            </div>
          )}
        </div>

        {/* Camera Icon Overlay */}
        <button
          onClick={handleCameraClick}   
          className="absolute bottom-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-1"
        >
          <Camera size={16} className="text-white" />
        </button>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
      </div>

     
      {/* Image Info and Actions */}
            {selectedImage && (
            <div className="text-center">
                <button
                onClick={handleRemoveImage}
                className="text-red-500 hover:text-red-700 text-[10px] font-medium transition-colors"
                >
                Remove Image
                </button>
            </div>
            )}


      {/* Upload Instructions */}
      {!selectedImage && (
        <div className="text-center space-y-1">
          <p className="text-xs text-gray-400">PNG, JPG up to 10MB</p>
        </div>
      )}
    </div>
  );
};

export default ProfileImageUpload;
