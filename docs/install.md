# Installation

Welcome to the installation guide for our custom command handler. Depending on
whether you're using TypeScript or JavaScript for your Minecraft addon, follow
the steps below to get started quickly.

### TypeScript Users

If you are using TypeScript to build your Minecraft addon, follow these steps:

1. Download the TypeScript file (`.ts`) for our custom command handler.
2. Place the TypeScript file in your project's source folder. This is typically
   named `src` or a folder of your choice for TypeScript source files.
3. Make sure your TypeScript compiler (`tsc`) is configured to include the file
   in your project build. You can do this by adding the file's path to your
   `tsconfig.json` under the `include` or `files` section.
4. Build your TypeScript project using `tsc`. This will compile your project,
   including our custom command handler.
5. You're now ready to import and use the custom command handler in your
   TypeScript project.

### JavaScript Users

If you are using JavaScript for your Minecraft addon, follow these steps:

1. Download the JavaScript file (`.js`) for our custom command handler.
2. Place the JavaScript file in your project's script folder. This is typically
   where your Minecraft addon scripts reside.
3. Import the module in your JavaScript code as shown below:

    ```javascript
    // Import the module
    import { CommandRegistry } from "./path/to/your/script/folder/commands.js";
    ```

4. You're all set! You can now start using the custom command handler in your
   Minecraft addon.

Remember to replace `"./path/to/your/script/folder/commands.js"` with the actual path to the JavaScript file in your project.
