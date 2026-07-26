import fs from 'fs';
import dotenv from 'dotenv';
import yaml from 'yaml';

const envConfig = dotenv.parse(fs.readFileSync('.env'));
fs.writeFileSync('env.yaml', yaml.stringify(envConfig));
console.log('env.yaml generated');
