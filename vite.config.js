import react from '@vitejs/plugin-react'
import fs from 'fs';

const isCodeSandbox = 'SANDBOX_URL' in process.env || 'CODESANDBOX_HOST' in process.env

const cert = fs.readFileSync('localhost.pem');
const key = fs.readFileSync('localhost-key.pem');

export default {
    plugins:
    [
        react()
    ],
    root: 'src/',
    publicDir: "../public/",
    base: './',
    server: {
        host: true,
        open: !isCodeSandbox, // Open if it's not a CodeSandbox
        https: {
          key,
          cert,
        },
      },
    build:
    {
        outDir: '../dist',
        emptyOutDir: true,
        sourcemap: true
    }
}