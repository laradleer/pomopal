<!--
  The frame of every signed-in page: top bar, content column and the floating tab bar.
  Mobile-first: one 480px column on phones; pages may use a 2-column bento up to 960px (md:).
-->
<template>
  <div class="min-h-dvh bg-canvas">
    <AppTopBar>
      <template #stats>
        <AppStatChips />
      </template>
    </AppTopBar>
    <main class="mx-auto w-full max-w-phone px-4 pt-6 pb-32 md:max-w-app">
      <slot />
    </main>
    <AppTabBar />
    <RewardLevelUp />
    <RewardCoinFlight />
  </div>
</template>
