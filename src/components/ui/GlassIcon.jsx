import React from 'react';
import Icon from './Icon';

const GlassIcon = ({ icon, color = 'rgba(255, 255, 255, 0.1)', size = 'md', className = '' }) => {
  const sizeMap = {
    sm: { container: 'w-8 h-8', iconSize: 14 },
    md: { container: 'w-12 h-12', iconSize: 20 },
    lg: { container: 'w-16 h-16', iconSize: 28 },
  };

  return (
    <div 
      className={`${sizeMap[size].container} ${className} rounded-full flex items-center justify-center backdrop-blur-lg`}
      style={{
        background: `linear-gradient(135deg, ${color}20, ${color}40)`,
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
      }}
    >
      <Icon 
        name={icon} 
        size={sizeMap[size].iconSize} 
        color={color} 
      />
    </div>
  );
};

export default GlassIcon;
