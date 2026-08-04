const createPublicAssetPath = (assetPath: string): string =>
  `${import.meta.env.BASE_URL}${assetPath}`;

export const PUBLIC_ASSET_PATHS = {
  favicon: createPublicAssetPath('assets/favicon.ico'),
  helpLogo: createPublicAssetPath('assets/Logo.svg'),
} as const;
