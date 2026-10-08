import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Providers
import { ThemeProvider } from './context/ThemeContext.jsx';
import { I18nProvider } from './context/I18nContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { AppProvider } from './context/AppContext.jsx';

// Layouts
import { PublicLayout } from './layouts/PublicLayout.jsx';
import { AppLayout } from './layouts/AppLayout.jsx';

// Pages
import { LandingPage } from './pages/LandingPage.jsx';
import { ToolsPage } from './pages/ToolsPage.jsx';
import { PhotoPage } from './pages/PhotoPage.jsx';
import { SignaturePage } from './pages/SignaturePage.jsx';
import { DocumentPage } from './pages/DocumentPage.jsx';
import { PdfPage } from './pages/PdfPage.jsx';
import { PresetsPage } from './pages/PresetsPage.jsx';
import { HistoryPage } from './pages/HistoryPage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';
import { HelpPage } from './pages/HelpPage.jsx';
import { PrivacyPage } from './pages/PrivacyPage.jsx';
import { TermsPage, NotFoundPage } from './pages/TermsPage.jsx';

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <ToastProvider>
          <AppProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Website Routes */}
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>

                {/* Workspace Application Studio Routes */}
                <Route element={<AppLayout />}>
                  <Route path="/app" element={<Navigate to="/tools" replace />} />
                  <Route path="/tools" element={<ToolsPage />} />
                  <Route path="/photo" element={<PhotoPage />} />
                  <Route path="/photo/prepare" element={<PhotoPage />} />
                  <Route path="/photo/result" element={<PhotoPage />} />
                  <Route path="/signature" element={<SignaturePage />} />
                  <Route path="/signature/prepare" element={<SignaturePage />} />
                  <Route path="/document" element={<DocumentPage />} />
                  <Route path="/document/scan" element={<DocumentPage />} />
                  <Route path="/pdf" element={<PdfPage />} />
                  <Route path="/pdf/tools" element={<PdfPage />} />
                  <Route path="/presets" element={<PresetsPage />} />
                  <Route path="/history" element={<HistoryPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/help" element={<HelpPage />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </AppProvider>
        </ToastProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
