var fs = require('fs');
var path = require('path');
var request = require('request');
var https = require('https');
var spawn = require('child_process').spawn

module.exports = function(projectName, theme) {

  var templateIsUrl = /^(http|https)/.test(theme);
  if(templateIsUrl){
    theme = theme.replace('https://github.com/', '');
  }

  var apiUrl = "https://api.github.com/repos/" + theme + "/contents/";

  var options = {
    url: apiUrl,
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.125 Safari/537.' }
  };

  console.log('Fetch theme info...');
  request(options, function(error, response, body) {
    if (error || response.statusCode !== 200) {
      console.log('Error(' + response.statusCode + "): " + error);
      return;
    }
    repoContent = JSON.parse(body);

    var needFiles = [
      'resume.example.yml',
      'index.hbs',
      'style.less',
      'main.coffee',
      'theme.json'
    ];
    var downloadUrls = {};
    for (var i in repoContent) {
      var file = repoContent[i];
      if(needFiles.indexOf(file.name) < 0) {
        continue;
      } else {
        downloadUrls[file.name] = file.download_url;
      }
    }

    var projectDir = path.join(process.cwd(), projectName);
    if (!fs.existsSync(projectDir)){
      fs.mkdirSync(projectDir);
    }

    // Download required documents
    allDownloaded = [];
    for( var fileName in downloadUrls){
      var url = downloadUrls[fileName];

      (function(_fn, _url){
        var promise = new Promise(function (resolve, reject) {
          var dest = path.join(process.cwd(), projectName, _fn);
          var file = fs.createWriteStream(dest);
          var request = https.get(url, function(response){
            response.pipe(file);
            file.on('finish', function() {
              file.close();
              resolve();
            });
          }).on('error', function(err) {
            console.log(_fn + " download failed: " + err);
          });;
        });

        allDownloaded.push(promise);
      })(fileName, url);
    }

    console.log('Waiting for download ' + allDownloaded.length + ' files.....');
    Promise.all(allDownloaded).then(function(){

      console.log('Download successful, install dependencies...');

      // TODO: 复制两个配置文件到项目中
      gulpfileTmpl = path.join(__dirname, 'resources', 'gulpfile.js');
      gulpfile = path.join(process.cwd(), projectName, 'gulpfile.js');
      fs.createReadStream(gulpfileTmpl).pipe(fs.createWriteStream(gulpfile));
      
      packageJsonTmpl = path.join(__dirname, 'resources', 'package.json');
      packageJson = path.join(process.cwd(), projectName, 'package.json');
      fs.createReadStream(packageJsonTmpl).pipe(fs.createWriteStream(packageJson));

      spawn('npm', ['install'], { cwd: projectDir })
        .on('close', function (code) {
          if (code !== 0) {
            console.log('ps process exited with code ' + code);
          }
          console.log("All ready, please complete the configuration file");
        });

    }).catch(function(error){
      console.log('error ' , error);
    });

  });

  return;

}
