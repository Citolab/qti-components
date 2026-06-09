// Type definition for module resolution config
export interface ModuleResolutionConfig {
  waitSeconds?: number;
  context?: string;
  catchError?: boolean;
  urlArgs?: string;
  paths: {
    [key: string]: string | string[];
  };
  shim?: {
    [key: string]: {
      deps?: string[]; // Array of dependencies
      exports?: string; // The global variable to use as the module's value
    };
  };
}

export async function configurePci(
  xmlFragment: XMLDocument,
  baseUrl: string,
  getModuleResolutionConfig: (baseUrl: string, fileUrl: string) => Promise<ModuleResolutionConfig>,
  selector = 'qti-portable-custom-interaction'
): Promise<void> {
  const customInteractionTypeIdentifiers: string[] = [];
  const portableCustomInteractions = xmlFragment.querySelectorAll(selector);

  // Avoid fetching module resolution configs for items that do not contain any PCIs.
  // This prevents unnecessary network requests when configurePci() is called for every item.
  if (portableCustomInteractions.length === 0) {
    return;
  }

  // Lazily load (and cache) the default module resolution configs.
  let moduleResolutionConfig: ModuleResolutionConfig | null = null;
  let moduleResolutionFallbackConfig: ModuleResolutionConfig | null = null;
  const ensureDefaultModuleResolutionConfigs = async () => {
    if (moduleResolutionConfig === null) {
      try {
        moduleResolutionConfig = await getModuleResolutionConfig(baseUrl, '/modules/module_resolution.js');
      } catch {
        moduleResolutionConfig = null;
      }
    }
    if (moduleResolutionFallbackConfig === null) {
      try {
        moduleResolutionFallbackConfig = await getModuleResolutionConfig(
          baseUrl,
          '/modules/fallback_module_resolution.js'
        );
      } catch {
        moduleResolutionFallbackConfig = null;
      }
    }
  };

  for (const interaction of Array.from(portableCustomInteractions)) {
    // set data-base-url
    interaction.setAttribute('data-base-url', baseUrl);

    let customInteractionTypeIdentifier = interaction.getAttribute('custom-interaction-type-identifier');
    if (customInteractionTypeIdentifier && customInteractionTypeIdentifiers.includes(customInteractionTypeIdentifier)) {
      customInteractionTypeIdentifier = customInteractionTypeIdentifier + customInteractionTypeIdentifiers.length;
      interaction.setAttribute('custom-interaction-type-identifier', customInteractionTypeIdentifier);
      customInteractionTypeIdentifiers.push(customInteractionTypeIdentifier);
    }
    if (customInteractionTypeIdentifier) {
      customInteractionTypeIdentifiers.push(customInteractionTypeIdentifier);
    }

    // Check if qti-interaction-modules already exists
    let modulesElement = interaction.querySelector('qti-interaction-modules');

    // If it exists and has primary-configuration, handle that format
    if (modulesElement && modulesElement.getAttribute('primary-configuration')) {
      await ensureDefaultModuleResolutionConfigs();
      const primaryConfigPath = modulesElement.getAttribute('primary-configuration');
      if (primaryConfigPath) {
        try {
          // Load the primary configuration
          const primaryConfig = await getModuleResolutionConfig(baseUrl, `/${primaryConfigPath}`);

          // Get existing module elements that only have id attributes
          const existingModules = Array.from(modulesElement.querySelectorAll('qti-interaction-module'));

          // Update existing modules with paths from config
          for (const moduleEl of existingModules) {
            const moduleId = moduleEl.getAttribute('id');
            if (moduleId && primaryConfig.paths && primaryConfig.paths[moduleId]) {
              const primaryPath = primaryConfig.paths[moduleId];
              const primaryPathString = Array.isArray(primaryPath) ? primaryPath[0] : primaryPath;
              moduleEl.setAttribute('primary-path', primaryPathString);

              // Check for fallback path
              if (
                moduleResolutionFallbackConfig &&
                moduleResolutionFallbackConfig.paths &&
                moduleResolutionFallbackConfig.paths[moduleId]
              ) {
                const fallbackPath = moduleResolutionFallbackConfig.paths[moduleId];
                if (Array.isArray(fallbackPath)) {
                  moduleEl.setAttribute('fallback-path', fallbackPath[0]);
                } else {
                  moduleEl.setAttribute('fallback-path', fallbackPath);
                }
              }
            }
          }

          // Add any additional modules from primary config that aren't already present
          if (primaryConfig.paths) {
            for (const moduleId in primaryConfig.paths) {
              const existingModule = modulesElement.querySelector(`qti-interaction-module[id="${moduleId}"]`);
              if (!existingModule) {
                const newModuleElement = xmlFragment.createElement('qti-interaction-module');
                newModuleElement.setAttribute('id', moduleId);
                const primaryPathString = Array.isArray(primaryConfig.paths[moduleId])
                  ? primaryConfig.paths[moduleId][0]
                  : primaryConfig.paths[moduleId];
                newModuleElement.setAttribute('primary-path', primaryPathString);

                // Check for fallback path
                if (
                  moduleResolutionFallbackConfig &&
                  moduleResolutionFallbackConfig.paths &&
                  moduleResolutionFallbackConfig.paths[moduleId]
                ) {
                  const fallbackPath = moduleResolutionFallbackConfig.paths[moduleId];
                  if (Array.isArray(fallbackPath)) {
                    newModuleElement.setAttribute('fallback-path', fallbackPath[0]);
                  } else {
                    newModuleElement.setAttribute('fallback-path', fallbackPath);
                  }
                }

                modulesElement.appendChild(newModuleElement);
              }
            }
          }

          // Apply urlArgs if present in config
          if (primaryConfig.urlArgs) {
            modulesElement.setAttribute('url-args', primaryConfig.urlArgs);
          }
        } catch (error) {
          console.warn(`Failed to load primary configuration: ${primaryConfigPath}`, error);
        }
      }
    } else {
      // Original logic for when there's no existing qti-interaction-modules or no primary-configuration
      await ensureDefaultModuleResolutionConfigs();
      if (moduleResolutionConfig) {
        // Create qti-interaction-modules if it doesn't exist
        if (interaction.querySelector('qti-interaction-modules') === null) {
          modulesElement = xmlFragment.createElement('qti-interaction-modules');
          interaction.appendChild(modulesElement);
        } else {
          modulesElement = interaction.querySelector('qti-interaction-modules');
        }

        for (const module in moduleResolutionConfig.paths) {
          const path = moduleResolutionConfig.paths[module];
          let fallbackPath: string | string[] = '';

          if (
            moduleResolutionFallbackConfig &&
            moduleResolutionFallbackConfig.paths &&
            moduleResolutionFallbackConfig.paths[module]
          ) {
            fallbackPath = moduleResolutionFallbackConfig.paths[module];
          }

          const primaryArray = Array.isArray(path) ? path : [path];
          const fallbackPathArray = Array.isArray(fallbackPath) ? fallbackPath : [fallbackPath];

          // create an array with primary and fallback paths.
          const paths = primaryArray.map((primaryPath, i) => {
            const fallbackPath = fallbackPathArray.length > i ? fallbackPathArray[i] : '';
            return {
              primaryPath,
              fallbackPath
            };
          });

          // check if all fallbackPath elements are in the array: paths, otherwise add
          for (const fallbackPath of fallbackPathArray) {
            if (!paths.some(p => p.fallbackPath === fallbackPath)) {
              paths.push({
                primaryPath: primaryArray.length > 0 ? primaryArray[0] : fallbackPath,
                fallbackPath
              });
            }
          }

          // add the paths to the qti-interaction-modules
          for (const path of paths) {
            const moduleElement = xmlFragment.createElement('qti-interaction-module');
            if (path.fallbackPath) {
              moduleElement.setAttribute('fallback-path', path.fallbackPath);
            }
            moduleElement.setAttribute('id', module);
            moduleElement.setAttribute('primary-path', path.primaryPath);

            if (modulesElement) {
              modulesElement.appendChild(moduleElement);
            }
          }
        }
      }
    }
  }
}
