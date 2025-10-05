import React from 'react';

const ValueCallout = ({ label, value, position, color = '#3B82F6', bgColor="FFAF51" }) => {
  return (
    <div
      className="absolute bg-white border-2 border-dotted border-blue-700 rounded-lg px-3 py-2 shadow-lg z-10"
      style={{
        left: position?.x || '0px',
        top: position?.y || '0px',
        transform: 'translate(-50%, -100%)',
        marginTop: '-10px',
        backgroundColor: bgColor,
      }}
    >
      <div className="text-xs  text-gray-500 mb-1 " >{label}  </div>
      <div className=" text-lg font-semibold " style={{ color,  }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div
        className="flex gap-6 absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full"
        style={{
          width: 0,
          height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: `6px solid white ${bgColor}`, 
        }}
      />
    </div>
  );
};

export default ValueCallout;
