import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './routes/ProtectedRoute.js';
import { AppLayout } from './components/layout/AppLayout.js';

// Public Pages
import { LandingPage } from './pages/LandingPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';

// Protected Pages
import { DashboardPage } from './pages/DashboardPage.js';
import { ProjectsPage } from './pages/ProjectsPage.js';
import { NewResearchPage } from './pages/NewResearchPage.js';
import { ResearchWorkspacePage } from './pages/ResearchWorkspacePage.js';
import { SourcesPage } from './pages/SourcesPage.js';
import { EvidencePage } from './pages/EvidencePage.js';
import { ComparisonPage } from './pages/ComparisonPage.js';
import { GapsPage } from './pages/GapsPage.js';
import { KnowledgeGraphPage } from './pages/KnowledgeGraphPage.js';
import { CopilotPage } from './pages/CopilotPage.js';
import { ReportsPage } from './pages/ReportsPage.js';
import { DocumentsPage } from './pages/DocumentsPage.js';
import { HistoryPage } from './pages/HistoryPage.js';
import { SettingsPage } from './pages/SettingsPage.js';

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/research/new" element={<NewResearchPage />} />

          {/* Investigation Workspace with Tabs */}
          <Route path="/research/:id" element={<ResearchWorkspacePage />}>
            <Route index element={<Navigate to="sources" replace />} />
            <Route path="sources" element={<SourcesPage />} />
            <Route path="evidence" element={<EvidencePage />} />
            <Route path="comparison" element={<ComparisonPage />} />
            <Route path="gaps" element={<GapsPage />} />
            <Route path="map" element={<KnowledgeGraphPage />} />
            <Route path="copilot" element={<CopilotPage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>

          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

