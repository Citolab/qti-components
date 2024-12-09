export async function resolveLoaders<T>(loaders, args): Promise<T | null> {
  // debugger;
  if (!loaders || loaders.length === 0) return null;

  // Execute the single loader function
  const loaderData = await loaders[0]({ args });
  // Resolve all properties in the returned object
  const resolvedData = {};
  for (const [key, value] of Object.entries(loaderData)) {
    resolvedData[key] = value instanceof Promise ? await value : value;
  }

  return resolvedData as T;
}
