import React from 'react';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';

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
  return (
    <div
      style={{
        width,
        height,
        backgroundColor: '#F0F0F0',
        borderColor: '#C8C8C8',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <img
        style={{ width, height, zIndex: 0, position: 'absolute' }}
        src={img ?? undefined}
        alt={alt ?? ''}
      />

      <input
        accept="image/*"
        type="file"
        style={{
          zIndex: 2,
          width,
          height,
          opacity: 0,
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          position: 'absolute',
        }}
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
        <Fab
          size="small"
          style={{ zIndex: 3 }}
          color="secondary"
          aria-label="删除头像"
          onClick={() => {
            onChange(null);
          }}
        >
          <DeleteIcon />
        </Fab>
      ) : (
        <Fab size="small" style={{ zIndex: 1 }} color="primary" aria-label="上传头像">
          <AddIcon />
        </Fab>
      )}
    </div>
  );
};
