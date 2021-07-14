<template>
    <div class="dropbox">
        <input
            type="file"
            accept="image/*"
            :name="fieldName"
            class="input-file"
            :disabled="selected"
            @change="handleFileChange($event)"
        >
        <p v-if="!selected">
            Arraste ou clique para anexar uma imagem
        </p>

        <p v-if="selected">
            Imagem selecionada: {{ value.name }}
        </p>
    </div>
</template>

<script>
export default {
    props: {
        fieldName: String,
    },
    data() {
        return {
            value: File,
            selected: false,
        }
    },
    methods: {
        handleFileChange(e) {
            this.selected = true;
            this.value = e.target.files[0];
            this.$emit('selected', this.value);
        }
    }
}
</script>

<style>

.dropbox {
    padding: 5px;
    cursor: pointer;
    color: dimgray;
    min-height: 50px;
    position: relative;
    outline-offset: -10px;
    background: #e7e7e7;
    outline: 2px dashed grey;
}

.input-file {
    opacity: 0;
    width: 100%;
    height: 100px;
    cursor: pointer;
    position: absolute;
}

.dropbox:hover {
    background: #CCCCCC;
}

.dropbox p {
    color: black;
    padding: 25px 0;
    font-size: 1.2em;
    text-align: center;
}

</style>
