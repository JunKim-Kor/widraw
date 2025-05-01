import { Routes, Route, Navigate } from 'react-router-dom';
import MainPage from './pages/MainPage';
import ChooseTopicPage from './pages/ChooseTopicPage';
import DrawPage from './pages/DrawPage';
import ResultPage from './pages/ResultPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/choose" element={<ChooseTopicPage />} />
      <Route path="/draw/:roomId" element={<DrawPage />} />
      <Route path="/result" element={<ResultPage />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
