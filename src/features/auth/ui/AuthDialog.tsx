import React from 'react';
import CloseIcon from '@material-ui/icons/Close';
import { observer } from 'kisstate';

import { authStore } from '@/entities/auth/model/auth-store';
import { loginWithEmail, signUpWithEmail } from '@/shared/api/auth';

type AuthMode = 'login' | 'signup';

const emailPattern = /\S+@\S+\.\S+/;

const AuthDialogBase: React.FC = () => {
  const [mode, setMode] = React.useState<AuthMode>('login');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [errorText, setErrorText] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!authStore.authDialogOpen) {
      setErrorText('');
      setPassword('');
      setConfirmPassword('');
    }
  }, [authStore.authDialogOpen]);

  if (!authStore.authDialogOpen) {
    return null;
  }

  const handleSubmit = async (): Promise<void> => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!emailPattern.test(normalizedEmail)) {
      setErrorText('请输入有效邮箱地址。');
      return;
    }

    if (password.trim().length < 8) {
      setErrorText('密码至少需要 8 位。');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setErrorText('两次输入的密码不一致。');
      return;
    }

    setIsSubmitting(true);
    setErrorText('');

    try {
      const session =
        mode === 'login'
          ? await loginWithEmail(normalizedEmail, password)
          : await signUpWithEmail(normalizedEmail, password);

      authStore.setSession(session.token, session.user);
      authStore.closeAuthDialog();
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : '登录失败，请稍后重试。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="auth-dialog-backdrop"
      onClick={() => {
        authStore.closeAuthDialog();
      }}
    >
      <div
        className="auth-dialog"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <div className="auth-dialog__header">
          <div>
            <p className="auth-dialog__eyebrow">Cloud Account</p>
            <h2 className="auth-dialog__title">登录后开启云端草稿</h2>
          </div>

          <button
            type="button"
            className="auth-dialog__close"
            onClick={() => {
              authStore.closeAuthDialog();
            }}
            aria-label="关闭登录弹层"
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>

        <p className="auth-dialog__copy">云端简历会按用户隔离保存，并在 D1 中以加密形式存储。</p>

        <div className="auth-dialog__tabs">
          <button
            type="button"
            className={`auth-dialog__tab${mode === 'login' ? ' auth-dialog__tab--active' : ''}`}
            onClick={() => {
              setMode('login');
              setErrorText('');
            }}
          >
            登录
          </button>
          <button
            type="button"
            className={`auth-dialog__tab${mode === 'signup' ? ' auth-dialog__tab--active' : ''}`}
            onClick={() => {
              setMode('signup');
              setErrorText('');
            }}
          >
            注册
          </button>
        </div>

        <label className="editor-field auth-dialog__field">
          <span className="editor-field__label">邮箱</span>
          <input
            className="editor-input"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
            }}
          />
        </label>

        <label className="editor-field auth-dialog__field">
          <span className="editor-field__label">密码</span>
          <input
            className="editor-input"
            type="password"
            placeholder="至少 8 位"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
            }}
          />
        </label>

        {mode === 'signup' ? (
          <label className="editor-field auth-dialog__field">
            <span className="editor-field__label">确认密码</span>
            <input
              className="editor-input"
              type="password"
              placeholder="再次输入密码"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
              }}
            />
          </label>
        ) : null}

        {errorText ? <p className="auth-dialog__error">{errorText}</p> : null}

        <button
          type="button"
          className="topbar-button topbar-button--primary auth-dialog__submit"
          onClick={() => {
            void handleSubmit();
          }}
          disabled={isSubmitting}
        >
          {isSubmitting ? '提交中...' : mode === 'login' ? '登录并继续' : '注册并继续'}
        </button>
      </div>
    </div>
  );
};

export const AuthDialog = observer(AuthDialogBase);
