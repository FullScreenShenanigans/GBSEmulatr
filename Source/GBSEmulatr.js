// @echo '/// <reference path="ItemsHoldr-0.2.1.ts" />'
// @ifdef INCLUDE_DEFINITIONS
/// <reference path="References/ItemsHoldr-0.2.1.ts" />
/// <reference path="References/WebAudioAPI.d.ts" />
/// <reference path="GBSEmulatr.d.ts" />
// @endif
// @include ../Source/GBSEmulatr.d.ts
// Explanations by Joe!
//library - store a listing of GBS files. Looks like we'll need at least 2. One for the themes, one for 
//           various pokemon sounds and other misc sound effects.
//           In audio.js the gbs data will be stored as a base64 encoded string. Later on, however, we'll
//           decode that and ascii-fy each character to play nicely with the player. 
//           then, GBSEmulatr can interpret 
//                   play("ThemeViridianCity") 
//           as something like
//                   play_music_data(decodedPayload, 10);
//           which our music player understands!
//           Of course, since there will be multiple sound files, we'll need....
//directory - our master lookup table, keyed by song/theme name. Each key will look like (at least, probably
//           going to have to add more stuff later)
//           "Theme_00_Name" : {
//                               "gbsSource" : "blue"
//                               "trackNum"  : 0
//                               }
//           Unfortunately, to save space, I don't think the theme names are included in the .gbs file, so
//           I'll scrape them from somewhere online and include them in audio.js.
var GBSEmulatr;
(function (_GBSEmulatr) {
    "use strict";
    /**
     * An audio library to automate loading and controlled playback of Gameboy audio
     * tracks via the ASM module.
     *
     * @author "Joe Pringle" <explodingp@gmail.com>
     * @author "Josh Goldberg" <josh@fullscreenmario.com>
     */
    var GBSEmulatr = (function () {
        /**
         * @param {IGBSEmulatrSettings} settings
         */
        function GBSEmulatr(settings) {
            if (typeof settings.ItemsHolder === "undefined") {
                throw new Error("No ItemsHolder given to GBSEmulatr.");
            }
            if (typeof settings.Module === "undefined") {
                throw new Error("No Module given to GBSEmulatr.");
            }
            if (typeof settings.library === "undefined") {
                throw new Error("No library given to GBSEmulatr.");
            }
            this.ItemsHolder = settings.ItemsHolder;
            this.Module = settings.Module;
            this.library = settings.library;
            this.context = settings.context || new AudioContext();
            // Initially, the directory is empty, and nothing is playing.
            this.directory = {};
            this.theme = null;
            this.themeNode = null;
            // Decode and ascii-fy all "gbs" library entries.
            this.decodeAll();
        }
        /* Simple gets
        */
        /**
         *
         */
        GBSEmulatr.prototype.getLibrary = function () {
            return this.library;
        };
        /**
         *
         */
        GBSEmulatr.prototype.getDirectory = function () {
            return this.directory;
        };
        /**
         *
         */
        GBSEmulatr.prototype.getTheme = function () {
            return this.theme;
        };
        /**
         *
         */
        GBSEmulatr.prototype.getVolume = function () {
            return this.ItemsHolder.getItem("volume");
        };
        /**
         *
         */
        GBSEmulatr.prototype.getMuted = function () {
        };
        /**
         *
         */
        GBSEmulatr.prototype.getContext = function () {
            return this.context;
        };
        /* Audio functionality
        */
        /**
         *
         */
        GBSEmulatr.prototype.stop = function () {
            if (this.themeNode) {
                this.themeNode.disconnect();
                this.themeNode = null;
            }
        };
        /**
         *
         */
        GBSEmulatr.prototype.clearAll = function () {
        };
        /**
         *
         */
        GBSEmulatr.prototype.setMutedOn = function () {
        };
        /**
         *
         */
        GBSEmulatr.prototype.setMutedOff = function () {
        };
        /**
         * Plays a sound or theme, keyed by track name.
         *
         * @example GBSEmulator.play("openingTheme");
         */
        GBSEmulatr.prototype.play = function (track) {
            // @TODO proper stop function
            if (this.themeNode) {
                this.themeNode.disconnect();
                this.themeNode = null;
            }
            var folder = this.directory[track].gbsSource, payload = this.library[folder].gbs, subtune = this.directory[track].trackNum, 
            // Required for libgme.js
            ref = this.Module.allocate(1, "i32", this.Module.ALLOC_STATIC), emu, node;
            if (this.Module.ccall("gme_open_data", "number", ["array", "number", "number", "number"], [payload, payload.length, ref, this.context.sampleRate])) {
                throw new Error("Could not call gme_open_data.");
            }
            // Determine the type of emulator to use to play this payload.
            emu = this.Module.getValue(ref, "i32");
            if (this.Module.ccall("gme_start_track", "number", ["number", "number"], [emu, subtune])) {
                throw new Error("Could not call gme_start_track.");
            }
            // Actually play the track.
            this.theme = track;
            node = this.playSong(emu);
        };
        /* Internal playing
        */
        /**
         * Private function that ACTUALLY plays the song, in user's current context.
         */
        GBSEmulatr.prototype.playSong = function (emu) {
            var bufferSize = 1024 * 16, inputs = 2, outputs = 2, node, temp, i, n;
            node = this.context.createScriptProcessor(bufferSize, inputs, outputs);
            this.themeNode = node;
            node.onaudioprocess = this.onNodeAudioProcess.bind(this, node, emu);
            node.connect(this.context.destination);
            return node;
        };
        GBSEmulatr.prototype.onNodeAudioProcess = function (node, emu, e) {
            var bufferSize = 1024 * 16, buffer = this.Module.allocate(bufferSize * 2, "i32", this.Module.ALLOC_STATIC), channels, error, temp, i, n;
            if (this.Module.ccall("gme_track_ended", "number", ["number"], [emu]) === 1) {
                // Can put any 'end-of-song' event handlers here, once 
                // GBSEmulatr is more fleshed out.
                node.disconnect();
                this.theme = null;
                return;
            }
            channels = [
                e.outputBuffer.getChannelData(0),
                e.outputBuffer.getChannelData(1)
            ];
            error = this.Module.ccall("gme_play", "number", ["number", "number", "number"], [emu, bufferSize * 2, buffer]);
            if (error) {
                throw new Error("Could not call gme_play.");
            }
            for (i = 0; i < bufferSize; i++) {
                for (n = 0; n < e.outputBuffer.numberOfChannels; n++) {
                    temp = (buffer + (i * e.outputBuffer.numberOfChannels * 2) + (n * 4));
                    channels[n][i] = this.Module.getValue(temp, "i32") / GBSEmulatr.int16Max;
                }
            }
        };
        /* Base loading
        */
        /**
         * Decodes all "gbs" entries in a library. Each entry is replaced with an
         * array of Integers 0-255 representing the decoded ASCII contents. Those
         * are referenced by track name in the main GBSEmulatr directory.
         */
        GBSEmulatr.prototype.decodeAll = function () {
            var i, j;
            for (i in this.library) {
                if (!this.library.hasOwnProperty(i)) {
                    continue;
                }
                this.library[i].gbs = atob(this.library[i].gbs).split("").map(this.firstCharacterCode);
                for (j in this.library[i].tracks) {
                    this.directory[j] = {
                        "gbsSource": i,
                        "trackNum": this.library[i].tracks[j]
                    };
                }
            }
        };
        /**
         * Helper utility that just returns the first character's code in a String.
         */
        GBSEmulatr.prototype.firstCharacterCode = function (str) {
            return str.charCodeAt(0);
        };
        /**
         * General buffer size for audio node buffers.
         */
        GBSEmulatr.bufferSize = 1024 * 16;
        /**
         * Maximum value for an integer, used in channel i32 ccals.
         */
        GBSEmulatr.int16Max = Math.pow(2, 32) - 1;
        return GBSEmulatr;
    })();
    _GBSEmulatr.GBSEmulatr = GBSEmulatr;
})(GBSEmulatr || (GBSEmulatr = {}));
