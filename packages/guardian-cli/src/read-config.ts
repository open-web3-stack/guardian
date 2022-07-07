import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { template } from 'lodash';
import * as dotenv from 'dotenv';

const regex = /#[^*]*?$/gm;

dotenv.config();

export default (path: string) => {
  const data = fs.readFileSync(path, 'utf8');
  // remove all comments
  const configStr = data.replace(regex, '');
  // replace variables
  const config = template(configStr)(process.env);
  return yaml.load(config);
};
