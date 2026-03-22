import React from 'react';

type ImeInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange'
> & {
  value: string;
  onValueChange: (value: string) => void;
};

type ImeTextareaProps = Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'value' | 'onChange'
> & {
  value: string;
  onValueChange: (value: string) => void;
};

const useImeValue = (value: string, onValueChange: (value: string) => void) => {
  const [draftValue, setDraftValue] = React.useState(value);
  const [isComposing, setIsComposing] = React.useState(false);

  React.useEffect(() => {
    if (isComposing) {
      return;
    }

    setDraftValue(value);
  }, [isComposing, value]);

  const handleCompositionStart = React.useCallback(() => {
    setIsComposing(true);
  }, []);

  const handleCompositionEnd = React.useCallback(
    (nextValue: string) => {
      setIsComposing(false);
      setDraftValue(nextValue);
      onValueChange(nextValue);
    },
    [onValueChange],
  );

  const handleChange = React.useCallback(
    (nextValue: string, composing: boolean) => {
      setDraftValue(nextValue);

      if (composing || isComposing) {
        return;
      }

      onValueChange(nextValue);
    },
    [isComposing, onValueChange],
  );

  const handleBlur = React.useCallback(() => {
    if (draftValue !== value) {
      onValueChange(draftValue);
    }
  }, [draftValue, onValueChange, value]);

  return {
    draftValue,
    handleBlur,
    handleChange,
    handleCompositionEnd,
    handleCompositionStart,
  };
};

const isNativeComposing = (event: { isComposing?: boolean }): boolean => {
  return event.isComposing === true;
};

export const ImeInput: React.FC<ImeInputProps> = ({ value, onValueChange, onBlur, ...props }) => {
  const { draftValue, handleBlur, handleChange, handleCompositionEnd, handleCompositionStart } =
    useImeValue(value, onValueChange);

  return (
    <input
      {...props}
      value={draftValue}
      onBlur={(event) => {
        handleBlur();
        onBlur?.(event);
      }}
      onChange={(event) => {
        handleChange(
          event.target.value,
          isNativeComposing(event.nativeEvent as { isComposing?: boolean }),
        );
      }}
      onCompositionStart={() => {
        handleCompositionStart();
      }}
      onCompositionEnd={(event) => {
        handleCompositionEnd(event.currentTarget.value);
      }}
    />
  );
};

export const ImeTextarea: React.FC<ImeTextareaProps> = ({
  value,
  onValueChange,
  onBlur,
  ...props
}) => {
  const { draftValue, handleBlur, handleChange, handleCompositionEnd, handleCompositionStart } =
    useImeValue(value, onValueChange);

  return (
    <textarea
      {...props}
      value={draftValue}
      onBlur={(event) => {
        handleBlur();
        onBlur?.(event);
      }}
      onChange={(event) => {
        handleChange(
          event.target.value,
          isNativeComposing(event.nativeEvent as { isComposing?: boolean }),
        );
      }}
      onCompositionStart={() => {
        handleCompositionStart();
      }}
      onCompositionEnd={(event) => {
        handleCompositionEnd(event.currentTarget.value);
      }}
    />
  );
};
