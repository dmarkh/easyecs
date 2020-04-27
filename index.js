
import { EasyECS } from './src/EasyECS';
import { System } from './src/System';
import { LOG } from './src/Log';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export { EasyECS, System, LOG, sleep };
