#!/usr/bin/env node

import htmlPlugin from "@chialab/esbuild-plugin-html";
import esbuild from "esbuild";
import stylePlugin from "esbuild-style-plugin";
import { nanoid } from "nanoid";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import _yargs from "yargs";
import { hideBin } from "yargs/helpers";

const yargs = _yargs(hideBin(process.argv));

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
// const __dirname = import.meta.dirname; // only node20+

const buildContext = async ({ production, editor }) =>
  await esbuild.context({
    entryPoints: [path.resolve(__dirname, "./src/index.html")].filter(Boolean),
    bundle: true,
    outdir: production
      ? path.resolve(__dirname, "./build")
      : path.resolve(__dirname, "./out"),
    platform: "browser",
    assetNames: "[name]-[hash]",
    chunkNames: "[name]-[hash]",
    loader: {
      // ".html": "copy",
      ".png": "file",
      // ".png": "copy",
      // ".webmanifest": "copy",
    },
    minify: production ?? false,
    plugins: [htmlPlugin()].filter(Boolean),
    legalComments: "external",
    define: {
      "process.env.SW_CACHE_NAME": JSON.stringify(nanoid()), // gera valor único para o build
      "window.IS_SERVE": production ? "false" : "true",
      "window.EDITOR_ENABLED": editor ? "true" : "false",
    },
  });

yargs
  .scriptName("build")
  .command(
    "serve",
    "webdevserver",
    (yargs) => {},
    (argv) => {
      buildContext({ prodution: false, editor: true }).then((ctx) => {
        ctx.serve({
          port: 3000,
          servedir: path.resolve(__dirname, "./out"),
          certfile: path.resolve(__dirname, "./cert.pem"),
          keyfile: path.resolve(__dirname, "./key.pem"),
        });
      });
    }
  )
  .command(
    "build",
    "build",
    (yargs) => {
      yargs
        .boolean("production")
        .alias("p", "production")
        .default("p", true)
        .boolean("editor")
        .default("editor", true);
    },
    (argv) => {
      buildContext(argv).then((ctx) => {
        ctx.rebuild().then(() => {
          ctx.dispose();
        });
      });
    }
  ).argv;
