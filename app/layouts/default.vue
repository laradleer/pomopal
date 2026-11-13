<!--
  The frame of every signed-in page (docs/04-design-system.md → Layout):
    phones and tablets  top bar, one column (480px) or two (960px), floating tab bar
    desktop (≥1024px)   navigation rail on the left, top bar, up to 3 columns (1216px)
-->
<template>
  <div class="min-h-dvh bg-canvas">
    <AppNavRail />
    <div class="lg:pl-24">
      <AppTopBar>
        <template #stats>
          <AppStatChips />
        </template>
      </AppTopBar>
      <main
        class="page-view mx-auto w-full max-w-phone px-4 pt-6 pb-32 md:max-w-app lg:max-w-wide lg:px-8 lg:pb-12"
      >
        <slot />
      </main>
    </div>
    <AppTabBar class="lg:hidden" />
    <RewardLevelUp />
    <RewardCoinFlight />
  </div>
</template>
