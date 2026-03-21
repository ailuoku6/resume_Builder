import React from 'react';
import { Drawer, IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { observer } from 'kisstate';

import { authStore } from '@/entities/auth/model/auth-store';
import { changePassword, updateProfile } from '@/shared/api/auth';

interface AccountDrawerProps {
  onLogout: () => void;
}

const AccountDrawerBase: React.FC<AccountDrawerProps> = ({ onLogout }) => {
  const [displayName, setDisplayName] = React.useState(authStore.user?.displayName ?? '');
  const [profileStatus, setProfileStatus] = React.useState('');
  const [passwordStatus, setPasswordStatus] = React.useState('');
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [nextPassword, setNextPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);
  const [isSavingPassword, setIsSavingPassword] = React.useState(false);

  React.useEffect(() => {
    setDisplayName(authStore.user?.displayName ?? '');
  }, [authStore.user?.displayName, authStore.accountDrawerOpen]);

  const user = authStore.user;

  if (!user) {
    return null;
  }

  const handleProfileSave = async (): Promise<void> => {
    const trimmedName = displayName.trim();

    if (!trimmedName) {
      setProfileStatus('请输入显示名称。');
      return;
    }

    setIsSavingProfile(true);
    setProfileStatus('');

    try {
      const nextUser = await updateProfile(trimmedName);
      authStore.setSession(authStore.token as string, nextUser);
      setProfileStatus('资料已更新。');
    } catch (error) {
      setProfileStatus(error instanceof Error ? error.message : '更新资料失败。');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSave = async (): Promise<void> => {
    if (!currentPassword.trim()) {
      setPasswordStatus('请输入当前密码。');
      return;
    }

    if (nextPassword.trim().length < 8) {
      setPasswordStatus('新密码至少需要 8 位。');
      return;
    }

    if (nextPassword !== confirmPassword) {
      setPasswordStatus('两次输入的新密码不一致。');
      return;
    }

    setIsSavingPassword(true);
    setPasswordStatus('');

    try {
      await changePassword(currentPassword, nextPassword);
      setCurrentPassword('');
      setNextPassword('');
      setConfirmPassword('');
      setPasswordStatus('密码已更新。');
    } catch (error) {
      setPasswordStatus(error instanceof Error ? error.message : '修改密码失败。');
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={authStore.accountDrawerOpen}
      onClose={() => {
        authStore.closeAccountDrawer();
      }}
      ModalProps={{ keepMounted: true }}
      PaperProps={{ className: 'account-drawer-paper' }}
    >
      <div className="account-drawer">
        <div className="account-drawer__header">
          <div>
            <p className="template-drawer__eyebrow">Profile</p>
            <h2 className="template-drawer__title">用户个人资料</h2>
          </div>

          <IconButton
            aria-label="关闭账户抽屉"
            onClick={() => {
              authStore.closeAccountDrawer();
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>

        <div className="account-drawer__section">
          <label className="editor-field">
            <span className="editor-field__label">显示名称</span>
            <input
              className="editor-input"
              value={displayName}
              onChange={(event) => {
                setDisplayName(event.target.value);
              }}
            />
          </label>

          <div className="account-drawer__meta">
            <span>邮箱：{user.email}</span>
            <span>
              注册时间：
              {new Date(user.createdAt).toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          {profileStatus ? <p className="account-drawer__status">{profileStatus}</p> : null}

          <button
            type="button"
            className="section-list-button section-list-button--primary account-drawer__button"
            onClick={() => {
              void handleProfileSave();
            }}
            disabled={isSavingProfile}
          >
            {isSavingProfile ? '保存中...' : '保存资料'}
          </button>
        </div>

        <div className="account-drawer__section">
          <h3 className="account-drawer__section-title">修改密码</h3>

          <label className="editor-field">
            <span className="editor-field__label">当前密码</span>
            <input
              className="editor-input"
              type="password"
              value={currentPassword}
              onChange={(event) => {
                setCurrentPassword(event.target.value);
              }}
            />
          </label>

          <label className="editor-field">
            <span className="editor-field__label">新密码</span>
            <input
              className="editor-input"
              type="password"
              value={nextPassword}
              onChange={(event) => {
                setNextPassword(event.target.value);
              }}
            />
          </label>

          <label className="editor-field">
            <span className="editor-field__label">确认新密码</span>
            <input
              className="editor-input"
              type="password"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
              }}
            />
          </label>

          {passwordStatus ? <p className="account-drawer__status">{passwordStatus}</p> : null}

          <button
            type="button"
            className="section-list-button section-list-button--primary account-drawer__button"
            onClick={() => {
              void handlePasswordSave();
            }}
            disabled={isSavingPassword}
          >
            {isSavingPassword ? '提交中...' : '更新密码'}
          </button>
        </div>

        <button
          type="button"
          className="section-list-button section-list-button--secondary account-drawer__logout"
          onClick={onLogout}
        >
          退出登录
        </button>
      </div>
    </Drawer>
  );
};

export const AccountDrawer = observer(AccountDrawerBase);
