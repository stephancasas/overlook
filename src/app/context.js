const Context = function (root) {
  let require;
  const container = {};
  const resolver = new Proxy(root, {
    get(target, prop) {
      if (prop in target) return target[prop];
      if (prop in container) return container[prop];
      require = prop; // required service instance is unavailable
      return undefined;
    },
  });

  let deferred = [];
  const retry = (serviceKey) => {
    deferred
      .filter(({ require, retry = false }) => require === serviceKey && !retry)
      .forEach(({ service }, i) => {
        deferred[i].retry = true;
        service(resolver);
      });

    // remove retried -- failed retrials will push to end of stack
    deferred = deferred.filter(({ retry = false }) => !retry);
  };

  Object.assign(root, {
    bind: (...services) => {
      services.forEach((service) => {
        const assignable =
          typeof service === 'function'
            ? (() => {
                try {
                  return service(resolver);
                } catch (ex) {
                  deferred.push({ require, service });
                  return {}; // dependency unavailable -- bind nothing;
                }
              })()
            : service;

        // bind the available instances
        Object.assign(container, assignable);

        // retry deferred service instance bindings
        Object.keys(assignable).forEach(retry);
      });

      return services.length - 1
        ? container[Object.keys(container).slice(-1)[0]] // return last binding
        : container;
    },
  });

  return resolver;
};

module.exports = Context;

/**
 * services are passed into the container as functions
 *
 * when the container's resolver is supplied to the service, the service will
 * destructure-out the service instances it needs
 *
 * if a service is unavailable, the service is marked for deferral and pushed
 * onto the deferral stack
 *
 * to halt a service instantiation on dependency resolution failure, execution
 * of the service function is carried-out inside of a try-catch block
 *
 * when a dependency fails to resolve, the resolver throws an error -- causing
 * the try-catch block to trip
 *
 * the deferral stack is an array of objects with the structure:
 *   { require: '<serviceInstanceName>', service: <function> }
 *
 * when the container receives an instance, the deferral stack is checked for
 * deferrals which may require the instance. any matches are immediately
 * re-tried
 *
 * should the match require another unavailable instance, it is pushed back onto
 * the deferral stack
 */
