
import { useUserStore } from './store/useUserStore';
import MainLayout from './components/MainLayout';
import AuthUser from './components/AuthUser';

function App() {
  const { userName } = useUserStore();

  if (!userName) {
    return <AuthUser />;
  }

  return <MainLayout />;
}

export default App;