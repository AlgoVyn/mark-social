import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Workspace } from './components';
import { PLATFORM_CONFIGS } from './utils';

// Get base path from Vite environment (removes trailing slash for React Router basename)
const BASENAME = import.meta.env.BASE_URL?.replace(/\/$/, '') || '/marksocial';

// Generate routes for all supported platforms
const platformRoutes = Object.keys(PLATFORM_CONFIGS).map((platform) => (
  <Route key={platform} path={`/${platform}`} element={<Workspace initialPlatform={platform} />} />
));

function App() {
  return (
    <div className="app-container">
      <BrowserRouter basename={BASENAME}>
        <Routes>
          {/* Default route - Generic SEO for home page */}
          <Route path="/" element={<Workspace initialPlatform="default" />} />

          {/* Platform-specific routes */}
          {platformRoutes}

          {/* Redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
