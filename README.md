# Polarity Github Actions
This repo contains all of our Github Actions we want to use in our Organization and the ability to publish them to all repos in the Organization.  This includes:

## Release Current Version (release-current-version.yml)
This workflow will run on merge of a PR or push to master. It will run the integration developement checklist and if that passes creates a new release with the Release and Tag name both being the package.json version and will with a created tgz file and the SHA256 has in the release description.

## Run Integration Development Checklist (run-int-dev-checklist.yml)
This workflow will run on a Pull Request is created on both master develop. It run as series of checks from the Polarity Integration Developement Checklist including:
- LICENSE File Checks 
  - Verifying the LICENSE file exists
  - Verifying contents of the LICENSE are correct and up to date
- config.js File Checks 
  - Verifying Logging Level is set to `info`
  - Verifying Request Options are set correctly including
    - `cert`, `key`, `passphrase`, `ca`, and `proxy` all having the value `''`
    - `rejectUnauthorized` being set to `true`
  - Verifying all Integration Options have a description containing content
- package.json File Checks 
  - Verifying the `private` flag is set to true
  - Verifying the `version` property matches standard semantic versioning format
  - Checks to see if the current `version` property already exists as a release on Github.