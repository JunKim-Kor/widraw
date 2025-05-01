import { useNavigate } from 'react-router-dom';

function MainPage() {
  const navigate = useNavigate();

  const goToChoose = () => {
    navigate('/choose');
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>🎨 Widraw</h1>
      <button onClick={goToChoose} style={{ padding: '12px 24px', fontSize: '18px' }}>
        시작하기
      </button>
    </div>
  );
}

export default MainPage;
