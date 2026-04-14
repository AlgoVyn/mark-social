/* eslint-disable react-refresh/only-export-components */
import { render as rtlRender } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useParams } from 'react-router-dom';
import { Workspace } from '../components/Workspace';

// Wrapper component that extracts platform from route params
const WorkspaceRoute = () => {
  const { platform } = useParams<{ platform?: string }>();
  return <Workspace initialPlatform={platform || 'default'} />;
};

interface RenderWithRouterOptions {
  route?: string;
}

// Custom render that wraps Workspace with Router
export function renderWithRouter({ route = '/' }: RenderWithRouterOptions = {}) {
  return {
    ...rtlRender(
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/" element={<Workspace initialPlatform="default" />} />
          <Route path=":platform" element={<WorkspaceRoute />} />
        </Routes>
      </MemoryRouter>
    ),
  };
}

// Re-export everything from testing-library
export * from '@testing-library/react';
