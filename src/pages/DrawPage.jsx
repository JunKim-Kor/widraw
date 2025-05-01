import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

function DrawPage() {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const topic = location.state?.topic || 'Untitled';

  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const socketRef = useRef(null);

  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(5);
  const [tool, setTool] = useState('pen');
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState([]);
  const [showLineWidth, setShowLineWidth] = useState(false);
  const [sliderY, setSliderY] = useState(140);
  const [isDragging, setIsDragging] = useState(false);
  const [prevPoint, setPrevPoint] = useState(null);

  const sliderCanvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = 360;
    canvas.height = 500;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctxRef.current = ctx;
    saveSnapshot();
  }, []);

  useEffect(() => {
    socketRef.current = io('https://widraw.onrender.com');

    socketRef.current.emit('join-room', roomId || 'default');

    socketRef.current.on('drawing', (data) => {
      const ctx = ctxRef.current;
      if (!ctx) return;

      const { x0, y0, x1, y1, color, width } = data;
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [roomId]);

  useEffect(() => {
    if (showLineWidth) drawSliderCanvas();
  }, [showLineWidth, color]);

  const drawSliderCanvas = () => {
    const canvas = sliderCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < canvas.height; y++) {
      const ratio = 1 - y / canvas.height;
      const currentWidth = 2 + 18 * ratio;
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = currentWidth;
      ctx.moveTo(canvas.width / 2, y);
      ctx.lineTo(canvas.width / 2, y + 1);
      ctx.stroke();
    }
  };

  const updateContext = () => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    if (tool === 'eraser') {
      ctx.strokeStyle = '#ffffff';
      ctx.globalAlpha = 1.0;
      ctx.lineWidth = 20;
    } else {
      ctx.strokeStyle = color;
      ctx.globalAlpha = tool === 'highlighter' ? 0.3 : 1.0;
      ctx.lineWidth = tool === 'highlighter' ? lineWidth * 3 : lineWidth;
    }
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    updateContext();
    const { offsetX, offsetY } = e.nativeEvent;
    const ctx = ctxRef.current;
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    setPrevPoint({ x: offsetX, y: offsetY });
  };

  const draw = (e) => {
    if (!isDrawing || !prevPoint) return;
    const { offsetX, offsetY } = e.nativeEvent;
    const ctx = ctxRef.current;
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();

    socketRef.current.emit('drawing', {
      roomId: roomId || 'default',
      data: {
        x0: prevPoint.x,
        y0: prevPoint.y,
        x1: offsetX,
        y1: offsetY,
        color,
        width: lineWidth,
      },
    });

    setPrevPoint({ x: offsetX, y: offsetY });
  };

  const endDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setPrevPoint(null);
    saveSnapshot();
  };

  const saveSnapshot = () => {
    const canvas = canvasRef.current;
    setHistory((prev) => [...prev, canvas.toDataURL()]);
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const newHistory = [...history];
    newHistory.pop();
    drawSnapshot(newHistory[newHistory.length - 1]);
    setHistory(newHistory);
  };

  const drawSnapshot = (snapshot) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = snapshot;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  const selectTool = (toolName) => {
    setTool(toolName);
    setTimeout(updateContext, 0);
  };

  const handleLineWidthChange = (e) => {
    const sliderHeight = 150;
    const bounding = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - bounding.top;
    const clampedY = Math.max(0, Math.min(sliderHeight, offsetY));
    const ratio = clampedY / sliderHeight;
    const newWidth = 2 + (20 - 2) * (1 - ratio);

    setLineWidth(newWidth);
    setSliderY(clampedY);

    const ctx = ctxRef.current;
    ctx.lineWidth = tool === 'highlighter' ? newWidth * 3 : newWidth;
  };

  const finishDrawing = () => {
    saveSnapshot();
    navigate('/result', { state: { topic, imageDataUrl: history[history.length - 1] } });
  };

  const copyLinkToClipboard = () => {
    const currentUrl = `${window.location.origin}/draw/${roomId || 'default'}`;
    navigator.clipboard.writeText(currentUrl);
    alert('링크가 복사되었습니다!');
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '20px', position: 'relative' }}>
      <h2>Drawing Topic: "{topic}"</h2>

      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
        style={{ border: '2px solid #333', backgroundColor: '#fff', marginTop: '20px' }}
      />

      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
        {[
          { name: 'pen', icon: '✏️' },
          { name: 'highlighter', icon: '🖍️' },
          { name: 'eraser', icon: '🧹' }
        ].map(({ name, icon }) => (
          <button
            key={name}
            onClick={() => selectTool(name)}
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#fff',
              border: tool === name ? '2px solid blue' : '1px solid #ccc',
              borderRadius: '8px',
              fontSize: '22px',
            }}
          >
            {icon}
          </button>
        ))}

        <label style={{ width: '40px', height: '40px', backgroundColor: color, borderRadius: '50%', border: '2px solid black', cursor: 'pointer' }}>
          <input
            type="color"
            value={color}
            onChange={(e) => { setColor(e.target.value); setTimeout(updateContext, 0); }}
            style={{ opacity: 0, width: '100%', height: '100%' }}
          />
        </label>

        <div
          onClick={() => setShowLineWidth((prev) => !prev)}
          style={{
            width: '40px',
            height: '40px',
            backgroundColor: '#fff',
            border: '1px solid gray',
            borderRadius: '8px',
            fontSize: '20px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer'
          }}
        >🧵</div>

        <button onClick={handleUndo} style={{ width: '40px', height: '40px' }}>↩️</button>
      </div>

      <div style={{ marginTop: '16px' }}>
        <button
          onClick={finishDrawing}
          style={{
            padding: '10px 20px',
            fontSize: '18px',
            backgroundColor: '#4285F4',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          ✅ Finish Drawing
        </button>
      </div>

      <div style={{ marginTop: '12px' }}>
        <button
          onClick={copyLinkToClipboard}
          style={{
            padding: '8px 16px',
            fontSize: '16px',
            backgroundColor: '#555',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          🔗 친구에게 그림 링크 공유하기
        </button>
      </div>

      {showLineWidth && (
        <div
          onMouseDown={handleLineWidthChange}
          onMouseMove={isDragging ? handleLineWidthChange : undefined}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          style={{
            position: 'absolute',
            bottom: '80px',
            left: 'calc(50% + 56px)',
            transform: 'translateX(-50%)',
            width: '30px',
            height: '150px',
            backgroundColor: '#fff',
            borderRadius: '15px',
            border: '1px solid #ccc',
            overflow: 'hidden',
          }}
        >
          <canvas
            ref={sliderCanvasRef}
            width={30}
            height={150}
            style={{ pointerEvents: 'none' }}
          />
          <div
            style={{
              position: 'absolute',
              top: `${sliderY - 7}px`,
              width: '14px',
              height: '14px',
              backgroundColor: 'white',
              border: '2px solid black',
              borderRadius: '50%',
            }}
          />
        </div>
      )}
    </div>
  );
}

export default DrawPage;
