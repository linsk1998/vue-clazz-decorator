<template>
  <div>
    {{ title }}:<slot />
  </div>
</template>
<script setup>
// 显式声明 title 为 prop
defineProps({
  title: String
});
</script>
