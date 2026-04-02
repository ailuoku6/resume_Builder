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

type EditableElement = HTMLInputElement | HTMLTextAreaElement;

type EditableSelection = {
  start: number;
  end: number;
  direction?: 'forward' | 'backward' | 'none';
};

type PendingSelection = EditableSelection & {
  expectedValue: string;
};

const readSelection = (element: EditableElement): EditableSelection | null => {
  if (typeof element.selectionStart !== 'number' || typeof element.selectionEnd !== 'number') {
    return null;
  }

  return {
    start: element.selectionStart,
    end: element.selectionEnd,
    direction: element.selectionDirection ?? undefined,
  };
};

const useImeValue = (value: string, onValueChange: (value: string) => void) => {
  const [draftValue, setDraftValue] = React.useState(value);
  const [isComposing, setIsComposing] = React.useState(false);
  const elementRef = React.useRef<EditableElement | null>(null);
  const pendingSelectionRef = React.useRef<PendingSelection | null>(null);
  const compositionCommitRef = React.useRef<string | null>(null);

  const rememberSelection = React.useCallback((element: EditableElement, nextValue: string) => {
    const selection = readSelection(element);

    if (!selection) {
      pendingSelectionRef.current = null;
      return;
    }

    pendingSelectionRef.current = {
      ...selection,
      expectedValue: nextValue,
    };
  }, []);

  React.useLayoutEffect(() => {
    // React rewrites the controlled value after IME commits, so we restore the caret explicitly.
    if (isComposing || typeof document === 'undefined') {
      return;
    }

    const element = elementRef.current;
    const selection = pendingSelectionRef.current;

    if (!element || !selection || document.activeElement !== element) {
      return;
    }

    try {
      element.setSelectionRange(selection.start, selection.end, selection.direction);
    } catch (error) {
      pendingSelectionRef.current = null;
      return;
    }

    if (value === selection.expectedValue) {
      pendingSelectionRef.current = null;
    }
  }, [draftValue, isComposing, value]);

  React.useEffect(() => {
    if (isComposing) {
      return;
    }

    setDraftValue(value);
  }, [value]);

  const handleCompositionStart = React.useCallback(() => {
    pendingSelectionRef.current = null;
    compositionCommitRef.current = null;
    setIsComposing(true);
  }, []);

  const handleCompositionEnd = React.useCallback(
    (nextValue: string, element: EditableElement) => {
      rememberSelection(element, nextValue);
      compositionCommitRef.current = nextValue;
      setIsComposing(false);
      setDraftValue(nextValue);
      onValueChange(nextValue);
    },
    [onValueChange, rememberSelection],
  );

  const handleChange = React.useCallback(
    (nextValue: string, composing: boolean, element: EditableElement) => {
      const isCompositionCommitEcho = compositionCommitRef.current === nextValue;

      if (!isCompositionCommitEcho && compositionCommitRef.current !== null) {
        compositionCommitRef.current = null;
      }

      if (!composing && !isComposing) {
        if (!isCompositionCommitEcho) {
          rememberSelection(element, nextValue);
        }
      }

      setDraftValue(nextValue);

      if (composing || isComposing || isCompositionCommitEcho) {
        return;
      }

      onValueChange(nextValue);
    },
    [isComposing, onValueChange, rememberSelection],
  );

  const handleBlur = React.useCallback(() => {
    pendingSelectionRef.current = null;
    compositionCommitRef.current = null;

    if (draftValue !== value) {
      onValueChange(draftValue);
    }
  }, [draftValue, onValueChange, value]);

  return {
    draftValue,
    elementRef,
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
  const {
    draftValue,
    elementRef,
    handleBlur,
    handleChange,
    handleCompositionEnd,
    handleCompositionStart,
  } = useImeValue(value, onValueChange);

  return (
    <input
      {...props}
      ref={elementRef as React.RefObject<HTMLInputElement>}
      value={draftValue}
      onBlur={(event) => {
        handleBlur();
        onBlur?.(event);
      }}
      onChange={(event) => {
        handleChange(
          event.target.value,
          isNativeComposing(event.nativeEvent as { isComposing?: boolean }),
          event.currentTarget,
        );
      }}
      onCompositionStart={() => {
        handleCompositionStart();
      }}
      onCompositionEnd={(event) => {
        handleCompositionEnd(event.currentTarget.value, event.currentTarget);
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
  const {
    draftValue,
    elementRef,
    handleBlur,
    handleChange,
    handleCompositionEnd,
    handleCompositionStart,
  } = useImeValue(value, onValueChange);

  return (
    <textarea
      {...props}
      ref={elementRef as React.RefObject<HTMLTextAreaElement>}
      value={draftValue}
      onBlur={(event) => {
        handleBlur();
        onBlur?.(event);
      }}
      onChange={(event) => {
        handleChange(
          event.target.value,
          isNativeComposing(event.nativeEvent as { isComposing?: boolean }),
          event.currentTarget,
        );
      }}
      onCompositionStart={() => {
        handleCompositionStart();
      }}
      onCompositionEnd={(event) => {
        handleCompositionEnd(event.currentTarget.value, event.currentTarget);
      }}
    />
  );
};
