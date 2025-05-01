import { useLocation, useNavigate } from 'react-router-dom';

function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const imageDataUrl = location.state?.imageDataUrl;
  const topic = location.state?.topic;

  return (
    <div style={{ textAlign: 'center', marginTop: '60px' }}>
      <h2>완성된 그림: "{topic}"</h2>
      {imageDataUrl && (
        <img
          src={imageDataUrl}
          alt="완성된 그림"
          style={{ border: '2px solid #333', marginTop: '20px', maxWidth: '90%' }}
        />
      )}
      <br /><br />
      <button
        onClick={() => navigate('/')}
        style={{ padding: '10px 20px', fontSize: '16px' }}
      >
        처음으로 돌아가기
      </button>
    </div>
  );
}

export default ResultPage;
