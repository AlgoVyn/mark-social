import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Workspace } from './components/Workspace';
import { PLATFORM_CONFIGS } from './utils/platforms';

// Generate routes for all supported platforms
const platformRoutes = Object.keys(PLATFORM_CONFIGS).map((platform) => (
  <Route key={platform} path={`/${platform}`} element={<Workspace initialPlatform={platform} />} />
));

function App() {
  return (
    <div className="app-container">
      <BrowserRouter basename="/markdown2social">
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
