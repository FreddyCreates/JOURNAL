/* Voice Forge — EXT-009 Background Service Worker */

const PHI = 1.618033988749895;
const GOLDEN_ANGLE = 137.508;
const HEARTBEAT = 873;

class VoiceForgeEngine {
  constructor() {
    this.engines = {
      whisper: {
        langs: ['en', 'es', 'fr', 'de', 'ja', 'zh', 'ko', 'pt', 'ru', 'ar'],
        models: ['tiny', 'base', 'small', 'medium', 'large']
      },
      elevenlabs: {
        voices: ['rachel', 'drew', 'clyde', 'paul', 'domi'],
        styles: ['neutral', 'cheerful', 'sad', 'angry', 'whispering', 'narration']
      },
      suno: {
        genres: ['pop', 'rock', 'jazz', 'classical', 'electronic', 'hip-hop', 'ambient'],
        moods: ['happy', 'melancholic', 'energetic', 'calm', 'dark', 'uplifting']
      }
    };

    this.audioBuffers = new Map();
    this.voiceProfiles = new Map();
    this.mixHistory = [];
  }

  transcribe(audioData, engine) {
    if (engine === undefined) engine = 'whisper';

    var dataLength = typeof audioData === 'string' ? audioData.length : (audioData && audioData.length) || 1024;
    var estimatedDuration = (dataLength / 16000) * PHI;
    var wordCount = Math.max(1, Math.floor(estimatedDuration * 2.5));
    var segmentCount = Math.max(1, Math.ceil(wordCount / 8));
    var segments = [];
    var segmentDuration = estimatedDuration / segmentCount;
    var words = [];

    for (var i = 0; i < wordCount; i++) {
      words.push('word_' + i);
    }

    var fullText = words.join(' ');
    var wordsPerSegment = Math.ceil(wordCount / segmentCount);

    for (var s = 0; s < segmentCount; s++) {
      var start = s * segmentDuration;
      var end = Math.min((s + 1) * segmentDuration, estimatedDuration);
      var segWords = words.slice(s * wordsPerSegment, (s + 1) * wordsPerSegment);
      var confidence = 0.85 + (Math.sin(s * GOLDEN_ANGLE * Math.PI / 180) * 0.1);
      confidence = Math.min(0.99, Math.max(0.7, confidence));

      segments.push({
        start: Math.round(start * 1000) / 1000,
        end: Math.round(end * 1000) / 1000,
        text: segWords.join(' '),
        confidence: Math.round(confidence * 1000) / 1000
      });
    }

    var detectedLang = this.engines.whisper.langs[
      Math.floor((dataLength * PHI) % this.engines.whisper.langs.length)
    ];

    return {
      text: fullText,
      segments: segments,
      language: detectedLang,
      duration: Math.round(estimatedDuration * 1000) / 1000,
      engine: engine,
      wordCount: wordCount
    };
  }

  synthesize(text, voice, engine) {
    if (voice === undefined) voice = 'default';
    if (engine === undefined) engine = 'elevenlabs';

    var speechRate = 150;
    var duration = this._estimateSpeechDuration(text, speechRate);
    var baseFreq = 220;

    if (voice === 'rachel') baseFreq = 260;
    else if (voice === 'drew') baseFreq = 180;
    else if (voice === 'clyde') baseFreq = 140;
    else if (voice === 'paul') baseFreq = 160;
    else if (voice === 'domi') baseFreq = 240;

    var phiHarmonics = this._computePhiHarmonics(baseFreq);

    var sentenceCount = (text.match(/[.!?]+/g) || []).length || 1;
    var pitchContour = [];
    for (var i = 0; i < sentenceCount; i++) {
      pitchContour.push({
        position: i / sentenceCount,
        pitch: baseFreq * (1 + Math.sin(i * PHI) * 0.15)
      });
    }

    var audioId = 'synth_' + Date.now() + '_' + Math.floor(Math.random() * HEARTBEAT);
    this.audioBuffers.set(audioId, {
      text: text,
      voice: voice,
      created: Date.now()
    });

    return {
      audioId: audioId,
      duration: Math.round(duration * 1000) / 1000,
      sampleRate: 44100,
      voice: voice,
      engine: engine,
      prosody: {
        pitch: Math.round(baseFreq * 100) / 100,
        rate: speechRate,
        volume: 0.85
      },
      phiHarmonics: phiHarmonics
    };
  }

  generateMusic(prompt, duration, engine) {
    if (duration === undefined) duration = 30;
    if (engine === undefined) engine = 'suno';

    var promptLower = (prompt || '').toLowerCase();
    var detectedGenre = 'pop';
    var detectedMood = 'happy';
    var bpm = 120;

    var genres = this.engines.suno.genres;
    for (var g = 0; g < genres.length; g++) {
      if (promptLower.indexOf(genres[g]) !== -1) {
        detectedGenre = genres[g];
        break;
      }
    }

    var moods = this.engines.suno.moods;
    for (var m = 0; m < moods.length; m++) {
      if (promptLower.indexOf(moods[m]) !== -1) {
        detectedMood = moods[m];
        break;
      }
    }

    var tempoMatch = promptLower.match(/(\d+)\s*bpm/);
    if (tempoMatch) {
      bpm = parseInt(tempoMatch[1], 10);
    } else {
      if (detectedGenre === 'ambient') bpm = 80;
      else if (detectedGenre === 'electronic') bpm = 128;
      else if (detectedGenre === 'hip-hop') bpm = 90;
      else if (detectedGenre === 'jazz') bpm = 110;
      else if (detectedGenre === 'rock') bpm = 130;
      else if (detectedGenre === 'classical') bpm = 100;
    }

    var keys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    var keyIndex = Math.floor((prompt.length * PHI) % keys.length);
    var musicalKey = keys[keyIndex] + (prompt.length % 2 === 0 ? ' major' : ' minor');

    var introDur = duration / (1 + PHI + PHI * PHI + PHI);
    var verseDur = introDur * PHI;
    var chorusDur = introDur * PHI * PHI;
    var outroDur = introDur;
    var totalSections = introDur + verseDur + chorusDur + outroDur;
    var scale = duration / totalSections;

    introDur *= scale;
    verseDur *= scale;
    chorusDur *= scale;
    outroDur *= scale;

    var structure = [
      { section: 'intro', start: 0, end: Math.round(introDur * 100) / 100 },
      { section: 'verse', start: Math.round(introDur * 100) / 100, end: Math.round((introDur + verseDur) * 100) / 100 },
      { section: 'chorus', start: Math.round((introDur + verseDur) * 100) / 100, end: Math.round((introDur + verseDur + chorusDur) * 100) / 100 },
      { section: 'outro', start: Math.round((introDur + verseDur + chorusDur) * 100) / 100, end: Math.round(duration * 100) / 100 }
    ];

    var trackId = 'track_' + Date.now() + '_' + Math.floor(Math.random() * HEARTBEAT);

    return {
      trackId: trackId,
      duration: duration,
      bpm: bpm,
      key: musicalKey,
      structure: structure,
      genre: detectedGenre,
      mood: detectedMood,
      engine: engine
    };
  }

  voiceClone(samples) {
    var sampleList = Array.isArray(samples) ? samples : [samples];
    var sampleCount = sampleList.length;
    var quality = Math.min(1.0, 0.5 + (sampleCount * 0.1));

    var pitchValues = [];
    for (var i = 0; i < sampleCount; i++) {
      var sampleLen = typeof sampleList[i] === 'string' ? sampleList[i].length : 256;
      pitchValues.push(100 + (sampleLen % 200));
    }

    var avgPitch = pitchValues.reduce(function (a, b) { return a + b; }, 0) / pitchValues.length;
    var pitchMin = Math.min.apply(null, pitchValues);
    var pitchMax = Math.max.apply(null, pitchValues);

    var accents = ['neutral', 'american', 'british', 'australian'];
    var accentIndex = Math.floor((sampleCount * PHI) % accents.length);

    var characteristics = {
      pitchRange: { min: Math.round(pitchMin), max: Math.round(pitchMax), mean: Math.round(avgPitch) },
      timbre: sampleCount > 3 ? 'rich' : 'moderate',
      accent: accents[accentIndex],
      speakingRate: Math.round(130 + (sampleCount * GOLDEN_ANGLE) % 70)
    };

    var estimatedAccuracy = Math.min(0.98, quality * PHI * 0.6);
    var profileId = 'voice_' + Date.now() + '_' + Math.floor(Math.random() * HEARTBEAT);

    this.voiceProfiles.set(profileId, {
      characteristics: characteristics,
      created: Date.now()
    });

    return {
      profileId: profileId,
      characteristics: characteristics,
      quality: Math.round(quality * 1000) / 1000,
      samplesUsed: sampleCount,
      estimatedAccuracy: Math.round(estimatedAccuracy * 1000) / 1000
    };
  }

  audioMix(tracks) {
    var trackList = Array.isArray(tracks) ? tracks : [tracks];
    var trackCount = trackList.length;

    if (trackCount === 0) {
      return { mixId: null, duration: 0, tracks: 0, masterGain: 0, crossfades: [], phiBalance: [] };
    }

    var maxDuration = 0;
    var gains = [];
    for (var i = 0; i < trackCount; i++) {
      var trackDur = (trackList[i] && trackList[i].duration) || 30;
      if (trackDur > maxDuration) maxDuration = trackDur;
      var gain = 1 / (1 + i / PHI);
      gains.push(Math.round(gain * 1000) / 1000);
    }

    var masterGain = gains.reduce(function (a, b) { return a + b; }, 0) / trackCount;

    var crossfades = [];
    for (var c = 0; c < trackCount - 1; c++) {
      var position = maxDuration * ((c + 1) / trackCount);
      var fadeDuration = (maxDuration / trackCount) / PHI;
      crossfades.push({
        position: Math.round(position * 100) / 100,
        duration: Math.round(fadeDuration * 100) / 100
      });
    }

    var phiBalance = [];
    for (var p = 0; p < trackCount; p++) {
      phiBalance.push({
        track: p,
        gain: gains[p],
        pan: Math.round(Math.sin(p * GOLDEN_ANGLE * Math.PI / 180) * 100) / 100
      });
    }

    var mixId = 'mix_' + Date.now() + '_' + Math.floor(Math.random() * HEARTBEAT);
    this.mixHistory.push({ mixId: mixId, trackCount: trackCount, created: Date.now() });

    return {
      mixId: mixId,
      duration: Math.round(maxDuration * 100) / 100,
      tracks: trackCount,
      masterGain: Math.round(masterGain * 1000) / 1000,
      crossfades: crossfades,
      phiBalance: phiBalance
    };
  }

  _computePhiHarmonics(baseFreq) {
    var harmonics = [];
    for (var n = 0; n < 8; n++) {
      harmonics.push({
        n: n,
        frequency: Math.round(baseFreq * Math.pow(PHI, n) * 100) / 100,
        amplitude: Math.round((1 / Math.pow(PHI, n)) * 1000) / 1000
      });
    }
    return harmonics;
  }

  _estimateSpeechDuration(text, rate) {
    var words = text.trim().split(/\s+/).length;
    var pauseCount = (text.match(/[.!?,;:—]/g) || []).length;
    var baseDuration = (words / (rate / 60));
    var pauseDuration = pauseCount * 0.3;
    return baseDuration + pauseDuration;
  }
}

globalThis.voiceForge = new VoiceForgeEngine();

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  var engine = globalThis.voiceForge;
  var action = message && message.action;

  if (action === 'transcribe') {
    var result = engine.transcribe(message.audioData, message.engine);
    sendResponse({ success: true, data: result });
  } else if (action === 'synthesize') {
    var result = engine.synthesize(message.text, message.voice, message.engine);
    sendResponse({ success: true, data: result });
  } else if (action === 'generateMusic') {
    var result = engine.generateMusic(message.prompt, message.duration, message.engine);
    sendResponse({ success: true, data: result });
  } else if (action === 'voiceClone') {
    var result = engine.voiceClone(message.samples);
    sendResponse({ success: true, data: result });
  } else if (action === 'audioMix') {
    var result = engine.audioMix(message.tracks);
    sendResponse({ success: true, data: result });
  }

  return true;
});
