<template>
    <div class="container">
        <input type="text" class="textbox" v-model="selectedItem">
        <div class="arrow" @click="toggleDropdown">&#9660;</div>
        <div class="dropdown-content" v-show="dropdownVisible">
            <div @click="selectItem('Item 1')">Item 1</div>
            <div @click="selectItem('Item 2')">Item 2</div>
            <!-- Add more items here -->
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            selectedItem: '',
            dropdownVisible: false,
        };
    },
    methods: {
        toggleDropdown() {
            this.dropdownVisible = !this.dropdownVisible;
        },
        selectItem(value) {
            this.selectedItem = value;
            this.dropdownVisible = false;
        },
    },
};
</script>

<style>
.container {
    position: relative;
    display: inline-block;
}

.textbox {
    width: 140px;
    padding-right: 20px;
}

.arrow {
    position: absolute;
    right: 5px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    user-select: none;
}

.dropdown-content {
    display: none;
    position: absolute;
    background-color: #f9f9f9;
    min-width: 160px;
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
    z-index: 1;
}

.dropdown-content div {
    padding: 12px 16px;
    cursor: pointer;
    display: block;
}

.dropdown-content div:hover {
    background-color: #f1f1f1;
}
</style>
