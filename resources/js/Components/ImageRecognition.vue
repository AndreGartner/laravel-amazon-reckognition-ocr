<template>
    <div class="image-recognition">
        <form @submit.prevent="onSubmit">
            <image-upload field-name="image" @selected="onChangeFile($event)"></image-upload>
            <div v-show="showPreview" class="image-result">
                <p>{{ croppedMode ? 'Image: ' : 'Crop content: ' }} </p>
                <img :src="previewSrc" alt="Preview">
                <button
                    @click="onCrop()"
                    id="confirm-crop"
                    v-if="!croppedMode"
                    class="btn crop-btn"
                >
                    <font-awesome-icon icon="crop-alt"/>
                </button>
                <div v-if="showConfirmCrop" class="confirm-crop-row">
                    <button
                        id="confirm-btn"
                        class="btn result-btn"
                        @click="onConfirmCrop()"
                    >
                        <font-awesome-icon icon="check"></font-awesome-icon>
                    </button>

                    <button
                        id="cancel-btn"
                        class="btn result-btn"
                        @click="onCancelCrop()"
                    >
                        <font-awesome-icon icon="times"></font-awesome-icon>
                    </button>
                </div>

                <div v-if="showResult" class="text-result">
                    <p>Result: </p>
                    <b v-if="result">{{ result }}</b>
                </div>

                <div v-if="showErrorResult" class="error-result">
                    <p>It was not possible to recognize the image!</p>
                    <button class="btn try-again" @click="onCancelResult()">
                        <font-awesome-icon icon="redo-alt"/>
                    </button>
                </div>
            </div>
        </form>
    </div>
</template>

<script>
require('jimp/browser/lib/jimp');
const Jimp = window.Jimp;
import Cropper from 'cropperjs';

export default {
    props: [],
    data() {
        return {
            cropper: null,
            previewSrc: null,
            showResult: false,
            loadingOCR: false,
            showPreview: false,
            croppedMode: false,
            showConfirm: false,
            showErrorResult: false,
            showConfirmCrop: false,
        }
    },
    methods: {
        async onChangeFile(file) {
            await this.setImageSrc(file);

            if (this.cropper) {
                this.cropper.destroy();
            }

            this.loadCropper();
        },
        loadCropper() {
            const image  = document.querySelector('.image-result img');
            this.cropper = new Cropper(image, {
                zoomable: false,
                responsive: true,
                crop(e) {console.log(e);},
            });
        },
        onCrop() {
            const croppedCanvas  = this.cropper.getCroppedCanvas();
            this.previewSrc      = croppedCanvas.toDataURL();
            this.croppedMode     = true;
            this.showConfirmCrop = true;

            this.cropper.destroy();
        },
        async onConfirmCrop() {
            try {
                this.loadingOCR      = true;
                this.showConfirmCrop = false;

                const dataUri = this.previewSrc;
                const jimp    = await Jimp.read(dataUri);

                await this.preProccessImage(jimp);
                await this.recognizeText(jimp);

                this.loadingOCR = false;
            } catch (e) {
                console.error(e);
                this.showErrorAlert();
                this.loadingOCR = false;
                this.removeResult();
            }
        },
        async preProccessImage(jimp) {
            jimp.color([{apply: 'desaturate', params: [150]}]).invert();
        },
        setImageSrc(imageFile) {
            return new Promise((resolve, reject) => {
                this.showPreview = true;
                const fileReader = new FileReader();

                fileReader.onload = () => {
                    if (typeof fileReader.result !== 'string') {
                        return reject(null);
                    }

                    this.previewSrc = fileReader.result;
                    return resolve();
                };

                fileReader.onerror = reject;
                fileReader.readAsDataURL(imageFile);
            });
        },
        async recognizeText(jimp) {
            const dataUri = await jimp.getBase64Async(Jimp.MIME_JPEG);

            console.log('Final Image', dataUri);

            const imgBlob   = this.dataURItoBlob(dataUri);
            const imageFile = new File([imgBlob], `image_${new Date()}`);

            const { headers, formData } = this.mountRequestOptions(imageFile);
            return axios.post('/recognize', formData, {headers}).then(res => {
                const result = res.data.result;
                console.log(res.data.result);
                this.appendResultText(result);

                if (!this.showErrorResult) {
                    this.appendConfirmButtons();
                }
            }).catch(err => console.error(err));
        },
        mountRequestOptions(image) {
            const formData = new FormData();
            formData.append('image', image);

            const headers = {"Content-Type": `multipart/form-data; boundary=${formData._boundary}`};

            return { headers, formData };
        },
        appendResultText(text) {
            let result = '';

            if (this.regex) {
                result = text.replace(this.regex, '');
            }

            const length = this.maxLength ? this.maxLength : text.length;

            result = text.substr(0, length);

            if (result.length < 1) {
                return this.showErrorResult = true;
            }

            this.result     = result;
            this.showResult = true;
        },
        appendConfirmButtons() {
            this.showConfirm = true;
        },
        onCancelCrop() {
            this.croppedMode     = false;
            this.showPreview     = false;
            this.showConfirmCrop = false;
        },
        onSubmit(e) {

        },
        removeResult() {
            this.showResult      = false;
            this.showPreview     = false;
            this.showConfirm     = false;
            this.croppedMode     = false;
            this.showConfirmCrop = false;
            this.showErrorResult = false;

            this.result       = null;
            this.previewSrc   = false;
        },
        dataURItoBlob(dataURI) {
            // convert base64/URLEncoded data component to raw binary data held in a string
            let byteString;
            if (dataURI.split(',')[0].indexOf('base64') >= 0) {
                byteString = atob(dataURI.split(',')[1]);
            } else {
                byteString = unescape(dataURI.split(',')[1]);
            }
            // separate out the mime component
            const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
            // write the bytes of the string to a typed array
            const ia = new Uint8Array(byteString.length);
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            return new Blob([ia], {type:mimeString});
        },
    },
}
</script>

<style>

</style>
