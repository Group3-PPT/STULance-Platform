import React, { useEffect, useState } from 'react';
import '../CSS/LoadingScreen.css';

const LoadingScreen = ({ onFinished }) => {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    // Giả lập quá trình nạp dữ liệu
    const interval = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onFinished, 250); // Đợi 0.5s sau khi 100% rồi mới đóng
          return 100;
        }
        return prev + 5;
      });
    }, 50); // Tốc độ chạy

    return () => clearInterval(interval);
  }, [onFinished]);

  return (
    <div className="loader-wrapper">
      <div className="loader-content">
        {/* Hiệu ứng Logo quét sáng */}
        <h1 className="loader-logo">
          STU<span>LANCE</span>
        </h1>
        
        {/* Thanh Progress Bar */}
        <div className="progress-container-loader">
          <div className="progress-fill" style={{ width: `${percent}%` }}></div>
        </div>

        {/* Số phần trăm chạy */}
        <div className="percent-text">
          SYSTEM INITIALIZING... <span>{percent}%</span>
        </div>

        {/* Các hạt nhỏ bay xung quanh (Decor) */}
        <div className="scan-line"></div>
      </div>
      
      {/* Hiệu ứng Grid nền */}
      <div className="bg-grid"></div>
    </div>
  );
};

export default LoadingScreen;