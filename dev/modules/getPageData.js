var fetch = require('node-fetch');
var fs = require('fs');

module.exports = (function(){
  /**
   * Retrieve page data from either the local file system OR a HTTP endpoint
   * @function retrieveData
   * @param {string} pageType - 'homepage' || 'listing' || 'gallery'
   * @param {object} [options.galleryId] - The unique id of the gallery being viewed
   */
  function retrieveData(pageType, options){
    // Since galleries are nested, path to the dynamic gallery mapping
    if(pageType === 'galleries'){
      pageType += '/' + options.clientName + '/' + options.projectName;
    }

    return getDataViaFS('./dev/data/' + pageType + '.json');
  }

  /**
   * Retrieve page data from the File System 
   * @function getDataViaFS
   * @param {string} url - The file path to the local JSON file
   * @return {object} - The JSON data for the requested page
   */
  function getDataViaFS(url){
    return JSON.parse(fs.readFileSync(url));
  }

  return {
    retrieveData: retrieveData
  }
}());