// pages/index.js
import { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import Image from 'next/image';

export default function Home() {
  const [url, setUrl] = useState('');
  const [filename, setFilename] = useState('');
  const [history, setHistory] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const columns = [
    {
      name: 'URL',
      selector: 'url',
      sortable: true,
      cell: row => <a href={row.url} target="_blank" rel="noreferrer">{row.url}</a>,
      width: '450px',
      //grow: 2,  // This makes the URL column wider
    },
    {
      name: 'QR Code',
      cell: row => <Image src={row.filename} alt="Generated QR Code" width={50} height={50} />,  // Reduced image size
    },
  ];

  const generateQR = async () => {
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const { filename } = await res.json();
      setFilename(filename);
      await fetchHistory();
    } catch (err) {
      console.error(err);
    }
  }

  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/history?page=${page}&pageSize=${pageSize}`);
      const data = await res.json();
      setHistory(data.qrHistory);
      setTotalRows(data.total);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    const loadData = async () => {
      await fetchHistory();
    };

    loadData();
  }, [page, pageSize]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <div className="p-6 bg-white border-2 border-gray-300 rounded-md shadow-md dark:bg-gray-800 dark:text-white">
        <h2 className="mb-4 text-2xl">QR Code Generator</h2>
        <input
          className="p-2 mb-2 border-2 border-gray-300 rounded-md dark:bg-gray-700 dark:text-white"
          type="text"
          placeholder="Enter URL here"
          value={url}
          onChange={e => setUrl(e.target.value)}
        />
        <button
          className="p-2 bg-blue-500 text-white rounded-md dark:bg-yellow-500 dark:text-black"
          onClick={generateQR}
        >
          Generate
        </button>
        {filename && (
          <div className="mt-4">
            <Image src={filename} alt="Generated QR Code" width={200} height={200} />
          </div>
        )}
        <h2 className="mt-4 mb-2 text-xl">History</h2>
        <DataTable
          columns={columns}
          data={history}
          pagination
          //responsive
          defaultSortField="url"
          paginationServer
          paginationPerPage={pageSize}
          paginationTotalRows={totalRows}
          onChangePage={page => setPage(page)}
          onChangeRowsPerPage={(currentRowsPerPage, currentPage) => {
            setPageSize(currentRowsPerPage);
            setPage(currentPage);
          }}
        />
      </div>
    </div>
  );
}
