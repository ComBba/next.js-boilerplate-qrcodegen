// pages/index.js
import { useState } from 'react';
import Image from 'next/image';

export default function Home() {
  const [url, setUrl] = useState('');
  const [filename, setFilename] = useState('');

  const generateQR = async () => {
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const { filename } = await res.json();
      setFilename(filename);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <div className="p-6 bg-white border-2 border-gray-300 rounded-md shadow-md">
        <h2 className="mb-4 text-2xl">QR Code Generator</h2>
        <input
          className="p-2 mb-2 border-2 border-gray-300 rounded-md"
          type="text"
          placeholder="Enter URL here"
          value={url}
          onChange={e => setUrl(e.target.value)}
        />
        <button
          className="p-2 bg-blue-500 text-white rounded-md"
          onClick={generateQR}
        >
          Generate
        </button>
        {filename && (
          <div className="mt-4">
            <Image src={filename} alt="Generated QR Code" width={200} height={200} />
          </div>
        )}
      </div>
    </div>
  );
}
