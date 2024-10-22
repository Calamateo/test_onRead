const readFile = require('./fileReader');
const { Blob } = require('blob-polyfill');

describe('readFile', () => {
    let mockFileReader;

    beforeEach(() => {
        // Mock del FileReader con las propiedades necesarias
        mockFileReader = {
            readAsText: jest.fn(),
            onload: null,
            onerror: null,
            result: null,
            EMPTY: 0,
            LOADING: 1,
            DONE: 2
        };

        // Simula el constructor de FileReader
        global.FileReader = jest.fn(() => mockFileReader);
    });

    it('should resolve with file content on load', async () => {
        const mockFile = new Blob(['file content'], { type: 'text/plain' });

        // Llamada a la función que estamos probando
        const promise = readFile(mockFile);

        // Simulamos el evento onload
        mockFileReader.onload({ target: { result: 'file content' } });

        await expect(promise).resolves.toBe('file content');
    });

    it('should reject with error on error', async () => {
        const mockFile = new Blob(['file content'], { type: 'text/plain' });

        // Llamada a la función que estamos probando
        const promise = readFile(mockFile);

        // Simulamos el evento onerror
        const mockError = new Error('error');
        mockFileReader.onerror(mockError);

        await expect(promise).rejects.toThrow('error');
    });

    it('should resolve with file content when file is large', async () => {
        const mockFileReader = {
            readAsText: jest.fn(),
            onload: null,
            onerror: null,
            result: null,
            EMPTY: 0,
            LOADING: 1,
            DONE: 2
        };

        global.FileReader = jest.fn(() => mockFileReader);

        const largeContent = 'a'.repeat(1024 * 1024); // 1MB de contenido
        const mockFile = new Blob([largeContent], { type: 'text/plain' });

        const promise = readFile(mockFile);

        mockFileReader.onload({ target: { result: largeContent } });

        await expect(promise).resolves.toBe(largeContent);
    });

    it('should resolve with file content when file is binary', async () => {
        const mockFileReader = {
            readAsText: jest.fn(),
            onload: null,
            onerror: null,
            result: null,
            EMPTY: 0,
            LOADING: 1,
            DONE: 2
        };

        global.FileReader = jest.fn(() => mockFileReader);

        const mockFile = new Blob([new ArrayBuffer(10)], { type: 'application/octet-stream' });

        const promise = readFile(mockFile);

        mockFileReader.onload({ target: { result: 'binary content' } });

        await expect(promise).resolves.toBe('binary content');
    });

    it('should resolve with empty string when file is empty', async () => {
        const mockFileReader = {
            readAsText: jest.fn(),
            onload: null,
            onerror: null,
            result: null,
            EMPTY: 0,
            LOADING: 1,
            DONE: 2
        };

        global.FileReader = jest.fn(() => mockFileReader);

        const mockFile = new Blob([''], { type: 'text/plain' });

        const promise = readFile(mockFile);

        mockFileReader.onload({ target: { result: '' } });

        await expect(promise).resolves.toBe('');
    });
});