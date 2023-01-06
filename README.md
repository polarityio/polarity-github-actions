# Polarity Github Actions
This repo contains all of our Github Actions we want to use in our Organization, along with the ability to publish them to all repos in the Organization via the Action found *[HERE](./.github/workflows/deploy-organization-actions.yml)*. 

These Actions Include:

## Release Current Version ([release-current-version.yml](./src/release-current-version.yml))
This workflow will run on merge of a PR or push to `master` or `main`. It runs the `Integration Development Checklist` action and if that passes creates a series of new releases with the Release and Tag name both being the package.json version and will with a created tgz file and the SHA256 for each release version in the release description.  It will also by default add all your commit messages to the release description as well.
> ***NOTE***: If you want to change the behavior of the action, you can go to [release-current-version.yml](./.github/workflows/release-for-servers.yml)

## Run Integration Development Checklist ([run-int-dev-checklist.yml](./src/run-int-dev-checklist.yml))
This workflow will run on a Pull Request is created on both master, main, & develop. It run as series of checks from the Polarity Integration Development Checklist which can be found at https://github.com/polarityio/polarity-integration-development-checklist


## Steps to Test/Develop
> ***WARNING!:*** This repo will make changes to all integration repositories if these steps are not followed carefully.
1. Change the `on.push.branches` property to a development branch name like `develop` or `new-branch-for-x-feature`
2. Add this to the bottom of the [deploy-organization-actions.yml](./.github/workflows/deploy-organization-actions.yml) file make sure to add to the bottom at the file under and at the level of the `GITHUB_TOKEN` under the `with:` section: 
  ```yaml
        repository_names_for_testing: |
          testing-github-actions
          test-int-for-actions
  ```
3. For actual deployment to all integration repos not in the ignore lists found in the [constants.js](./src/constants.js) file, change the `on.push.branches` to just have `master` and remove the `repository_names_for_testing` `with:` property.
    > ***WARNING!:*** Doing this step will make changes to all integration repositories.  ***Proceed with Caution!***