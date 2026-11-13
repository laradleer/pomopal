<script setup lang="ts">
/** Layer for coins flying to and from the coin chip (useRewardFeedback). In the default layout. */
const { flights } = useRewardFeedback()
</script>

<template>
  <div class="pointer-events-none fixed inset-0 z-50" aria-hidden="true">
    <RewardCoinStream v-for="flight in flights" :key="flight.id" :flight="flight" />
  </div>
</template>
