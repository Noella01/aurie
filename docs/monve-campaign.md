# Storefront photo placeholders

The previous generated campaign photos have been removed from the storefront and public assets.

The hero and seasonal banner use plain backgrounds and live text. Collection cards and the Customs feature use neutral placeholders. Product cards already use the shared `ImagePlaceholder` component when no product photo is supplied.

To add your own photography later, connect approved assets in `frontend/src/components/FashionHero.tsx` and `frontend/src/views/HomeView.tsx`. Product photos use the product's `image_url` field through the replacement service.
