import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Link,
  Navigate,
} from 'react-router-dom';
import { LanguageSelect } from './components/LanguageSelect';
import { TypingTest } from './components/TypingTest';
import { Results } from './components/Results';
import { Profile } from './components/Profile';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { CompetitionPage } from './pages/CompetitionPage';
import { CompetitionTestPage } from './pages/CompetitionTestPage';
import { CompetitionResultsPage } from './pages/CompetitionResultsPage';
import { AdminPage } from './pages/AdminPage';
import { saveResult } from './storage';
import { getCurrentUser, logout, type User } from './auth';
import { initTheme, getStoredTheme, type ThemeId } from './theme';
import type { LanguageId } from './types';
import type { TypingResult } from './types';
import faviconUrl from '@/assets/favicon.svg';
import './App.scss';

const DURATION_OPTIONS = [15, 30, 60, 90, 120, 180] as const;

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<ThemeId>(() => getStoredTheme());
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, [pathname]);

  useEffect(() => {
    setTheme(initTheme());
  }, []);

  const handleLoginSuccess = () => {
    setCurrentUser(getCurrentUser());
    navigate('/', { replace: true });
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    navigate('/', { replace: true });
  };

  const isHomeActive =
    pathname === '/' || pathname === '/test' || pathname === '/results';
  const isCompetitionActive =
    pathname === '/competition' ||
    pathname === '/competition-test' ||
    pathname === '/competition-results';
  const isAdminActive = pathname === '/admin';

  const [navPortalTarget, setNavPortalTarget] = useState<HTMLDivElement | null>(
    null,
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  useEffect(() => {
    const el = document.createElement('div');
    el.id = 'app-sticky-nav';
    el.className = 'app__header-nav';
    document.body.prepend(el);
    setNavPortalTarget(el);
    return () => el.remove();
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const stickyNav = navPortalTarget
    ? createPortal(
        <nav className='app__nav'>
          <div className='app__nav-top'>
            <Link
              to='/'
              className='app__nav-logo'
              aria-label='WeShowSpeed Home'
            >
              <img src={faviconUrl} alt='' width={28} height={28} />
            </Link>
            <button
              type='button'
              className='app__nav-burger'
              onClick={() => setIsMenuOpen((v) => !v)}
              aria-expanded={isMenuOpen}
              aria-label='Menu'
            >
              <span className='app__nav-burger-bar' />
              <span className='app__nav-burger-bar' />
              <span className='app__nav-burger-bar' />
            </button>
          </div>
          <div
            className={`app__nav-center ${isMenuOpen ? 'app__nav-center--open' : ''}`}
          >
            <Link
              to='/'
              className={`app__nav-link ${isHomeActive ? 'app__nav-link--active' : ''}`}
            >
              Home
            </Link>
            <Link
              to='/competition'
              className={`app__nav-link ${isCompetitionActive ? 'app__nav-link--active' : ''}`}
            >
              Competition
            </Link>
            {currentUser ? (
              <>
                <Link
                  to='/profile'
                  className={`app__nav-link ${pathname === '/profile' ? 'app__nav-link--active' : ''}`}
                >
                  Account
                </Link>
                {currentUser.role === 'staff' && (
                  <Link
                    to='/admin'
                    className={`app__nav-link ${isAdminActive ? 'app__nav-link--active' : ''}`}
                  >
                    Admin
                  </Link>
                )}
                <button
                  type='button'
                  className='app__nav-link app__nav-link--logout'
                  onClick={handleLogout}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to='/login'
                  className={`app__nav-link ${pathname === '/login' ? 'app__nav-link--active' : ''}`}
                >
                  Log in
                </Link>
                <Link
                  to='/register'
                  className={`app__nav-link ${pathname === '/register' ? 'app__nav-link--active' : ''}`}
                >
                  Sign up
                </Link>
              </>
            )}
            <ThemeSwitcher value={theme} onChange={setTheme} />
          </div>
        </nav>,
        navPortalTarget,
      )
    : null;

  return (
    <>
      {stickyNav}
      <div className='app'>
        {pathname === '/' && (
          <header className='app__header'>
            <h1 className='app__title'>
              <Link to='/'>WeShowSpeed</Link>
            </h1>
            <p className='app__subtitle'>Typing speed competition</p>
          </header>
        )}

        <main className='app__main'>
          <Routes>
            <Route path='/' element={<HomePage />} />
            <Route path='/test' element={<TestPage />} />
            <Route path='/results' element={<ResultsPage />} />
            <Route path='/competition' element={<CompetitionPage />} />
            <Route path='/competition-test' element={<CompetitionTestPage />} />
            <Route path='/competition-results' element={<CompetitionResultsPage />} />
            <Route path='/profile' element={<Profile user={currentUser} />} />
            <Route path='/admin' element={<AdminPage />} />
            <Route
              path='/login'
              element={
                <Login
                  onSuccess={handleLoginSuccess}
                  onSwitchToRegister={() => navigate('/register')}
                />
              }
            />
            <Route
              path='/register'
              element={
                <Register
                  onSuccess={handleLoginSuccess}
                  onSwitchToLogin={() => navigate('/login')}
                />
              }
            />
            <Route path='*' element={<Navigate to='/' replace />} />
          </Routes>
        </main>

        <footer className='app__footer'>
          Choose a language and duration, then type the text. Finish before time
          runs out or complete the full passage.
        </footer>
      </div>
    </>
  );
}

function HomePage() {
  const [languageId, setLanguageId] = useState<LanguageId>('en');
  const [durationSec, setDurationSec] = useState<number>(60);
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/test', { state: { languageId, durationSec } });
  };

  return (
    <div className='home'>
      <LanguageSelect value={languageId} onChange={setLanguageId} />
      <div className='home__duration'>
        <span className='home__duration-label'>Duration:</span>
        <div className='home__duration-options'>
          {DURATION_OPTIONS.map((sec) => (
            <button
              key={sec}
              type='button'
              className={`home__duration-btn ${durationSec === sec ? 'home__duration-btn--active' : ''}`}
              onClick={() => setDurationSec(sec)}
            >
              {sec} sec
            </button>
          ))}
        </div>
      </div>
      <button type='button' className='home__start' onClick={handleStart}>
        Start test ({durationSec} sec)
      </button>
    </div>
  );
}

function TestPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as {
    languageId?: LanguageId;
    durationSec?: number;
  } | null;
  const languageId = state?.languageId ?? 'en';
  const durationSec = state?.durationSec ?? 60;

  const handleFinish = (result: TypingResult) => {
    saveResult(result);
    navigate('/results', { state: { result }, replace: true });
  };

  return (
    <TypingTest
      languageId={languageId}
      durationSec={durationSec}
      onFinish={handleFinish}
    />
  );
}

function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = (location.state as { result?: TypingResult } | null)?.result;

  if (!result) {
    return <Navigate to='/' replace />;
  }

  return <Results result={result} onRestart={() => navigate('/')} />;
}

export default App;
