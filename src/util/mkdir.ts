const fs = require('fs');
const afs = fs.promises;

export const deleteFolderRecursive = async path => {
  if (fs.existsSync(path)) {
    for (let entry of await afs.readdir(path)) {
      const curPath = path + "/" + entry;
      if ((await afs.lstat(curPath)).isDirectory())
        await deleteFolderRecursive(curPath);
      else await afs.unlink(curPath);
    }
    await afs.rmdir(path);
  }
};