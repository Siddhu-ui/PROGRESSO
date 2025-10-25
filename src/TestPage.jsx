import React from 'react';

const TestPage = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>🚀 Daily Growth Tracker</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>
          App is loading successfully!
        </p>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '20px',
          borderRadius: '10px',
          backdropFilter: 'blur(10px)'
        }}>
          <p>✅ React is working</p>
          <p>✅ Components are loading</p>
          <p>✅ Styling is applied</p>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
