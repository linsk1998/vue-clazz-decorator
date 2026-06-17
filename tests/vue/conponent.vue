<template>
	<div>
		<span>{{count}}</span>
		<button @click="increase">+</button>
	</div>
</template>
<script lang="ts">
import { Component } from "@/vue/Component";
import { State } from "@/vue/State";

export default Component(class {
	@State
	public count = 0;

	public increase() {
		this.count++;
	}
});
</script>
