const JSONBig = require('json-bigint');

class FileUploader {
    constructor(dialog, translateService, dialogRef) {
        this._dialog = dialog;
        this._translateService = translateService;
        this._dialogRef = dialogRef;
        this.isUploadFailed = false;
        this.uploadError = '';
        this.fileContent = [];
        this.totalRecords = 0;
        this.progress = 0;
    }

    uploadFile(file) {
        const supportedFileTypes = ['application/json'];
        const supportedFileExtensions = ['json'];
        const fileReader = new FileReader();

        // Validate the file type and extension
        if (
            supportedFileTypes.includes(file.type) &&
            supportedFileExtensions.includes(file.name.split('.').pop())
        ) {
            this.file = file;
            fileReader.readAsText(file);
        } else {
            this._dialog.openAlert({
                title: this._translateService.instant('THERE_WAS_A_PROBLEM'),
                disableClose: true,
                message: this._translateService.instant('UNSUPPORTED_FILE_FORMAT', {
                    supportedExtensions: supportedFileExtensions.join(','),
                }),
                closeButton: this._translateService.instant('CLOSE'),
            });
            this._dialogRef.close();
            return;
        }

        fileReader.onload = () => {
            const fileContents = fileReader.result;
            let data = [];
            const errors = [];

            // Validate the file contents is a valid JSON
            try {
                data = JSONBig.parse(fileContents);
            } catch (error) {
                this.isUploadFailed = true;
                this.uploadError = this._translateService.instant(
                    'UPLOAD_JSON.INVALID_JSON'
                );
                return;
            }

            this.fileContent = data;
            this.totalRecords = data.length;

            // Validate the data is an array
            if (!Array.isArray(data)) {
                this.isUploadFailed = true;
                this.uploadError = this._translateService.instant(
                    'UPLOAD_JSON.INVALID_JSON'
                );
                return;
            }

            data.forEach((row, index) => {
                const columnError = this.hasRequiredColumns(row);
                const typeError = this.validateColumnTypes(row);
                const statusError = this.validateStatusType(row);

                if (columnError || typeError || statusError) {
                    this.isUploadFailed = true;
                    errors.push(
                        this._translateService.instant('UPLOAD_JSON.ERROR_IN_ITEM', {
                            index: index + 1,
                            error: columnError || typeError || statusError,
                        })
                    );
                }
            });

            this.uploadError = errors.join('\n');
        };

        fileReader.onerror = (event) => {
            this.isUploadFailed = true;
            const target = event.target;
            this._dialog.openAlert({
                title: this._translateService.instant('THERE_WAS_A_PROBLEM'),
                disableClose: true,
                message: target.error?.message,
                closeButton: this._translateService.instant('CLOSE'),
            });
            this._dialogRef.close();
        };

        fileReader.onprogress = (event) => {
            if (event.lengthComputable) {
                this.progress = Math.round((event.loaded / event.total) * 100);
            }
        };
    }

    hasRequiredColumns(row) {
        const requiredColumns = ['id', 'name', 'status'];
        for (const column of requiredColumns) {
            if (!Object.prototype.hasOwnProperty.call(row, column)) {
                return `Missing required column: ${column}`;
            }
        }
        return null;
    }

    validateColumnTypes(row) {
        if (typeof row.id !== 'number') {
            return 'Invalid type for column: id';
        }
        if (typeof row.name !== 'string') {
            return 'Invalid type for column: name';
        }
        if (typeof row.status !== 'string') {
            return 'Invalid type for column: status';
        }
        return null;
    }

    validateStatusType(row) {
        const validStatuses = ['active', 'inactive', 'pending'];
        if (!validStatuses.includes(row.status)) {
            return `Invalid status value: ${row.status}`;
        }
        return null;
    }
}

module.exports = FileUploader;