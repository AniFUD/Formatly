export type CategoryType = 'documents' | 'images' | 'audio' | 'video';

export interface FormatEntry {
  id: string;
  label: string;
  ext: string[];
  inputOnly?: boolean;
}

export interface SubcategoryGroup {
  [subcategoryName: string]: FormatEntry[];
}

export interface Registry {
  documents: SubcategoryGroup;
  images: SubcategoryGroup;
  audio: SubcategoryGroup;
  video: SubcategoryGroup;
}

export const registry: Registry = {
  documents: {
    "Text & Word Processing": [
      { id: "txt",  label: "TXT",     ext: ["txt"] },
      { id: "rtf",  label: "RTF",     ext: ["rtf"] },
      { id: "doc",  label: "DOC/DOCX",ext: ["doc", "docx"] },
      { id: "odt",  label: "ODT",     ext: ["odt"] },
      { id: "pages",label: "PAGES",   ext: ["pages"] },
      { id: "wpd",  label: "WPD",     ext: ["wpd"] },
      { id: "md",   label: "MD",      ext: ["md", "markdown"] },
      { id: "tex",  label: "TEX",     ext: ["tex"] }
    ],
    "Portable & Fixed-Layout": [
      { id: "pdf",  label: "PDF",      ext: ["pdf"] },
      { id: "xps",  label: "XPS/OXPS", ext: ["xps", "oxps"] },
      { id: "djvu", label: "DJVU",     ext: ["djvu"] }
    ],
    "Spreadsheets": [
      { id: "xls",     label: "XLS/XLSX", ext: ["xls", "xlsx"] },
      { id: "ods",     label: "ODS",      ext: ["ods"] },
      { id: "numbers", label: "NUMBERS",  ext: ["numbers"] },
      { id: "csv",     label: "CSV/TSV",  ext: ["csv", "tsv"] }
    ],
    "Presentations": [
      { id: "ppt", label: "PPT/PPTX", ext: ["ppt", "pptx"] },
      { id: "odp", label: "ODP",      ext: ["odp"] },
      { id: "key", label: "KEY",      ext: ["key"] }
    ],
    "Markup & Web": [
      { id: "html", label: "HTML/XHTML",     ext: ["html", "htm", "xhtml"] },
      { id: "xml",  label: "XML",            ext: ["xml"] },
      { id: "sgml", label: "SGML",           ext: ["sgml"] },
      { id: "epub", label: "EPUB/MOBI/AZW",  ext: ["epub", "mobi", "azw"] }
    ],
    "Structured Data / Interchange": [
      { id: "json", label: "JSON", ext: ["json"] },
      { id: "yaml", label: "YAML", ext: ["yaml", "yml"] },
      { id: "toml", label: "TOML", ext: ["toml"] },
      { id: "ini",  label: "INI",  ext: ["ini"] }
    ],
    "Notes & Miscellaneous": [
      { id: "one",  label: "ONE",  ext: ["one"] },
      { id: "note", label: "NOTE", ext: ["note"] },
      { id: "org",  label: "ORG",  ext: ["org"] }
    ]
  },
  images: {
    "Raster (Bitmap)": [
      { id: "jpeg", label: "JPEG/JPG", ext: ["jpg", "jpeg"] },
      { id: "png",  label: "PNG",      ext: ["png"] },
      { id: "gif",  label: "GIF",      ext: ["gif"] },
      { id: "bmp",  label: "BMP",      ext: ["bmp"] },
      { id: "tiff", label: "TIFF/TIF", ext: ["tiff", "tif"] },
      { id: "webp", label: "WEBP",     ext: ["webp"] },
      { id: "heic", label: "HEIC/HEIF",ext: ["heic", "heif"] },
      { id: "avif", label: "AVIF",     ext: ["avif"] },
      { id: "jxl",  label: "JXL",      ext: ["jxl"] }
    ],
    "Raw (Camera Sensor)": [
      { id: "raw", label: "RAW",     ext: ["raw"],        inputOnly: true },
      { id: "cr",  label: "CR2/CR3", ext: ["cr2", "cr3"], inputOnly: true },
      { id: "nef", label: "NEF",     ext: ["nef"],        inputOnly: true },
      { id: "arw", label: "ARW",     ext: ["arw"],        inputOnly: true },
      { id: "dng", label: "DNG",     ext: ["dng"] },
      { id: "orf", label: "ORF",     ext: ["orf"],        inputOnly: true },
      { id: "raf", label: "RAF",     ext: ["raf"],        inputOnly: true }
    ],
    "Vector": [
      { id: "svg", label: "SVG", ext: ["svg"] },
      { id: "ai",  label: "AI",  ext: ["ai"] },
      { id: "eps", label: "EPS", ext: ["eps"] },
      { id: "pdf", label: "PDF", ext: ["pdf"] },
      { id: "cdr", label: "CDR", ext: ["cdr"] }
    ],
    "Layered / Editing": [
      { id: "psd", label: "PSD", ext: ["psd"] },
      { id: "xcf", label: "XCF", ext: ["xcf"] },
      { id: "kra", label: "KRA", ext: ["kra"] }
    ],
    "Icons & Specialized": [
      { id: "ico",  label: "ICO",  ext: ["ico"] },
      { id: "icns", label: "ICNS", ext: ["icns"] },
      { id: "cur",  label: "CUR",  ext: ["cur"] }
    ],
    "High Dynamic Range / Scientific": [
      { id: "exr",  label: "EXR",  ext: ["exr"] },
      { id: "hdr",  label: "HDR",  ext: ["hdr"] },
      { id: "fits", label: "FITS", ext: ["fits", "fit"] }
    ],
    "Legacy / Misc": [
      { id: "pcx", label: "PCX",         ext: ["pcx"] },
      { id: "tga", label: "TGA",         ext: ["tga"] },
      { id: "ppm", label: "PPM/PGM/PBM", ext: ["ppm", "pgm", "pbm"] }
    ]
  },
  audio: {
    "Lossy Compressed": [
      { id: "mp3",  label: "MP3",          ext: ["mp3"] },
      { id: "aac",  label: "AAC",          ext: ["aac"] },
      { id: "ogg",  label: "OGG/Vorbis",   ext: ["ogg", "oga"] },
      { id: "opus", label: "OPUS",         ext: ["opus"] },
      { id: "wma",  label: "WMA",          ext: ["wma"] },
      { id: "m4a",  label: "M4A",          ext: ["m4a"] }
    ],
    "Lossless Compressed": [
      { id: "flac", label: "FLAC", ext: ["flac"] },
      { id: "alac", label: "ALAC", ext: ["alac", "m4a"] },
      { id: "ape",  label: "APE",  ext: ["ape"] },
      { id: "wv",   label: "WV",   ext: ["wv"] },
      { id: "tak",  label: "TAK",  ext: ["tak"] }
    ],
    "Uncompressed": [
      { id: "wav",  label: "WAV",      ext: ["wav"] },
      { id: "aiff", label: "AIFF/AIF", ext: ["aiff", "aif"] },
      { id: "pcm",  label: "PCM",      ext: ["pcm"] },
      { id: "au",   label: "AU",       ext: ["au"] }
    ],
    "High-Resolution / Studio": [
      { id: "dsd", label: "DSD/DSF", ext: ["dsd", "dsf"] },
      { id: "bwf", label: "BWF",     ext: ["bwf", "wav"] }
    ],
    "MIDI & Sequenced": [
      { id: "midi", label: "MID/MIDI",      ext: ["mid", "midi"],              inputOnly: true },
      { id: "mod",  label: "MOD/XM/IT/S3M", ext: ["mod", "xm", "it", "s3m"],   inputOnly: true }
    ],
    "Speech & Telephony": [
      { id: "amr", label: "AMR", ext: ["amr"] },
      { id: "gsm", label: "GSM", ext: ["gsm"] },
      { id: "spx", label: "SPX", ext: ["spx"] }
    ],
    "Playlists & Containers": [
      { id: "m3u", label: "M3U/M3U8", ext: ["m3u", "m3u8"], inputOnly: true },
      { id: "pls", label: "PLS",      ext: ["pls"],         inputOnly: true },
      { id: "cue", label: "CUE",      ext: ["cue"],         inputOnly: true }
    ]
  },
  video: {
    "Common Containers": [
      { id: "mp4",  label: "MP4",      ext: ["mp4"] },
      { id: "mov",  label: "MOV",      ext: ["mov"] },
      { id: "mkv",  label: "MKV",      ext: ["mkv"] },
      { id: "avi",  label: "AVI",      ext: ["avi"] },
      { id: "webm", label: "WEBM",     ext: ["webm"] },
      { id: "flv",  label: "FLV",      ext: ["flv"] },
      { id: "wmv",  label: "WMV",      ext: ["wmv"] },
      { id: "mpg",  label: "MPG/MPEG", ext: ["mpg", "mpeg"] },
      { id: "3gp",  label: "3GP",      ext: ["3gp"] }
    ],
    "Video Codecs": [
      { id: "h264",  label: "H.264/AVC",   ext: ["h264"] },
      { id: "h265",  label: "H.265/HEVC",  ext: ["h265", "hevc"] },
      { id: "h266",  label: "H.266/VVC",   ext: ["h266", "vvc"] },
      { id: "vp9",   label: "VP8/VP9",     ext: ["vp8", "vp9"] },
      { id: "av1",   label: "AV1",         "ext": ["av1"] },
      { id: "mpeg2", label: "MPEG-2",      ext: ["m2v"] },
      { id: "prores",label: "ProRes",      ext: ["mov"] },
      { id: "dnx",   label: "DNxHD/DNxHR", ext: ["dnxhd", "dnxhr"] },
      { id: "divx",  label: "DivX/Xvid",   ext: ["divx", "xvid"] }
    ],
    "Streaming / Adaptive": [
      { id: "hls",  label: "HLS",       ext: ["m3u8", "ts"],   inputOnly: true },
      { id: "dash", label: "DASH",      ext: ["mpd"],          inputOnly: true },
      { id: "ts",   label: "TS/M2TS/MTS",ext: ["ts", "m2ts", "mts"] }
    ],
    "Professional / Broadcast": [
      { id: "mxf", label: "MXF",     ext: ["mxf"] },
      { id: "r3d", label: "R3D",     ext: ["r3d"], inputOnly: true },
      { id: "braw",label: "BRAW",    ext: ["braw"],inputOnly: true },
      { id: "gxf", label: "GXF/LXF", ext: ["gxf", "lxf"] }
    ],
    "Legacy / Misc": [
      { id: "rm",  label: "RM/RMVB", ext: ["rm", "rmvb"] },
      { id: "vob", label: "VOB",     ext: ["vob"] },
      { id: "ogv", label: "OGV",     ext: ["ogv"] },
      { id: "asf", label: "ASF",     ext: ["asf"] },
      { id: "swf", label: "SWF",     ext: ["swf"], inputOnly: true }
    ]
  }
};

/**
 * Resolves a file's format details and top-level category based on its name extension
 */
export function detectFileCategory(fileName: string): { category: CategoryType; format: FormatEntry } | null {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (!ext) return null;

  for (const cat of Object.keys(registry) as CategoryType[]) {
    const subcats = registry[cat];
    for (const sub of Object.keys(subcats)) {
      const entry = subcats[sub].find(item => item.ext.includes(ext));
      if (entry) {
        return { category: cat, format: entry };
      }
    }
  }
  return null;
}

/**
 * Gets target conversion formats for a category, excluding input-only formats.
 */
export function getTargetFormats(category: CategoryType): SubcategoryGroup {
  const subcats = registry[category];
  const filtered: SubcategoryGroup = {};

  for (const key of Object.keys(subcats)) {
    const list = subcats[key].filter(entry => !entry.inputOnly);
    if (list.length > 0) {
      filtered[key] = list;
    }
  }

  return filtered;
}
