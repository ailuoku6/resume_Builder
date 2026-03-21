import React from 'react';
import {
  AppBar,
  Container,
  Fab,
  IconButton,
  Paper,
  Toolbar,
  Typography,
} from '@material-ui/core';
import DoneIcon from '@material-ui/icons/Done';
import EditIcon from '@material-ui/icons/Edit';
import MenuIcon from '@material-ui/icons/Menu';
import SaveIcon from '@material-ui/icons/Save';
import { PDFViewer } from '@react-pdf/renderer';
import { observer } from 'kisstate';

import { resumeStore } from '@/entities/resume/model/resume-store';
import GeneratedResumeDocument from '@/features/resume-preview/ui/GeneratedResumeDocument';

import { AddSectionDrawer } from './AddSectionDrawer';
import { BaseInfoForm } from './BaseInfoForm';
import { ResumeIdentityCard } from './ResumeIdentityCard';
import { SectionListEditor } from './SectionListEditor';
import './ResumeBuilderPage.css';

const ResumeBuilderPageBase: React.FC = () => {
  const fabColor = '#3388ff';

  return (
    <React.Fragment>
      <div style={{ display: resumeStore.open ? 'flex' : 'block' }}>
        <AppBar
          position="fixed"
          style={{ width: resumeStore.open ? 'calc(100% - 240px)' : '100%' }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={() => {
                resumeStore.toggleDrawer();
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap>
              简历制作
            </Typography>
          </Toolbar>
        </AppBar>

        <AddSectionDrawer store={resumeStore} />

        <Container className="resume-container">
          {resumeStore.edit ? (
            <React.Fragment>
              <BaseInfoForm store={resumeStore} />

              <Paper elevation={3} square className="resume-paper">
                <ResumeIdentityCard store={resumeStore} />
                <SectionListEditor store={resumeStore} />
              </Paper>
            </React.Fragment>
          ) : (
            <PDFViewer className="pdf-viewer">
              <GeneratedResumeDocument data={resumeStore.resumeData} />
            </PDFViewer>
          )}
        </Container>
      </div>

      <Fab
        color="inherit"
        aria-label="切换编辑"
        size="small"
        style={{
          position: 'fixed',
          right: 30,
          bottom: 30,
          backgroundColor: fabColor,
        }}
        onClick={() => {
          resumeStore.toggleEdit();
        }}
      >
        {resumeStore.edit ? (
          <DoneIcon style={{ color: '#fff' }} />
        ) : (
          <EditIcon style={{ color: '#fff' }} />
        )}
      </Fab>

      <Fab
        color="inherit"
        aria-label="保存"
        size="small"
        style={{
          position: 'fixed',
          right: 30,
          bottom: 80,
          backgroundColor: fabColor,
        }}
        onClick={() => {
          resumeStore.saveToStorage();
        }}
      >
        <SaveIcon style={{ color: '#fff' }} />
      </Fab>
    </React.Fragment>
  );
};

export const ResumeBuilderPage = observer(ResumeBuilderPageBase);
