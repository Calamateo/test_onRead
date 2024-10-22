const { Blob } = require('blob-polyfill');
const FileUploader = require('./fileReader');

describe('FileUploader', () => {
    let fileUploader;
    let mockDialog, mockTranslateService, mockDialogRef;

    beforeEach(() => {
        mockDialog = { openAlert: jest.fn() };
        mockTranslateService = { instant: jest.fn((key, params) => key) };
        mockDialogRef = { close: jest.fn() };
        fileUploader = new FileUploader(mockDialog, mockTranslateService, mockDialogRef);
    });

    it('should initialize properties in the constructor', () => {
        expect(fileUploader.isUploadFailed).toBe(false);
        expect(fileUploader.uploadError).toBe('');
        expect(fileUploader.fileContent).toEqual([]);
        expect(fileUploader.totalRecords).toBe(0);
        expect(fileUploader.progress).toBe(0);
    });

    it('should validate supported file type and extension', () => {
        const mockFile = new Blob(['{}'], { type: 'application/json' });
        mockFile.name = 'test.json';

        const fileReader = {
            readAsText: jest.fn(),
            onload: null,
            onerror: null,
            result: null
        };

        global.FileReader = jest.fn(() => fileReader);

        fileUploader.uploadFile(mockFile);

        expect(fileReader.readAsText).toHaveBeenCalledWith(mockFile);
    });

    it('should reject unsupported file type and extension', () => {
        const mockFile = new Blob(['{}'], { type: 'text/plain' });
        mockFile.name = 'test.txt';

        fileUploader.uploadFile(mockFile);

        expect(mockDialog.openAlert).toHaveBeenCalled();
        expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should handle FileReader onload with valid JSON array', () => {
        const mockFile = new Blob(['[{"id": 1, "name": "Test", "status": "active"}]'], { type: 'application/json' });
        mockFile.name = 'test.json';

        const fileReader = {
            readAsText: jest.fn(),
            onload: null,
            onerror: null,
            result: null
        };

        global.FileReader = jest.fn(() => fileReader);

        fileUploader.uploadFile(mockFile);

        fileReader.result = '[{"id": 1, "name": "Test", "status": "active"}]';
        fileReader.onload();

        expect(fileUploader.fileContent).toEqual([{ id: 1, name: 'Test', status: 'active' }]);
        expect(fileUploader.totalRecords).toBe(1);
    });
});