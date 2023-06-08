import { useState, useEffect, useCallback } from 'react';
import DataTable from 'react-data-table-component';
import Image from 'next/image';
import { Transition } from '@headlessui/react';

const isValidURL = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

export default function Home() {
  const [url, setUrl] = useState('');
  const [filename, setFilename] = useState('');
  const [history, setHistory] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [dialogInfo, setDialogInfo] = useState({ url: null, filename: null });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageClick = (url, imageSrc) => {
    setDialogInfo({ url, filename: imageSrc });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
  };

  const columns = [
    {
      name: 'URL',
      selector: row => row['url'],
      sortable: true,
      cell: row => <a href={row.url} target="_blank" rel="noreferrer">{row.url}</a>,
      width: '450px',
    },
    {
      name: 'QR Code',
      cell: row => (
        <div>
          <button onClick={() => handleImageClick(row.url, row.filename)}>
            <Image src={row.filename} alt="Generated QR Code" width={50} height={50} />
          </button>
        </div>
      ),
    },
  ];

  const generateQR = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    if (isValidURL(url)) {
      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });
        if (!res.ok) {
          setErrorMessage('Error generating QR code');
          return;
        }
        const { filename } = await res.json();
        setFilename(filename);
        await fetchHistory();
      } catch (err) {
        console.error(err);
        setErrorMessage('Error generating QR code');
      }
    } else {
      setErrorMessage('Invalid URL');
    }
    setIsLoading(false);
  }

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/history?page=${page}&pageSize=${pageSize}`);
      if (!res.ok) {
        setErrorMessage('Error fetching history');
        return;
      }
      const data = await res.json();
      setHistory(data.qrHistory);
      setTotalRows(data.total);
    } catch (err) {
      console.error(err);
      setErrorMessage('Error fetching history');
    }
    setIsLoading(false);
  }, [page, pageSize]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <div className="p-6 bg-white border-2 border-gray-300 rounded-md shadow-md dark:bg-gray-800 dark:text-white">
        <h2 className="mb-4 text-2xl">QR Code Generator</h2>
        <input
          className="w-full p-2 mb-4 border-2 border-gray-300 rounded-md outline-none dark:border-gray-600 dark:bg-gray-700"
          type="text"
          placeholder="Enter URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          className="w-full p-2 mb-4 text-white bg-blue-500 rounded-md dark:bg-blue-400"
          onClick={generateQR}
        >
          Generate QR Code
        </button>
        {isLoading && (
          <div className="mt-4">
            Loading...
          </div>
        )}
        {errorMessage && (
          <div className="mt-4 text-red-500">
            {errorMessage}
          </div>
        )}
        <DataTable
          title="Generated QR Code History"
          columns={columns}
          data={history}
          progressPending={isLoading}
          pagination
          paginationServer
          onChangePage={setPage}
          onChangeRowsPerPage={setPageSize}
          paginationTotalRows={totalRows}
        />
      </div>
      {dialogOpen && (
        <Transition appear show={dialogOpen} as="div" className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow-xl">
            <div className="flex justify-end">
              <button onClick={closeDialog}>x</button>
            </div>
            <div className="mt-4">
              <h2>URL: {dialogInfo.url}</h2>
              <Image src={dialogInfo.filename} alt="Generated QR Code" width={200} height={200} />
            </div>
          </div>
        </Transition>
      )}
    </div>
  );
}