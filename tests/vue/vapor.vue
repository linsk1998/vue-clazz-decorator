<template>
	<div>{{ title }}</div>
</template>
<script setup vapor>
// 显式声明 title 为 prop
defineProps({
	title: String
});
</script>
