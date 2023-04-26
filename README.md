# Polarity Github Actions
This repo contains the ability to alter the files of all repositories in the Polarity Github Organization. One use case, for example being, the ability to publish all of our Github Actions we want to use in our Organization, along with the ability to publish them to all repos in the Organization via the Action found in the *[deploy-organization-actions.yml](./.github/workflows/deploy-organization-actions.yml)* file. 

> ***NOTE:*** Video instructions of how to use this repository to make similar file changes and releases for one to all integration repositories can be found at https://youtu.be/JLN8aMn-JZY

## Current Individual Repo Actions

- ### Release Current Version ([release-current-version.yml](./src/individualRepoActions/release-current-version.yml))
  This workflow will run on a push to `master` or `main`. It runs the `Integration Development Checklist` action and if that passes creates a series of new releases with the Release and Tag name both being the package.json version.  It will also generate a tgz file and the SHA256 for each release version in the release description.  It will also by default add all your commit messages to the release description as well.
  > ***NOTE***: If you want to change the behavior of the action, you can go to [release-current-version.yml](./.github/workflows/release-for-servers.yml)

- ### Run Integration Development Checklist ([run-int-dev-checklist.yml](./src/individualRepoActions/run-int-dev-checklist.yml))
  This workflow will run on a Pull Request created on `master`, `main`, & `develop`. It runs as a series of checks from the Polarity Integration Development Checklist which can be found at https://github.com/polarityio/polarity-integration-development-checklist


## Steps to Test/Develop
> ***WARNING!:*** This repo will make changes to all integration repositories if these steps are not followed carefully.
1. Change the `on.push.branches` property to a development branch name like `develop` or `new-branch-for-x-feature` in [deploy-organization-actions.yml](./.github/workflows/deploy-organization-actions.yml)
2. Add this to the bottom of the [deploy-organization-actions.yml](./.github/workflows/deploy-organization-actions.yml) file at the level of the `GITHUB_TOKEN` under the `with:` section: 
  ```yaml
      with: 
        org_id: polarityio
        action_file_names: |
          run-int-dev-checklist.yml
          release-current-version.yml
        GITHUB_TOKEN: ${{ secrets.POLARITY_ACTIONS_DEPLOY }}
        # Add repository_names_for_testing property here
        repository_names_for_testing: |
          testing-github-actions
          test-int-for-actions
  ```
3. Change this repo as you like, testing your changes as you go on the `Actions` tab found on Github ensuring Steps 1 & 2 have been followed before hand.
4. For actual deployment to all integration repos not in the ignore lists found in the [constants.js](./src/constants.js) file, change the `on.push.branches` to just have `master` and remove the `repository_names_for_testing` property under the `with:` property.  Create a Pull Request from `develop` to `master`.  
    > ***WARNING!:*** Doing this step will make changes to all integration repositories.  ***Proceed with Caution!***
5. On Merge of the Pull Request, make sure to change the develop branch's [deploy-organization-actions.yml](./.github/workflows/deploy-organization-actions.yml) to the state described in Step 1 to prevent any mistaken deployments