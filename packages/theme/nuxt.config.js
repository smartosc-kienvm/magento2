// @core-development-only-start
/* eslint-disable unicorn/prefer-module */
// @core-development-only-end
import webpack from 'webpack';
import config from './config.js';
import middleware from './middleware.config';
import { getRoutes } from './routes';

const GoogleFontsPlugin = require('@beyonk/google-fonts-webpack-plugin');

const {
  integrations: {
    magento: {
      configuration: {
        cookies,
        externalCheckout,
        defaultStore,
        facets,
        magentoBaseUrl,
        imageProvider,
        magentoApiEndpoint,
        customApolloHttpLinkOptions,
      },
    },
  },
} = middleware;

export default () => {
  const baseConfig = {
    ssr: true,
    dev: config.get('nuxtAppEnvironment') !== 'production',
    server: {
      port: process.env.PORT || config.get('nuxtAppPort'),
      host: '0.0.0.0',
    },
    head: {
      title: process.env.npm_package_name || '',
      meta: [
        { charset: 'utf-8' },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1',
        },
        {
          hid: 'description',
          name: 'description',
          content: process.env.npm_package_description || '',
        },
      ],
      link: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          href: '/favicon.ico',
        },
      ],
    },
    loading: { color: '#fff' },
    device: {
      refreshOnResize: true,
    },
    buildModules: [
      // to core
      '@nuxtjs/composition-api/module',
      '@nuxt/typescript-build',
      '@nuxtjs/pwa',
      '@nuxtjs/style-resources',
      '@nuxtjs/device',
      ['@vue-storefront/nuxt', {
        // selectively disabling certain @vue-storefront/core plugins for migration
        context: false,
        logger: false,
        ssr: false,
        sfui: false,
        i18nExtension: false,
        e2e: true,
        performance: {
          httpPush: false,
          purgeCSS: {
            enabled: false,
          },
        },
      }],
      ['~/modules/magento', {
        cookies,
        externalCheckout,
        defaultStore,
        facets,
        magentoBaseUrl,
        imageProvider,
        magentoApiEndpoint,
        customApolloHttpLinkOptions,
      }],
      '@nuxt/image',
      '@pinia/nuxt',
    ],
    modules: [
      '~/modules/catalog',
      ['nuxt-i18n', {
        baseUrl: process.env.BASE_URL || 'http://localhost:3000',
      }],
      'cookie-universal-nuxt',
      'vue-scrollto/nuxt',
      '@vue-storefront/middleware/nuxt',
      '@nuxt/image',
      ['@vue-storefront/cache/nuxt', {
        enabled: !!process.env.REDIS__ENABLED,
        invalidation: {
          endpoint: process.env.REDIS__CACHE_INVALIDATE_URL,
          key: process.env.REDIS__CACHE_INVALIDATE_KEY,
          handlers: [
            '@vue-storefront/cache/defaultHandler',
          ],
        },
        driver: [
          '@vue-storefront/redis-cache',
          {
            // docs: https://github.com/luin/ioredis/blob/master/API.md#new-redisport-host-options
            redis: {
              keyPrefix: process.env.REDIS__KEY_PREFIX,
              host: process.env.REDIS__HOST,
              port: process.env.REDIS__PORT,
            },
          },
        ],
      }],
    ],
    i18n: {
      country: 'US',
      strategy: 'prefix',
      locales: [
        {
          code: 'default',
          file: 'en.js',
          iso: 'en_US',
          defaultCurrency: 'USD',
        },
        {
          code: 'german',
          file: 'de.js',
          iso: 'de_DE',
          defaultCurrency: 'EUR',
        },
      ],
      defaultLocale: 'default',
      lazy: true,
      seo: true,
      langDir: 'lang/',
      vueI18n: {
        fallbackLocale: 'default',
        numberFormats: {
          default: {
            currency: {
              style: 'currency',
              currency: 'USD',
              currencyDisplay: 'symbol',
            },
          },
          german: {
            currency: {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'symbol',
            },
          },
        },
      },
      detectBrowserLanguage: false,
    },
    pwa: {
      meta: {
        theme_color: '#5ECE7B',
      },
    },
    styleResources: {
      scss: [require.resolve('@storefront-ui/shared/styles/_helpers.scss', { paths: [process.cwd()] })],
    },
    build: {
      extractCSS: true,
      optimizeCSS: true,
      parallel: true,
      extend(cfg) {
        // eslint-disable-next-line no-param-reassign
        cfg.devtool = 'source-map';
      },
      plugins: [
        new webpack.DefinePlugin({
          'process.VERSION': JSON.stringify({
            // eslint-disable-next-line global-require
            version: require('./package.json').version,
            lastCommit: process.env.LAST_COMMIT || '',
          }),
        }),
        new GoogleFontsPlugin({
          fonts: [
            { family: 'Raleway', variants: ['300', '400', '500', '600', '700', '400italic'], display: 'swap' },
            { family: 'Roboto', variants: ['300', '400', '500', '700', '300italic', '400italic'], display: 'swap' },
          ],
          name: 'fonts',
          filename: 'fonts.css',
          path: 'assets/fonts/',
          local: true,
          formats: ['eot', 'woff', 'woff2', 'ttf', 'svg'],
          apiUrl: 'https://google-webfonts-helper.herokuapp.com/api/fonts',
        }),
      ],
      transpile: [
        'vee-validate',
        /^@storefront-ui/,
      ],
    },
    plugins: [
      '~/plugins/token-expired',
      '~/plugins/i18n',
      '~/plugins/fcPlugin',
    ],
    serverMiddleware: [
      '~/serverMiddleware/body-parser.js',
      '~/serverMiddleware/cms-content',
    ],
    router: {
      prefetchLinks: false,
      extendRoutes(routes) {
        getRoutes()
          .forEach((route) => routes.unshift(route));
      },
    },
    image: {
      provider: config.get('imageProvider'),
    },
  };

  if (config.get('imageProvider') === 'cloudinary') {
    baseConfig.image.cloudinary = {
      baseURL: config.get('imageProviderBaseUrl'),
    };
  }

  if (config.get('recaptchaEnabled')) {
    baseConfig.modules.push('@nuxtjs/recaptcha');

    baseConfig.recaptcha = {
      hideBadge: config.get('recaptchaHideBadge'), // Hide badge element (v3 & v2 via size=invisible)
      siteKey: config.get('recaptchaSiteKey'), // Site key for requests
      version: config.get('recaptchaVersion'), // Version 2 or 3
      size: config.get('recaptchaSize'), // Size: 'compact', 'normal', 'invisible' (v2)
    };

    baseConfig.publicRuntimeConfig = {
      ...baseConfig.publicRuntimeConfig,
      isRecaptcha: config.get('recaptchaEnabled'),
    };
  }

  return baseConfig;
};
