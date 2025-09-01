#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';

interface CliArgs {
  inputFiles: string[];
  outputFile: string;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log('PDF Merger v1.0.0');
    console.log('Usage: npm start <input1.pdf> <input2.pdf> ... --output <output.pdf>');
    process.exit(1);
  }
  
  const outputIndex = args.indexOf('--output');
  if (outputIndex === -1 || outputIndex === args.length - 1) {
    console.error('Error: --output flag and filename required');
    process.exit(1);
  }
  
  const inputFiles = args.slice(0, outputIndex);
  const outputFile = args[outputIndex + 1];
  
  return { inputFiles, outputFile };
}

async function main() {
  try {
    const { inputFiles, outputFile } = parseArgs();
    console.log(`Merging ${inputFiles.length} PDF files...`);
    console.log('Input files:', inputFiles.join(', '));
    console.log('Output file:', outputFile);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();