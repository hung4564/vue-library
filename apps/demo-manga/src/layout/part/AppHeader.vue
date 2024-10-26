<template lang="">
  <nav class="px-2 z-40 top-0 left-0 w-full fixed" :class="show_class">
    <div class="max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl mx-auto">
      <div class="flex justify-between items-stretch py-2 gap-4 h-[60px]">
        <div class="flex-1 items-center gap-3 hidden lg:flex"></div>
        <div class="flex-1 flex lg:justify-center items-center max-w-full">
          Manga
        </div>
        <div class="flex-1 flex justify-end max-w-full"></div>
      </div>
    </div>
  </nav>
  <div class="h-[60px]"></div>
</template>
<script>
export default {
  data() {
    return {
      show_class: 'bg-white bg-opacity-60 backdrop-blur fine-shadow',
    };
  },
};
</script>
<style lang=""></style>
