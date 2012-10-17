'.hogan' files in this folder will be compiled to '.js' files. Files in 
subfolders are combined to single files, according to the subfolder name.
Subfolder compile is recursive.
All '.js' files from this folder are removed before each compile.

For example:

hogantemplates/
  |
  |-template.hogan
  |-subfolder/
    |
    |-template.hogan
    |-template2.hogan   

-->

hogantemplates/
  |
  |-template.hogan
  |-template.js     <- single template
  |-subfolder.js    <- multiple templates in an object
  |-subfolder/
    |
    |-template.hogan
    |-template2.hogan 