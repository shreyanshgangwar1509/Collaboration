import React from 'react';

function Client({username}) {
  const name = username || "Shrey"
  return (
    <div className="d-flex align-items-center mb-3">
      <img src={'https://res.cloudinary.com/djikufwbv/image/upload/v1737971195/iewd9ruqrnybdifwkiu7.png'} size={50} round="14px" className="mr-3" />
      <span className='w-full'>{name.toString()}</span>
    </div>
  );
}

export default Client;