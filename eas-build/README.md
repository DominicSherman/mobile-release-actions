# eas-build

This action handles deploying your mobile app through [EAS](https://docs.expo.dev/eas/). It calls `eas build` with the `--auto-submit` flag to handle the deployment. 

__You must [install EAS CLI](https://github.com/marketplace/actions/expo-github-action) in your workflow prior to using this action.__

## Usage

```yaml
- uses: echobind/mobile-release-actions/eas-build@v1
  with:
    platform: ${{ github.event.inputs.platform }}
    profile: ${{ github.event.inputs.releaseStage }}
    submit: ${{ github.event.inputs.releaseStage != 'alpha' }}
```

## Inputs

| Name       | Type                       | Default      | Description                                          |
| ---------- | -------------------------- | ------------ | ---------------------------------------------------- |
| `platform` | `ios`, `android`, or `all` | `ios`        | Platform to build for.                               |
| `profile`  | `string`                   | `production` | Build and submit profile to use.                     |
| `submit`   | `boolean`                  | `true`       | Whether to submit the build to app store/play store. |