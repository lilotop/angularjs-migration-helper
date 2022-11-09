import { ServicesUsage } from './servicesUsage';

let servicesUsage = new ServicesUsage('../../application/webapp/src');
servicesUsage.findUsagesInSubPath('../../application/webapp/src/app/magellan');
