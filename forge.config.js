module.exports = {
  packagerConfig: {
    appBundleId: process.env.APP_BUNDLE_ID,
    icon: 'asset/Overlook.icns',
    protocols: [
      {
        name: 'Email Address URL (RFC 6068)',
        schemes: ['mailto'],
      },
      {
        name: 'Email Address URL (extended)',
        schemes: ['x-mailto'],
      },
      {
        name: 'Private Overlook URL Scheme',
        schemes: ['x-overlook'],
      },
    ],
  },
  makers: [
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-dmg',
      platforms: ['darwin'],
      config: {
        background: 'asset/dmg-background.png',
        icon: 'asset/dmg-icon.icns',
      },
    },
  ],
//   ----------------- Uncomment to Auto-publish to GitHub ------------------ //
//     publishers: [
//       {
//         name: '@electron-forge/publisher-github',
//         config: {
//           repository: {
//             name: process.env.GITHUB_REPOSITORY_NAME,
//             owner: process.env.GITHUB_REPOSITORY_OWNER,
//           },
//           prerelease: true,
//         },
//       },
//     ],
//   --------------- Uncomment to Sign Application for macOS ---------------- //
//     osxSign: {
//       identity: process.env.APPLE_DEVELOPER_ID_APPLICATION,
//     },
//     osxNotarize: {
//       tool: 'notarytool',
//       appleId: process.env.APPLE_ID,
//       appleIdPassword: process.env.APPLE_ID_APP_PASSWORD,
//     },
};
