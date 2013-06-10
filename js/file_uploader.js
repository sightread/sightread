function load_file_into_memory (event) {

  // Guarantee File APIs are supported before we try to use them
  // #todo probably replace with modernizr calls
  if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
    console.log("Browser does not support HTML5 File APIs");
    return;
  }

  // List of files selected in the input box
  var files = event.target.files;

  // Ensure there's at least one file uploaded
  if (files.length == 0) {
    console.log("No file uploaded");
    return;
  }

  // We only care about one uploaded file, so grab that and ignore the others
  var song = files[0];

  // Song metadata looks like:
  // song.name, song.type, song.size, song.lastModifiedDate

  // Initialize contents to null so we can properly block below
  var contents = null;

  // Grab song contents asynchronously
  var reader = new FileReader();
  reader.onload = (function (song_file) {
    return function (e) {
      contents = e.target.result.readAsBinaryString();
    };
  })(song);

  // Block until we actually have song contents, then return
  // #todo deadmans switch to avoid infinite loop
  while (contents == null);

  return contents;
}
