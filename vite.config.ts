import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const config = defineConfig({
  plugins: [
    devtools(),
    nitro(),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart({
      serverFns: {
        // A server function's id appears in the request path, and otel.mjs
        // derives the telemetry event name from that path. The default id is a
        // content hash, so every action reached the dashboard looking like
        // "heatmap.data.60742741eb0f602598c75a72112f5909..." -- telemetry you
        // pay for and cannot read. Naming them after the file and function
        // turns the same data into "heatmap.data.useStudentSchedules-createStudentSchedule".
        //
        // The filename is part of the id because several hooks export the same
        // function name (createChangeGroup, deleteChangeGroup, renameChangeGroup,
        // getAllChangeGroups all appear twice) and ids have to be unique.
        generateFunctionId: ({ filename, functionName }) => {
          const file = filename
            .replace(/^.*[\\/]/, '')
            .replace(/\.[cm]?[jt]sx?$/, '')
          return `${file}-${functionName}`.replace(/[^\w-]/g, '')
        },
      },
    }),
    viteReact(),
  ],
})

export default config
