<template>
  <div id="my-account">
    <SfBreadcrumbs
      class="breadcrumbs desktop-only"
      :breadcrumbs="breadcrumbs"
    />
    <div class="sf-content-pages my-account">
      <SfBar
        class="smartphone-only"
        :title="title"
        :back="isOnSubpage"
        @click:back="goToTopLevelRoute"
      />
      <section
        :class="{ 'is-active': isOnSubpage}"
        class="sf-content-pages__section"
      >
        <div class="sf-content-pages__sidebar">
          <h1
            v-t="'My Account'"
            class="sf-content-pages__title desktop-only"
          />
          <div
            v-for="category in categories"
            :key="category.title"
          >
            <h2
              class="sf-content-pages__category-title"
              v-text="category.title"
            />
            <SfList class="sf-content-pages__list">
              <li
                v-for="item in category.items"
                :key="item.label"
                class="sf-content-pages__list-item sf-list__item"
              >
                <SfMenuItem
                  :label="$t(item.label)"
                  :link="localeRoute(item.link)"
                  class="sf-content-pages__menu"
                  v-on="item.listeners"
                />
              </li>
            </SfList>
          </div>
        </div>
        <div class="sf-content-pages__content">
          <router-view />
        </div>
      </section>
    </div>
  </div>
</template>

<script lang="ts">
import {
  SfBreadcrumbs, SfMenuItem, SfList, SfBar,
} from '@storefront-ui/vue';
import {
  defineComponent,
  useContext,
  useRouter,
  useRoute,
  computed,
} from '@nuxtjs/composition-api';
import type { Route, RawLocation } from 'vue-router';
import { useUser } from '~/modules/customer/composables/useUser';
import { useCart } from '~/composables';

export default defineComponent({
  components: {
    SfBar,
    SfBreadcrumbs,
    SfList,
    SfMenuItem,
  },
  middleware: 'is-authenticated',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const { logout } = useUser();
    const { clear } = useCart();
    const { i18n, localeRoute } = useContext();

    const isOnSubpage = computed(() => route.value.matched.length > 1);
    const goToTopLevelRoute = () => router.push(localeRoute({ name: 'customer' }));
    const title = computed(() => i18n.t(route.value.matched.at(-1)?.meta.titleLabel as string));

    // TODO add actual breadcrumb logic
    type Breadcrumb = { text: string, link: Route };
    const breadcrumbs : Breadcrumb[] = [
      {
        text: i18n.t('Home') as string,
        link: localeRoute({ name: 'home' }),
      },
      {
        text: i18n.t('My Account') as string,
        link: localeRoute({ name: 'customer' }),
      },
    ];

    type MyAccountCategory = { title: string, items: MyAccountItem[] };
    type MyAccountItem = { label: string, link?: RawLocation, listeners?: Record<string, () => (Promise<void> | void)> };

    const categories : MyAccountCategory[] = [
      {
        title: 'Personal details',
        items: [
          {
            label: 'My profile',
            link: { name: 'customer-my-profile' },
          },
          {
            label: 'Addresses details',
            link: { name: 'customer-addresses-details' },
          },
          {
            label: 'My newsletter',
            link: { name: 'customer-my-newsletter' },
          },
          {
            label: 'My wishlist',
            link: { name: 'customer-my-wishlist' },
          },
        ],
      },
      {
        title: 'Order details',
        items: [
          {
            label: 'Order history',
            link: { name: 'customer-order-history' },
          },
          {
            label: 'My reviews',
            link: { name: 'customer-my-reviews' },
          },
          {
            label: 'Log out',
            listeners: {
              click: async () => {
                await Promise.all([logout({}), clear({})]);
                await router.push(localeRoute({ name: 'home' }));
              },
            },
          },
        ],
      },
    ];

    return {
      breadcrumbs,
      categories,
      title,
      isOnSubpage,
      goToTopLevelRoute,
    };
  },
});
</script>

<style lang='scss' scoped>
::v-deep {
  .nuxt-link-exact-active > .sf-menu-item__label {
    color: var(--c-primary);
  }
}

.my-account {
  @include for-mobile {
    --content-pages-sidebar-category-title-font-weight: var(
      --font-weight--normal
    );
    --content-pages-sidebar-category-title-margin: var(--spacer-sm)
      var(--spacer-sm) var(--spacer-sm) var(--spacer-sm);
  }
  @include for-desktop {
    --content-pages-sidebar-category-title-margin: var(--spacer-xl) 0 0 0;
  }
}

.sf-content-pages {
  &__content {
    padding-top: 0;
    height: auto;
  }
}
</style>
