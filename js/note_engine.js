// class note_engine
function note_engine() {
  var _public  = {}, // Public methods accessible from anywhere
      _private = {}; // Private methods accessible inside the engine

  // Default parameter values to be used if no overriding parameter is given
  _private.default_params = {
    max_notes_per_second:   10, // Max number of notes allowed per second
    max_note_interval:      10, // Max number of notes allowed to leap between notes
    max_distance_from_home: 10  // Max distance from middle C to allow notes
  };

  // Prepare to play a song by loading its MIDI data into memory
  _public.loadSong = function (midi_data) {
    // Load the raw MIDI data into memory
    _private.midi_data = midi_data;
  };

  // Returns all notes that should appear within the next `duration` seconds
  _public.getNotes = function (duration, params) {
    var upcoming_notes = [];

    // logic
    upcoming_notes.push({
      note:      "C",
      appear_as: "C",
      duration:  30,        // ms
      note_type: "quarter",
      velocity:  30         // some unit
    });

    return upcoming_notes;
  };


  // Expose _public methods
  return _public;
}
