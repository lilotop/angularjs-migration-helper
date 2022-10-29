import fs from 'fs';
import path from 'path';

function* walkSync(dir: string): Generator<string> {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    if (file.isDirectory()) {
      yield* walkSync(path.join(dir, file.name));
    } else {
      yield path.join(dir, file.name);
    }
  }
}

type Metadata = {
  filePath: string;
  fileType: 'service' | 'component' | 'directive';
  name: string;
  services: [{ name: string; count: number }];
};

function getMetadata(filePath: string): Metadata {
  /*
      1. read file data as string
    
      2.  look for either:
          .component('compName'
          .directive('drvName'
          .service('srvName', funcName)
          place this in meta.name
    
      3.  in services, use the srvFunction for next step, in others, look for:
          controller: funcName
    
      4.  look for `function funcName(srv1, srv2,...)` across lines (get the services string as one group, separate them in code)
    
      5.  for each service name, run a search across all file, use word boundaries to avoid matching User and UserData
      
      TODO - service injection lists may contain newlines
      TODO - files with several components/services/directives ?
      TODO - services with anonymous ARROW function
    */
  const meta: Partial<Metadata> = {
    filePath,
  };
  const buffer = fs.readFileSync(filePath);
  const fileContent = buffer.toString();
  const drvName = /\.directive\(['"](\w+)['"]/;
  const compName = /\.component\(['"](\w+)['"]/;
  const controllerName = /controller\s*:\s*(\w+)/;
  const srvName = /\.service\(['"](\w+)['"]\s*,\s*(\w+)\s*\)/;
  const srvAnon = /\.service\(['"](\w+)['"]\s*,\s*function\s*\(\s*([^)]*)\s*\)/;
  let res;
  let funcName;
  let servicesInjectionList;
  res = fileContent.match(compName);

  function getControllerName() {
    let controller = fileContent.match(controllerName);
    if (controller && controller[1]) {
      return controller[1];
    } else {
      throw new Error(`No controller found in ${filePath}`);
    }
  }

  if (res && res[1]) {
    // component
    meta.fileType = 'component';
    meta.name = res[1];
    funcName = getControllerName();
  } else {
    res = fileContent.match(drvName);
    if (res && res[1]) {
      // directive
      meta.fileType = 'directive';
      meta.name = res[1];
      funcName = getControllerName();
    } else {
      res = fileContent.match(srvName);
      if (res && res[1] && res[2]) {
        // service with func name
        meta.fileType = 'service';
        meta.name = res[1];
        funcName = res[2];
      } else {
        res = fileContent.match(srvAnon);
        if (res && res[1]) {
          // service with anonymous function
          meta.fileType = 'service';
          meta.name = res[1];
          servicesInjectionList = res[2];
        } else {
          // ignored file
          console.log(`File ignored: ${filePath}`);
        }
      }
    }
  }

  if (funcName) {
    // we got funcName, extract injection list
    let regEx = new RegExp(`function ${funcName}\\s*\\(\\s*([^)]*)\\s*\\)`);
    let res = fileContent.match(regEx);
    servicesInjectionList = res && res[1];
  }

  let regex = /([$\w]+)/g;

  console.log(meta);
  console.log(servicesInjectionList?.match(regex));
  return meta as Metadata;
}

// for (const filePath of walkSync('../../application/webapp/src/app/magellan')) {
//   console.log(filePath);
// }
getMetadata(
  // '../../application/webapp/src/app/magellan/alerts/alert-bundle-edit-logic/alert-bundle-edit-logic.drv.js'
  '../../application/webapp/src/app/magellan/alerts/components/magellan-add-alert-or-query/magellan-add-alert-or-query.component.js'
  // '../../application/webapp/src/app/magellan/alerts/security-alerts/security-alerts.srv.js'
  // '../../application/webapp/src/app/common/models/alert.model.js'
);
