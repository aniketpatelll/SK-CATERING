// Saves a file. Chrome and Edge show a "Save as" window so you can pick any folder
// (this avoids "Insufficient permissions" on a locked Downloads folder).
// Other browsers fall back to a normal download.
export async function saveFile(blob, filename, description, mime, ext) {
  if (window.showSaveFilePicker) {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [{ description, accept: { [mime]: [ext] } }],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch (e) {
      if (e.name === "AbortError") return; // you closed the Save window
      // any other problem: try a normal download below
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
