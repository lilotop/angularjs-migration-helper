# No supported:
## Dynamic injections (TODO)
- Instances of `$injector.get('...')` should count toward that service's usage
- Note that in this case a result of 1 is most of the time the common result and does not indicate unused service.
- Finding out mentions will be more difficult here.

## Multiple components in a single file
- Not needed in current scope
- Files with several components/services/directives 

- Will just take the first one and provide wrong results
## Services defined with anonymous arrow function
- Not needed in current scope
