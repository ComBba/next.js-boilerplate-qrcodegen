# QR Code Generator

This is a web application that takes a URL from the user and generates a QR code. The user enters a URL and clicks the 'Generate' button, and a QR code for that URL is generated and displayed. This QR code is stored in the `public/images` directory, and the corresponding URL and QR code image filename are stored in MongoDB. If a request is made for an already generated URL, the previously generated QR code image is returned.



## Environment Setup

1. You must have Node.js (v12 or later) and npm installed.

2. This project uses MongoDB, so MongoDB must be installed.

3. Create a `.env.local` file in the project root and set the following environment variables:
    ```js
    MONGODB_URI=mongodb://localhost:27017/mydatabase
    DB_COLLECTION=qrcodes
    ```
    - `MONGODB_URI`: The MongoDB connection string. If MongoDB is running locally, you can use the above value (`mongodb://localhost:27017/mydatabase`). If you are using a remote MongoDB, use the corresponding connection string.
    - `DB_COLLECTION`: The name of the collection in MongoDB.



## How to Run

1. In the project root, run the following command to install dependencies:
    ```bash
    npm install
    ```

2. Run the following command to start the development server:
    ```bash
    npm run dev
    ```

3. Open http://localhost:3000 in your browser and try generating a QR code.



## How to Test

This project is tested using Jest. To run the tests, execute the following command in the project root:
    ```bash
    npm run test
    ```
