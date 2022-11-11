# angularjs-migration-helper
*by Lilo Elia*

Runs on a local AngularJS project and outputs report files that help with migration.

You can use this migration helper to find out the complexity of migrating different parts of your AngularJS application into another framework (like Svelte, VueJS or React).

As migration is often done by migrating part by part, this helper allows you to specify a scope within your project to analyze. 

> **Privacy note:**  
> No data ever leaves your computer, everything is local and offline for your safety.

## Setting up and using this helper

### Setup (only needed once)
1. Clone (or download) this repo to a local folder
2. Open a console and `cd` into the repo folder
3. Run `npm i`
4. Run `npx tsc`

### Usage (after setting up)
1. Open a console and `cd` into the repo folder
2. Run `npm start project_root scope_root` (replacing with real paths of course)
3. Reports are generated inside this repo's folder (see below)

### Important notes
- Some constructs and coding patterns are not yet supported, make sure to check the "Not yet supported" section below
- The `scope_root` is used to refer to the specific part of your project that you want to consider for migration
- No spaces are allowed in either `project_root` or `scope_root` parameters
- The `scope_root` must point to a directory *inside* the `project_root` directory
- Paths are either absolute or relative to this repo's folder (where you run the script)
- Example: `npm start /users/lilo/dev/oldAngJsProj/src /users/lilo/dev/oldAngJsProj/src/userMgmt/adminSite`

## Generated Reports

The migration helper considers all supported types inside the scope (e.g. components, directives, services) and analyzes which services are used by them and how extensive is the usage.
This information is then used for generating the following reports:

### Services usage statistics
- File: `services_usage.csv`
- CSV format, can be opened by any spreadsheet editor for sorting and filtering
- For each service used by the project, contains the following information:
  - name - the name of the service as used in AngularJS
  - injectionsInScope - number of files in scope that inject (use) this service
  - mentionsInScope - total number of mentions (in code, comments are ignored) of this service in the scope
  - inScope - true if this service is located inside the specified scope
  - filePath - the path to the file containing this service

### Dependencies statistics
- File: `dependencies_count.csv`
- CSV format, can be opened by any spreadsheet editor for sorting and filtering
- For each supported file in scope (components, directives, services, etc.) contains the following information:
  - name - the name of the component/directive/service/etc. 
  - serviceInjections - number of services injected to this file
  - mentionsOfServices - total number of mentions (in code, comments are ignored) of all services injected in this file
  - filePath - the path to the analyzed file

### Unused injections report
- File: `unused_injections.md`
- Markdown format, pre-sorted to contain most significant results up top
- For each file in scope that contains unused injections the following information is provided:
  - Path of the file
  - List of unused injections including their type (usually a service)

---

## Not yet supported
### Dynamic injections (TODO)
- Instances of `$injector.get('...')` should count toward that service's usage
- Note that in this case a result of 1 is most of the time the common result and does not indicate unused service.
- Finding out mentions will be more difficult here.

### Multiple components in a single file
- Not needed in current scope
- Files with several components/services/directives 
- Will just take the first one and provide wrong results

### Services defined with anonymous arrow function
- Not needed in current scope
