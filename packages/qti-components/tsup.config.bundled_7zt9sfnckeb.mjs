// tsup.config.ts
import { defineConfig } from "tsup";

// package.json
var package_default = {
  name: "@qti-components/components",
  version: "1.0.0",
  description: "QTI component utilities",
  main: "dist/index.js",
  scripts: {
    build: "tsup",
    clean: "rm -rf dist cdn",
    test: 'echo "Error: no test specified" && exit 1'
  },
  keywords: [
    "qti",
    "components"
  ],
  author: "",
  type: "module",
  sideEffects: [
    "./dist/**/*.css"
  ],
  license: "GPL-3.0-only",
  exports: {
    ".": {
      import: "./dist/index.js"
    },
    "./exports/*": {
      import: "./dist/shared/*"
    },
    "./qti-elements": {
      import: "./dist/qti-elements.js"
    },
    "./qti-interactions": {
      import: "./dist/qti-interactions.js"
    },
    "./qti-item": {
      import: "./dist/item.js"
    },
    "./qti-test": {
      import: "./dist/test.js"
    },
    "./qti-loader": {
      import: "./dist/loader.js"
    },
    "./qti-transformers": {
      import: "./dist/qti-transformers.js"
    },
    "./customElements": "./custom-elements.json",
    "./item.css": "./dist/item.css",
    "./cdn/*": "./cdn/*",
    "./package.json": "./package.json"
  },
  files: [
    "dist",
    "cdn",
    "custom-elements.json"
  ],
  dependencies: {
    "@qti-components/test": "workspace:*",
    "@qti-components/item": "workspace:*",
    "@qti-components/elements": "workspace:*",
    "@qti-components/transformers": "workspace:*",
    "@qti-components/interactions": "workspace:*",
    "@qti-components/loader": "workspace:*",
    "@qti-components/shared": "workspace:*"
  },
  peerDependencies: {
    "@heximal/templates": "^0.1.5",
    "@lit/context": "^1.1.3",
    lit: "^3.2.1"
  }
};

// ../../scripts/inline-css-plugin.js
import fs from "fs";
import { join } from "path";
import postcss from "postcss";

// ../../postcss.config.mjs
import autoprefixer from "autoprefixer";
import postcssApply from "postcss-class-apply/dist/index.js";
import postcssImport from "postcss-import";
var postcss_config_default = {
  plugins: [
    postcssImport(),
    // This should be first
    // postcssNested(),
    postcssApply(),
    autoprefixer()
  ]
};

// ../../scripts/inline-css-plugin.js
var inline_id = "?inline";
var InlineCSSPlugin = {
  name: "inline-css",
  setup({ onResolve, onLoad }) {
    onResolve({ filter: /\.css\?inline$/ }, (args) => ({
      namespace: "inline",
      path: args.path,
      pluginData: { resolveDir: args.resolveDir }
    }));
    onLoad({ filter: /.*/, namespace: "inline" }, async (args) => {
      try {
        const importPath = args.path.slice(0, -inline_id.length);
        let cssFullPath;
        if (importPath.startsWith(".")) {
          cssFullPath = join(args.pluginData.resolveDir, importPath);
        } else {
          const segments = importPath.split("/");
          let packageName;
          if (segments[0].startsWith("@")) {
            packageName = `${segments[0]}/${segments[1]}`;
          } else {
            packageName = segments[0];
          }
          const modulePath = join(process.cwd(), "node_modules", packageName);
          const packageJsonPath = join(modulePath, "package.json");
          if (!fs.existsSync(packageJsonPath)) {
            throw new Error(`package.json not found for ${packageName} in ${modulePath}`);
          }
          const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
          const exportsMap = packageJson.exports || {};
          const importKey = `.${importPath.slice(packageName.length)}`;
          const resolvedPath = exportsMap[importKey];
          if (resolvedPath) {
            cssFullPath = join(modulePath, resolvedPath);
          } else {
            throw new Error(`Unable to resolve ${importKey} in exports map of ${packageName}`);
          }
        }
        if (!fs.existsSync(cssFullPath)) {
          throw new Error(`CSS file not found: ${cssFullPath}`);
        }
        const cssContent = fs.readFileSync(cssFullPath, "utf8");
        const processResult = await postcss(postcss_config_default?.plugins || []).process(cssContent, {
          from: cssFullPath,
          to: void 0
        });
        return {
          contents: processResult.css,
          // Use processed CSS content
          loader: "text"
          // Inline as text
        };
      } catch (err) {
        console.error(`Error in InlineCSSPlugin: ${err.message}`);
        throw err;
      }
    });
  }
};

// tsup.config.ts
var peerDependencies = Object.keys(package_default.peerDependencies || {});
var dependencies = Object.keys(package_default.dependencies || {});
var tsup_config_default = defineConfig(async () => {
  const npmOptions = {
    clean: false,
    // handled by our npm script
    outDir: "dist",
    format: "esm",
    entry: [
      "./src/index.ts",
      "./src/test.ts",
      "./src/item.ts",
      "./src/elements.ts",
      "./src/transformers.ts",
      "./src/loader.ts",
      "./src/shared.ts"
    ],
    external: peerDependencies,
    noExternal: dependencies,
    splitting: true,
    esbuildPlugins: [InlineCSSPlugin],
    sourcemap: true,
    dts: true
    // Disable DTS for meta-package - consumers should import from individual packages
  };
  const cdnEsmOptions = {
    clean: false,
    outDir: "cdn",
    format: "esm",
    entry: {
      index: "./src/index.ts"
    },
    external: void 0,
    noExternal: [/(.*)/],
    splitting: false,
    esbuildPlugins: [InlineCSSPlugin],
    sourcemap: false,
    minify: true,
    dts: false
  };
  const cdnUmdOptions = {
    clean: false,
    outDir: "cdn",
    format: "iife",
    entry: {
      index: "./src/index.ts"
    },
    globalName: "QtiComponents",
    target: "es5",
    external: void 0,
    noExternal: [/(.*)/],
    splitting: false,
    esbuildPlugins: [InlineCSSPlugin],
    sourcemap: false,
    minify: true,
    dts: false
  };
  return [npmOptions, cdnEsmOptions, cdnUmdOptions];
});
export {
  tsup_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidHN1cC5jb25maWcudHMiLCAicGFja2FnZS5qc29uIiwgIi4uLy4uL3NjcmlwdHMvaW5saW5lLWNzcy1wbHVnaW4uanMiLCAiLi4vLi4vcG9zdGNzcy5jb25maWcubWpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX2luamVjdGVkX2ZpbGVuYW1lX18gPSBcIi9Vc2Vycy9wYXRyaWNra2xlaW4vUHJvamVjdHMvUVRJL1FUSS1Db21wb25lbnRzL3BhY2thZ2VzL3F0aS1jb21wb25lbnRzL3RzdXAuY29uZmlnLnRzXCI7Y29uc3QgX19pbmplY3RlZF9kaXJuYW1lX18gPSBcIi9Vc2Vycy9wYXRyaWNra2xlaW4vUHJvamVjdHMvUVRJL1FUSS1Db21wb25lbnRzL3BhY2thZ2VzL3F0aS1jb21wb25lbnRzXCI7Y29uc3QgX19pbmplY3RlZF9pbXBvcnRfbWV0YV91cmxfXyA9IFwiZmlsZTovLy9Vc2Vycy9wYXRyaWNra2xlaW4vUHJvamVjdHMvUVRJL1FUSS1Db21wb25lbnRzL3BhY2thZ2VzL3F0aS1jb21wb25lbnRzL3RzdXAuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndHN1cCc7XG5pbXBvcnQgeyBnbG9iYnkgfSBmcm9tICdnbG9iYnknO1xuXG5pbXBvcnQgcGtnSnNvbiBmcm9tICcuL3BhY2thZ2UuanNvbicgYXNzZXJ0IHsgdHlwZTogJ2pzb24nIH07XG5pbXBvcnQgeyBJbmxpbmVDU1NQbHVnaW4gfSBmcm9tICcuLi8uLi9zY3JpcHRzL2lubGluZS1jc3MtcGx1Z2luJztcblxuaW1wb3J0IHR5cGUgeyBPcHRpb25zIH0gZnJvbSAndHN1cCc7XG5cbmNvbnN0IHBlZXJEZXBlbmRlbmNpZXMgPSBPYmplY3Qua2V5cyhwa2dKc29uLnBlZXJEZXBlbmRlbmNpZXMgfHwge30pO1xuY29uc3QgZGVwZW5kZW5jaWVzID0gT2JqZWN0LmtleXMocGtnSnNvbi5kZXBlbmRlbmNpZXMgfHwge30pO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoYXN5bmMgKCkgPT4ge1xuICBjb25zdCBucG1PcHRpb25zOiBPcHRpb25zID0ge1xuICAgIGNsZWFuOiBmYWxzZSwgLy8gaGFuZGxlZCBieSBvdXIgbnBtIHNjcmlwdFxuICAgIG91dERpcjogJ2Rpc3QnLFxuICAgIGZvcm1hdDogJ2VzbScsXG4gICAgZW50cnk6IFtcbiAgICAgICcuL3NyYy9pbmRleC50cycsXG4gICAgICAnLi9zcmMvdGVzdC50cycsXG4gICAgICAnLi9zcmMvaXRlbS50cycsXG4gICAgICAnLi9zcmMvZWxlbWVudHMudHMnLFxuICAgICAgJy4vc3JjL3RyYW5zZm9ybWVycy50cycsXG4gICAgICAnLi9zcmMvbG9hZGVyLnRzJyxcbiAgICAgICcuL3NyYy9zaGFyZWQudHMnXG4gICAgXSxcbiAgICBleHRlcm5hbDogcGVlckRlcGVuZGVuY2llcyxcbiAgICBub0V4dGVybmFsOiBkZXBlbmRlbmNpZXMsXG5cbiAgICBzcGxpdHRpbmc6IHRydWUsXG4gICAgZXNidWlsZFBsdWdpbnM6IFtJbmxpbmVDU1NQbHVnaW5dLFxuICAgIHNvdXJjZW1hcDogdHJ1ZSxcbiAgICBkdHM6IHRydWUgLy8gRGlzYWJsZSBEVFMgZm9yIG1ldGEtcGFja2FnZSAtIGNvbnN1bWVycyBzaG91bGQgaW1wb3J0IGZyb20gaW5kaXZpZHVhbCBwYWNrYWdlc1xuICB9O1xuXG4gIC8vIENETiBidWlsZCAoRVNNLCBidW5kbGVkIGRlcHMpXG4gIGNvbnN0IGNkbkVzbU9wdGlvbnM6IE9wdGlvbnMgPSB7XG4gICAgY2xlYW46IGZhbHNlLFxuICAgIG91dERpcjogJ2NkbicsXG4gICAgZm9ybWF0OiAnZXNtJyxcbiAgICBlbnRyeToge1xuICAgICAgaW5kZXg6ICcuL3NyYy9pbmRleC50cydcbiAgICB9LFxuICAgIGV4dGVybmFsOiB1bmRlZmluZWQsXG4gICAgbm9FeHRlcm5hbDogWy8oLiopL10sXG4gICAgc3BsaXR0aW5nOiBmYWxzZSxcbiAgICBlc2J1aWxkUGx1Z2luczogW0lubGluZUNTU1BsdWdpbl0sXG4gICAgc291cmNlbWFwOiBmYWxzZSxcbiAgICBtaW5pZnk6IHRydWUsXG4gICAgZHRzOiBmYWxzZVxuICB9O1xuXG4gIC8vIENETiBidWlsZCAoVU1EL0dsb2JhbCBmb3IgSlNET00gYW5kIGJyb3dzZXIgZW52aXJvbm1lbnRzKVxuICBjb25zdCBjZG5VbWRPcHRpb25zOiBPcHRpb25zID0ge1xuICAgIGNsZWFuOiBmYWxzZSxcbiAgICBvdXREaXI6ICdjZG4nLFxuICAgIGZvcm1hdDogJ2lpZmUnLFxuICAgIGVudHJ5OiB7XG4gICAgICBpbmRleDogJy4vc3JjL2luZGV4LnRzJ1xuICAgIH0sXG4gICAgZ2xvYmFsTmFtZTogJ1F0aUNvbXBvbmVudHMnLFxuICAgIHRhcmdldDogJ2VzNScsXG4gICAgZXh0ZXJuYWw6IHVuZGVmaW5lZCxcbiAgICBub0V4dGVybmFsOiBbLyguKikvXSxcbiAgICBzcGxpdHRpbmc6IGZhbHNlLFxuICAgIGVzYnVpbGRQbHVnaW5zOiBbSW5saW5lQ1NTUGx1Z2luXSxcbiAgICBzb3VyY2VtYXA6IGZhbHNlLFxuICAgIG1pbmlmeTogdHJ1ZSxcbiAgICBkdHM6IGZhbHNlXG4gIH07XG5cbiAgcmV0dXJuIFtucG1PcHRpb25zLCBjZG5Fc21PcHRpb25zLCBjZG5VbWRPcHRpb25zXTtcbn0pO1xuIiwgIntcbiAgICBcIm5hbWVcIjogXCJAcXRpLWNvbXBvbmVudHMvY29tcG9uZW50c1wiLFxuICAgIFwidmVyc2lvblwiOiBcIjEuMC4wXCIsXG4gICAgXCJkZXNjcmlwdGlvblwiOiBcIlFUSSBjb21wb25lbnQgdXRpbGl0aWVzXCIsXG4gICAgXCJtYWluXCI6IFwiZGlzdC9pbmRleC5qc1wiLFxuICAgIFwic2NyaXB0c1wiOiB7XG4gICAgICAgIFwiYnVpbGRcIjogXCJ0c3VwXCIsXG4gICAgICAgIFwiY2xlYW5cIjogXCJybSAtcmYgZGlzdCBjZG5cIixcbiAgICAgICAgXCJ0ZXN0XCI6IFwiZWNobyBcXFwiRXJyb3I6IG5vIHRlc3Qgc3BlY2lmaWVkXFxcIiAmJiBleGl0IDFcIlxuICAgIH0sXG4gICAgXCJrZXl3b3Jkc1wiOiBbXG4gICAgICAgIFwicXRpXCIsXG4gICAgICAgIFwiY29tcG9uZW50c1wiXG4gICAgXSxcbiAgICBcImF1dGhvclwiOiBcIlwiLFxuICAgIFwidHlwZVwiOiBcIm1vZHVsZVwiLFxuICAgIFwic2lkZUVmZmVjdHNcIjogW1xuICAgICAgICBcIi4vZGlzdC8qKi8qLmNzc1wiXG4gICAgXSxcbiAgICBcImxpY2Vuc2VcIjogXCJHUEwtMy4wLW9ubHlcIixcbiAgICBcImV4cG9ydHNcIjoge1xuICAgICAgICBcIi5cIjoge1xuICAgICAgICAgICAgXCJpbXBvcnRcIjogXCIuL2Rpc3QvaW5kZXguanNcIlxuICAgICAgICB9LFxuICAgICAgICBcIi4vZXhwb3J0cy8qXCI6IHtcbiAgICAgICAgICAgIFwiaW1wb3J0XCI6IFwiLi9kaXN0L3NoYXJlZC8qXCJcbiAgICAgICAgfSxcbiAgICAgICAgXCIuL3F0aS1lbGVtZW50c1wiOiB7XG4gICAgICAgICAgICBcImltcG9ydFwiOiBcIi4vZGlzdC9xdGktZWxlbWVudHMuanNcIlxuICAgICAgICB9LFxuICAgICAgICBcIi4vcXRpLWludGVyYWN0aW9uc1wiOiB7XG4gICAgICAgICAgICBcImltcG9ydFwiOiBcIi4vZGlzdC9xdGktaW50ZXJhY3Rpb25zLmpzXCJcbiAgICAgICAgfSxcbiAgICAgICAgXCIuL3F0aS1pdGVtXCI6IHtcbiAgICAgICAgICAgIFwiaW1wb3J0XCI6IFwiLi9kaXN0L2l0ZW0uanNcIlxuICAgICAgICB9LFxuICAgICAgICBcIi4vcXRpLXRlc3RcIjoge1xuICAgICAgICAgICAgXCJpbXBvcnRcIjogXCIuL2Rpc3QvdGVzdC5qc1wiXG4gICAgICAgIH0sXG4gICAgICAgIFwiLi9xdGktbG9hZGVyXCI6IHtcbiAgICAgICAgICAgIFwiaW1wb3J0XCI6IFwiLi9kaXN0L2xvYWRlci5qc1wiXG4gICAgICAgIH0sXG4gICAgICAgIFwiLi9xdGktdHJhbnNmb3JtZXJzXCI6IHtcbiAgICAgICAgICAgIFwiaW1wb3J0XCI6IFwiLi9kaXN0L3F0aS10cmFuc2Zvcm1lcnMuanNcIlxuICAgICAgICB9LFxuICAgICAgICBcIi4vY3VzdG9tRWxlbWVudHNcIjogXCIuL2N1c3RvbS1lbGVtZW50cy5qc29uXCIsXG4gICAgICAgIFwiLi9pdGVtLmNzc1wiOiBcIi4vZGlzdC9pdGVtLmNzc1wiLFxuICAgICAgICBcIi4vY2RuLypcIjogXCIuL2Nkbi8qXCIsXG4gICAgICAgIFwiLi9wYWNrYWdlLmpzb25cIjogXCIuL3BhY2thZ2UuanNvblwiXG4gICAgfSxcbiAgICBcImZpbGVzXCI6IFtcbiAgICAgICAgXCJkaXN0XCIsXG4gICAgICAgIFwiY2RuXCIsXG4gICAgICAgIFwiY3VzdG9tLWVsZW1lbnRzLmpzb25cIlxuICAgIF0sXG4gICAgXCJkZXBlbmRlbmNpZXNcIjoge1xuICAgICAgICBcIkBxdGktY29tcG9uZW50cy90ZXN0XCI6IFwid29ya3NwYWNlOipcIixcbiAgICAgICAgXCJAcXRpLWNvbXBvbmVudHMvaXRlbVwiOiBcIndvcmtzcGFjZToqXCIsXG4gICAgICAgIFwiQHF0aS1jb21wb25lbnRzL2VsZW1lbnRzXCI6IFwid29ya3NwYWNlOipcIixcbiAgICAgICAgXCJAcXRpLWNvbXBvbmVudHMvdHJhbnNmb3JtZXJzXCI6IFwid29ya3NwYWNlOipcIixcbiAgICAgICAgXCJAcXRpLWNvbXBvbmVudHMvaW50ZXJhY3Rpb25zXCI6IFwid29ya3NwYWNlOipcIixcbiAgICAgICAgXCJAcXRpLWNvbXBvbmVudHMvbG9hZGVyXCI6IFwid29ya3NwYWNlOipcIixcbiAgICAgICAgXCJAcXRpLWNvbXBvbmVudHMvc2hhcmVkXCI6IFwid29ya3NwYWNlOipcIlxuICAgIH0sXG4gICAgXCJwZWVyRGVwZW5kZW5jaWVzXCI6IHtcbiAgICAgICAgXCJAaGV4aW1hbC90ZW1wbGF0ZXNcIjogXCJeMC4xLjVcIixcbiAgICAgICAgXCJAbGl0L2NvbnRleHRcIjogXCJeMS4xLjNcIixcbiAgICAgICAgXCJsaXRcIjogXCJeMy4yLjFcIlxuICAgIH1cbn0iLCAiY29uc3QgX19pbmplY3RlZF9maWxlbmFtZV9fID0gXCIvVXNlcnMvcGF0cmlja2tsZWluL1Byb2plY3RzL1FUSS9RVEktQ29tcG9uZW50cy9zY3JpcHRzL2lubGluZS1jc3MtcGx1Z2luLmpzXCI7Y29uc3QgX19pbmplY3RlZF9kaXJuYW1lX18gPSBcIi9Vc2Vycy9wYXRyaWNra2xlaW4vUHJvamVjdHMvUVRJL1FUSS1Db21wb25lbnRzL3NjcmlwdHNcIjtjb25zdCBfX2luamVjdGVkX2ltcG9ydF9tZXRhX3VybF9fID0gXCJmaWxlOi8vL1VzZXJzL3BhdHJpY2trbGVpbi9Qcm9qZWN0cy9RVEkvUVRJLUNvbXBvbmVudHMvc2NyaXB0cy9pbmxpbmUtY3NzLXBsdWdpbi5qc1wiOy8qIGVzbGludC1kaXNhYmxlIG5vLXVuZGVmICovXG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xuaW1wb3J0IHsgam9pbiB9IGZyb20gJ3BhdGgnO1xuXG5pbXBvcnQgcG9zdGNzcyBmcm9tICdwb3N0Y3NzJztcblxuaW1wb3J0IHBvc3Rjc3NDb25maWcgZnJvbSAnLi4vcG9zdGNzcy5jb25maWcubWpzJztcbmNvbnN0IGlubGluZV9pZCA9ICc/aW5saW5lJztcblxuZXhwb3J0IGNvbnN0IElubGluZUNTU1BsdWdpbiA9IHtcbiAgbmFtZTogJ2lubGluZS1jc3MnLFxuICBzZXR1cCh7IG9uUmVzb2x2ZSwgb25Mb2FkIH0pIHtcbiAgICAvLyBSZXNvbHZlIENTUyBmaWxlcyBlbmRpbmcgd2l0aCA/aW5saW5lXG4gICAgb25SZXNvbHZlKHsgZmlsdGVyOiAvXFwuY3NzXFw/aW5saW5lJC8gfSwgYXJncyA9PiAoe1xuICAgICAgbmFtZXNwYWNlOiAnaW5saW5lJyxcbiAgICAgIHBhdGg6IGFyZ3MucGF0aCxcbiAgICAgIHBsdWdpbkRhdGE6IHsgcmVzb2x2ZURpcjogYXJncy5yZXNvbHZlRGlyIH1cbiAgICB9KSk7XG5cbiAgICAvLyBMb2FkIHRoZSByZXNvbHZlZCBDU1MgZmlsZSBhbmQgcHJvY2VzcyBpdFxuICAgIG9uTG9hZCh7IGZpbHRlcjogLy4qLywgbmFtZXNwYWNlOiAnaW5saW5lJyB9LCBhc3luYyBhcmdzID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGltcG9ydFBhdGggPSBhcmdzLnBhdGguc2xpY2UoMCwgLWlubGluZV9pZC5sZW5ndGgpOyAvLyBSZW1vdmUgdGhlID9pbmxpbmUgc3VmZml4XG4gICAgICAgIGxldCBjc3NGdWxsUGF0aDtcblxuICAgICAgICBpZiAoaW1wb3J0UGF0aC5zdGFydHNXaXRoKCcuJykpIHtcbiAgICAgICAgICAvLyBSZXNvbHZlIHJlbGF0aXZlIHBhdGhzXG4gICAgICAgICAgY3NzRnVsbFBhdGggPSBqb2luKGFyZ3MucGx1Z2luRGF0YS5yZXNvbHZlRGlyLCBpbXBvcnRQYXRoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBSZXNvbHZlIE5vZGUgbW9kdWxlIHBhdGhzXG4gICAgICAgICAgY29uc3Qgc2VnbWVudHMgPSBpbXBvcnRQYXRoLnNwbGl0KCcvJyk7XG4gICAgICAgICAgbGV0IHBhY2thZ2VOYW1lO1xuXG4gICAgICAgICAgLy8gQ2hlY2sgaWYgaXQgaXMgYSBzY29wZWQgcGFja2FnZSAoc3RhcnRzIHdpdGggQClcbiAgICAgICAgICBpZiAoc2VnbWVudHNbMF0uc3RhcnRzV2l0aCgnQCcpKSB7XG4gICAgICAgICAgICBwYWNrYWdlTmFtZSA9IGAke3NlZ21lbnRzWzBdfS8ke3NlZ21lbnRzWzFdfWA7IC8vIGUuZy4sIEBjaXRvbGFiL3F0aS1jb21wb25lbnRzXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBhY2thZ2VOYW1lID0gc2VnbWVudHNbMF07IC8vIGUuZy4sIGxvZGFzaFxuICAgICAgICAgIH1cblxuICAgICAgICAgIGNvbnN0IG1vZHVsZVBhdGggPSBqb2luKHByb2Nlc3MuY3dkKCksICdub2RlX21vZHVsZXMnLCBwYWNrYWdlTmFtZSk7XG4gICAgICAgICAgY29uc3QgcGFja2FnZUpzb25QYXRoID0gam9pbihtb2R1bGVQYXRoLCAncGFja2FnZS5qc29uJyk7XG5cbiAgICAgICAgICAvLyBSZWFkIHRoZSBwYWNrYWdlLmpzb24gb2YgdGhlIHNwZWNpZmljIHBhY2thZ2VcbiAgICAgICAgICBpZiAoIWZzLmV4aXN0c1N5bmMocGFja2FnZUpzb25QYXRoKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBwYWNrYWdlLmpzb24gbm90IGZvdW5kIGZvciAke3BhY2thZ2VOYW1lfSBpbiAke21vZHVsZVBhdGh9YCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IHBhY2thZ2VKc29uID0gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMocGFja2FnZUpzb25QYXRoLCAndXRmOCcpKTtcbiAgICAgICAgICBjb25zdCBleHBvcnRzTWFwID0gcGFja2FnZUpzb24uZXhwb3J0cyB8fCB7fTtcblxuICAgICAgICAgIC8vIERlcml2ZSB0aGUgaW1wb3J0IGtleSAoZS5nLiwgJy4vaXRlbS5jc3MnKVxuICAgICAgICAgIGNvbnN0IGltcG9ydEtleSA9IGAuJHtpbXBvcnRQYXRoLnNsaWNlKHBhY2thZ2VOYW1lLmxlbmd0aCl9YDtcbiAgICAgICAgICBjb25zdCByZXNvbHZlZFBhdGggPSBleHBvcnRzTWFwW2ltcG9ydEtleV07XG5cbiAgICAgICAgICBpZiAocmVzb2x2ZWRQYXRoKSB7XG4gICAgICAgICAgICBjc3NGdWxsUGF0aCA9IGpvaW4obW9kdWxlUGF0aCwgcmVzb2x2ZWRQYXRoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmFibGUgdG8gcmVzb2x2ZSAke2ltcG9ydEtleX0gaW4gZXhwb3J0cyBtYXAgb2YgJHtwYWNrYWdlTmFtZX1gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBFbnN1cmUgdGhlIHJlc29sdmVkIHBhdGggZXhpc3RzXG4gICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhjc3NGdWxsUGF0aCkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENTUyBmaWxlIG5vdCBmb3VuZDogJHtjc3NGdWxsUGF0aH1gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlYWQgYW5kIHByb2Nlc3MgdGhlIENTUyBjb250ZW50XG4gICAgICAgIGNvbnN0IGNzc0NvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoY3NzRnVsbFBhdGgsICd1dGY4Jyk7XG4gICAgICAgIGNvbnN0IHByb2Nlc3NSZXN1bHQgPSBhd2FpdCBwb3N0Y3NzKHBvc3Rjc3NDb25maWc/LnBsdWdpbnMgfHwgW10pLnByb2Nlc3MoY3NzQ29udGVudCwge1xuICAgICAgICAgIGZyb206IGNzc0Z1bGxQYXRoLFxuICAgICAgICAgIHRvOiB1bmRlZmluZWRcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBjb250ZW50czogcHJvY2Vzc1Jlc3VsdC5jc3MsIC8vIFVzZSBwcm9jZXNzZWQgQ1NTIGNvbnRlbnRcbiAgICAgICAgICBsb2FkZXI6ICd0ZXh0JyAvLyBJbmxpbmUgYXMgdGV4dFxuICAgICAgICB9O1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yIGluIElubGluZUNTU1BsdWdpbjogJHtlcnIubWVzc2FnZX1gKTtcbiAgICAgICAgdGhyb3cgZXJyOyAvLyBSZS10aHJvdyB0aGUgZXJyb3IgZm9yIEVTQnVpbGQgdG8gaGFuZGxlXG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn07XG4iLCAiY29uc3QgX19pbmplY3RlZF9maWxlbmFtZV9fID0gXCIvVXNlcnMvcGF0cmlja2tsZWluL1Byb2plY3RzL1FUSS9RVEktQ29tcG9uZW50cy9wb3N0Y3NzLmNvbmZpZy5tanNcIjtjb25zdCBfX2luamVjdGVkX2Rpcm5hbWVfXyA9IFwiL1VzZXJzL3BhdHJpY2trbGVpbi9Qcm9qZWN0cy9RVEkvUVRJLUNvbXBvbmVudHNcIjtjb25zdCBfX2luamVjdGVkX2ltcG9ydF9tZXRhX3VybF9fID0gXCJmaWxlOi8vL1VzZXJzL3BhdHJpY2trbGVpbi9Qcm9qZWN0cy9RVEkvUVRJLUNvbXBvbmVudHMvcG9zdGNzcy5jb25maWcubWpzXCI7aW1wb3J0IGF1dG9wcmVmaXhlciBmcm9tICdhdXRvcHJlZml4ZXInO1xuaW1wb3J0IHBvc3Rjc3NBcHBseSBmcm9tICdwb3N0Y3NzLWNsYXNzLWFwcGx5L2Rpc3QvaW5kZXguanMnO1xuaW1wb3J0IHBvc3Rjc3NJbXBvcnQgZnJvbSAncG9zdGNzcy1pbXBvcnQnO1xuLy8gaW1wb3J0IHBvc3Rjc3NOZXN0ZWQgZnJvbSAncG9zdGNzcy1uZXN0ZWQnO1xuZXhwb3J0IGRlZmF1bHQge1xuICBwbHVnaW5zOiBbXG4gICAgcG9zdGNzc0ltcG9ydCgpLCAvLyBUaGlzIHNob3VsZCBiZSBmaXJzdFxuICAgIC8vIHBvc3Rjc3NOZXN0ZWQoKSxcbiAgICBwb3N0Y3NzQXBwbHkoKSxcbiAgICBhdXRvcHJlZml4ZXIoKVxuICBdXG59O1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFtVyxTQUFTLG9CQUFvQjs7O0FDQWhZO0FBQUEsRUFDSSxNQUFRO0FBQUEsRUFDUixTQUFXO0FBQUEsRUFDWCxhQUFlO0FBQUEsRUFDZixNQUFRO0FBQUEsRUFDUixTQUFXO0FBQUEsSUFDUCxPQUFTO0FBQUEsSUFDVCxPQUFTO0FBQUEsSUFDVCxNQUFRO0FBQUEsRUFDWjtBQUFBLEVBQ0EsVUFBWTtBQUFBLElBQ1I7QUFBQSxJQUNBO0FBQUEsRUFDSjtBQUFBLEVBQ0EsUUFBVTtBQUFBLEVBQ1YsTUFBUTtBQUFBLEVBQ1IsYUFBZTtBQUFBLElBQ1g7QUFBQSxFQUNKO0FBQUEsRUFDQSxTQUFXO0FBQUEsRUFDWCxTQUFXO0FBQUEsSUFDUCxLQUFLO0FBQUEsTUFDRCxRQUFVO0FBQUEsSUFDZDtBQUFBLElBQ0EsZUFBZTtBQUFBLE1BQ1gsUUFBVTtBQUFBLElBQ2Q7QUFBQSxJQUNBLGtCQUFrQjtBQUFB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
