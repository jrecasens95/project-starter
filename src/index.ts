#!/usr/bin/env node

import { runCli } from "./cli/run";

void runCli(process.argv.slice(2));
