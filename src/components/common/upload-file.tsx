import React from 'react';
import { ImageUp, Upload } from 'lucide-react';

interface UploadFileProps {
    previewImage?: string;
    onFileChange: (file: File | null) => void;
    className?: string;
    avatarSize?: string;
    uploadIconSize?: string;
    title?: string;
    subtitle?: string;
    accept?: string;
    id?: string;
}

export default function UploadFile({
    previewImage = '',
    onFileChange,
    className = '',
    uploadIconSize = 'w-4 h-4',
    title = 'Click the upload icon to add a profile picture',
    subtitle = 'Recommended: Square image, max 5MB',
    accept = 'jpg, jpeg, png',
    id = 'file-upload'
}: UploadFileProps) {
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        onFileChange(file);
    };

    return (
        <div className={` border p-2 overflow-hidden border-dashed border-gray-200 rounded-xl flex flex-col items-center space-y-4 sticky top-4 ${className}`}>
            <div className="relative w-full">
                {previewImage ? <img
                    src={previewImage}
                    className="w-full rounded-md max-h-42"
                />: <div className="w-full h-42 bg-gray-200 flex items-center justify-center rounded-md">
                    <label
                    htmlFor={id}
                    className="h-full w-full flex justify-center items-center rounded-full p-2 cursor-pointer  transition-colors"
                >
                    <ImageUp size={30} className='text-primary' />
                </label>
                </div>}
                {previewImage && <label
                    htmlFor={id}
                    className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors"
                >
                    <Upload className={uploadIconSize} />
                </label>}
                <input
                    id={id}
                    type="file"
                    accept={accept}
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>
            <div className="text-center p-4">
                <p className="text-sm text-default-500 mb-2 mt-4">{title}</p>
                <p className="text-xs text-default-400">{subtitle}</p>
            </div>
        </div>
    );
}