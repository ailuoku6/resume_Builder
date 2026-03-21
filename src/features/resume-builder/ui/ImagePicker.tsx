import React from 'react';

interface ImagePickerProps {
  width: string;
  height: string;
  alt?: string;
  img: string | null;
  onChange: (value: string | null) => void;
}

export const ImagePicker: React.FC<ImagePickerProps> = ({
  width,
  height,
  alt,
  img,
  onChange,
}) => {
  const inputId = React.useMemo(() => {
    return `resume-avatar-${Math.random().toString(36).slice(2, 10)}`;
  }, []);

  return (
    <div className="image-picker-group">
      <div className="image-picker-frame" style={{ width, height }}>
        <input
          id={inputId}
          accept="image/*"
          type="file"
          className="image-picker-input"
          onChange={(event) => {
            const file = event.target.files?.[0];

            if (!file) {
              return;
            }

            const reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onload = (loadEvent) => {
              onChange((loadEvent.target?.result as string) ?? null);
            };
          }}
        />

        {img ? (
          <img className="image-picker-preview" src={img} alt={alt ?? ''} />
        ) : (
          <div className="image-picker-placeholder">
            <span className="image-picker-placeholder__title">上传照片</span>
            <span className="image-picker-placeholder__hint">点击选择图片</span>
          </div>
        )}
      </div>

      <div className="image-picker-actions">
        <label htmlFor={inputId} className="image-picker-button">
          {img ? '更换照片' : '选择照片'}
        </label>
        {img ? (
          <button
            type="button"
            className="image-picker-button image-picker-button--danger"
            onClick={() => {
              onChange(null);
            }}
          >
            移除
          </button>
        ) : null}
      </div>
    </div>
  );
};
